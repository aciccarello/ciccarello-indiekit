import express from "express";

const defaultTarget = {
  checked: false,
  name: "IndieNews",
  uid: "https://news.indieweb.org/en",
  service: {
    name: "IndieNews",
    url: "https://news.indieweb.org/en",
  },
};

const defaults = {
  mountPath: "/micropub",
  targets: [defaultTarget],
};

const router = express.Router();

/**
 * Normalize a target config object.
 * @param {Record<string, any>} target
 * @returns {{checked: boolean, name: string, uid: string, service: {name: string, url: string, photo?: string}}}
 */
const normalizeTarget = (target) => {
  const source = target ?? {};
  const checked = source.checked ?? defaultTarget.checked;
  const name = source.name || defaultTarget.name;
  const uid = source.uid || defaultTarget.uid;
  const serviceName = source.service?.name || name;
  const serviceUrl = source.service?.url || uid;

  return {
    checked,
    name,
    uid,
    service: {
      name: serviceName,
      url: serviceUrl,
      photo: source.service?.photo,
    },
  };
};

/**
 * Build normalized syndication target list from options.
 * See https://www.w3.org/TR/micropub/#syndication-targets for the shape of the targets array.
 *
 * @param {Record<string, any>} options
 * @returns {Array<{checked: boolean, name: string, uid: string, service: {name: string, url: string, photo?: string}}>}
 */
const getTargets = (options) => {
  if (Array.isArray(options.targets) && options.targets.length > 0) {
    return options.targets.map(normalizeTarget);
  }

  return defaults.targets.map(normalizeTarget);
};

/**
 * Create syndicator objects for Indiekit registration.
 * The info property is used to provide information about the syndicator,
 * and the syndicate method is called to indicate the location of the syndicated post.
 * @param {Array<{checked: boolean, name: string, uid: string, service: {name: string, url: string}}>} targets
 * @returns {Array<{name: string, info: object, options: {checked: boolean}, syndicate: () => Promise<string>}>}
 */
const createSyndicators = (targets) => {
  return targets.map((target) => ({
    name: `${target.name} syndicator`,
    info: target,
    options: {
      checked: Boolean(target.checked),
    },
    async syndicate() {
      return target.uid;
    },
  }));
};

/**
 * Coerce Micropub field values into a string array.
 * Supports strings and arrays of strings.
 * @param {unknown} value
 * @returns {string[]}
 */
const toStringList = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string");
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
};

/**
 * Merge additions into an existing list while deduplicating exact values.
 * @param {string[]} existing
 * @param {string[]} additions
 * @returns {string[]}
 */
const mergeUniqueValues = (existing, additions) => [
  ...new Set([...existing, ...additions]),
];

/**
 * Derive Micropub action from request query/body.
 * @param {import("express").Request} request
 * @returns {string}
 */
const actionFromRequest = (request) => {
  return request.query.action || request.body?.action || "create";
};

/**
 * Get a Micropub property from either form-encoded or JSON payload shapes.
 *
 * Form-encoded Micropub submits properties at the top level of `body`, while
 * JSON Micropub submits properties under `body.properties`.
 * @param {Record<string, any> | undefined} body
 * @param {string} property
 * @returns {unknown}
 */
const getProperty = (body, property) => {
  return body?.[property] ?? body?.properties?.[property];
};

/**
 * Write syndicated URL(s) to either top-level or MF2-style properties.
 * @param {Record<string, any> | undefined} body
 * @param {string[]} value
 * @returns {void}
 */
const writeSyndication = (body, value) => {
  if (body?.properties) {
    body.properties.syndication = value;
    return;
  }

  body.syndication = value;
};

/**
 * Build create-request middleware that maps
 * from `mp-syndicate-to` to persistent `syndication` values.
 * @param {string[]} targetUids
 * @returns {import("express").RequestHandler}
 */
const preprocess = (targetUids) => {
  return (request, response, next) => {
    const action = actionFromRequest(request);
    if (request.method !== "POST" || action !== "create") {
      return next();
    }

    const requestedTargets = toStringList(
      getProperty(request.body, "mp-syndicate-to"),
    );

    const selectedTargets = requestedTargets.filter((target) =>
      targetUids.includes(target),
    );

    if (selectedTargets.length === 0) {
      return next();
    }

    // The spec does reference a "syndication" property for existing syndicated URLs,
    // but it is not likely to be used
    const currentSyndication = toStringList(
      getProperty(request.body, "syndication"),
    );
    const syndication = mergeUniqueValues(currentSyndication, selectedTargets);
    writeSyndication(request.body, syndication);

    return next();
  };
};

/**
 * Build create-request middleware that maps selected target(s)
 * from `mp-syndicate-to` to persistent `syndication` values.
 *
 * This allows setting a syndication target in the request body without requiring
 * the entry to be updated later with the mp-syndicate-to value.
 * This also allows syndication without a database configured.
 */
export default class MicropubSyndicationEndpoint {
  name = "Micropub syndication preprocessor";

  constructor(options = {}) {
    this.options = { ...defaults, ...options };
    this.targets = getTargets(this.options);
    this.syndicators = createSyndicators(this.targets);
    this.targetUids = this.targets.map((target) => target.uid);
    this.mountPath = this.options.mountPath;
  }

  get routesPublic() {
    router.post("/", preprocess(this.targetUids));
    return router;
  }

  init(Indiekit) {
    Indiekit.addEndpoint(this);
    Indiekit.addSyndicator(this.syndicators);
  }
}
