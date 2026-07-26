import { jest } from "@jest/globals";

let MiddlewareClass;

beforeEach(async () => {
  jest.resetModules();
  ({ default: MiddlewareClass } = await import("./index.js"));
});

afterEach(() => {
  jest.restoreAllMocks();
});

const runMiddleware = (plugin, request) => {
  const middleware = plugin.routesPublic.stack[0].handle;
  return new Promise((resolve) => {
    middleware(request, {}, resolve);
  });
};

it("adds syndication for form-encoded create requests", async () => {
  const plugin = new MiddlewareClass();
  const request = {
    method: "POST",
    query: {},
    body: {
      "mp-syndicate-to": ["https://news.indieweb.org/en"],
    },
  };

  await runMiddleware(plugin, request);

  expect(request.body.syndication).toEqual(["https://news.indieweb.org/en"]);
});

it("adds syndication for JSON create requests", async () => {
  const plugin = new MiddlewareClass();
  const request = {
    method: "POST",
    query: {},
    body: {
      type: ["h-entry"],
      properties: {
        "mp-syndicate-to": ["https://news.indieweb.org/en"],
      },
    },
  };

  await runMiddleware(plugin, request);

  expect(request.body.properties.syndication).toEqual([
    "https://news.indieweb.org/en",
  ]);
});

it("ignores non-create actions", async () => {
  const plugin = new MiddlewareClass();
  const request = {
    method: "POST",
    query: { action: "update" },
    body: {
      "mp-syndicate-to": ["https://news.indieweb.org/en"],
    },
  };

  await runMiddleware(plugin, request);

  expect(request.body.syndication).toBeUndefined();
});

it("exposes IndieNews syndication target info", async () => {
  const plugin = new MiddlewareClass({
    targets: [
      {
        checked: true,
        name: "IndieNews",
        uid: "https://news.indieweb.org/en",
      },
    ],
  });

  expect(plugin.syndicators[0].info).toEqual({
    checked: true,
    name: "IndieNews",
    uid: "https://news.indieweb.org/en",
    service: {
      name: "IndieNews",
      url: "https://news.indieweb.org/en",
    },
  });
});

it("registers both endpoint and syndicator", async () => {
  const plugin = new MiddlewareClass();
  const Indiekit = {
    addEndpoint: jest.fn(),
    addSyndicator: jest.fn(),
  };

  plugin.init(Indiekit);

  expect(Indiekit.addEndpoint).toHaveBeenCalledWith(plugin);
  expect(Indiekit.addSyndicator).toHaveBeenCalledTimes(1);
  expect(Indiekit.addSyndicator.mock.calls[0][0]).toHaveLength(1);
  expect(Indiekit.addSyndicator.mock.calls[0][0][0].info.uid).toBe(
    "https://news.indieweb.org/en",
  );
});

it("adds all selected configured targets to syndication", async () => {
  const plugin = new MiddlewareClass({
    targets: [
      {
        checked: false,
        name: "IndieNews",
        uid: "https://news.indieweb.org/en",
        service: {
          name: "IndieNews",
          url: "https://news.indieweb.org/en",
        },
      },
      {
        checked: false,
        name: "Example",
        uid: "https://example.com/syndicate",
        service: {
          photo: "https://example.com/syndicate.png",
        },
      },
    ],
  });

  const request = {
    method: "POST",
    query: {},
    body: {
      "mp-syndicate-to": [
        "https://news.indieweb.org/en",
        "https://example.com/syndicate",
      ],
    },
  };

  await runMiddleware(plugin, request);

  expect(request.body.syndication).toEqual([
    "https://news.indieweb.org/en",
    "https://example.com/syndicate",
  ]);
});

it("defaults service fields from name and uid in targets config", async () => {
  const plugin = new MiddlewareClass({
    targets: [
      {
        checked: false,
        name: "Example",
        uid: "https://example.com/syndicate",
      },
    ],
  });

  expect(plugin.syndicators[0].info).toEqual({
    checked: false,
    name: "Example",
    uid: "https://example.com/syndicate",
    service: {
      name: "Example",
      url: "https://example.com/syndicate",
    },
  });
});

it("defaults service fields from name and uid in targets config with a photo", async () => {
  const plugin = new MiddlewareClass({
    targets: [
      {
        checked: false,
        name: "Example",
        uid: "https://example.com/syndicate",
        service: {
          photo: "https://example.com/syndicate.png",
        },
      },
    ],
  });

  expect(plugin.syndicators[0].info).toEqual({
    checked: false,
    name: "Example",
    uid: "https://example.com/syndicate",
    service: {
      name: "Example",
      url: "https://example.com/syndicate",
      photo: "https://example.com/syndicate.png",
    },
  });
});
