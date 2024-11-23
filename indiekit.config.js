// @ts-check
import process from "node:process";
import * as dotenv from "dotenv";
import postTemplate from "./lib/formatFile.js";

dotenv.config();

// Configure content store
let store;
let baseUrl;
/** @type {Partial<Record<'mongodbUrl' | 'authorizationEndpoint' | 'tokenEndpoint', string>>} */
let applicationConfig = {};

if (process.env.USE_INDIEAUTH) {
  applicationConfig.authorizationEndpoint = "https://indieauth.com/auth";
  applicationConfig.tokenEndpoint = "https://tokens.indieauth.com/token";
}
switch (process.env.NODE_ENV) {
  case "production":
    store = {
      name: "@indiekit/store-github",
      user: "aciccarello",
      repo: "ciccarello.me",
      branch: "main",
    };
    baseUrl = "https://www.ciccarello.me";

    break;
  case "development":
    store = {
      name: "@indiekit/store-github",
      user: "aciccarello",
      repo: "ciccarello.me",
      branch: "dev",
    };
    baseUrl = "https://dev.ciccarello.me";

    break;
  default:
    store = {
      name: "@indiekit/store-file-system",
      directory: process.env.SITE_DIRECTORY,
    };
    applicationConfig.mongodbUrl =
      "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=indiekit";
    baseUrl = "http://localhost:8080";
}
console.log(
  `Running in ${process.env.NODE_ENV || "local"} environment. Saving to`,
  store
);

const config = {
  plugins: [store.name, "@indiekit/endpoint-media"],
  application: {
    themeColor: "#af1e0b",
    ...applicationConfig,
  },
  publication: {
    me: baseUrl,
    categories: baseUrl + "/posts/tags/index.json",
    enrichPostData: true,
    postTypes: [
      {
        type: "article",
        name: "Blog",
        post: {
          path: "blog",
          url: "blog",
        },
      },
      {
        // Unfortunately this gets saved as a photo because of the lack of a post type discovery field
        type: "recipe",
        h: "recipe",
        fields: {
          name: { required: true },
          content: { required: true },
          date: { required: true },
          photo: {},
          category: {},
          visibility: {},
        },
      },
      { type: "photo" },
      { type: "note" },
      {
        type: "reply",
        post: {
          path: "replies",
        },
      },
      {
        type: "like",
        post: {
          path: "links",
        },
      },
      {
        type: "bookmark",
        post: {
          path: "links",
        },
      },
    ].reduce((combinedConfig, { type, ...typeConfig }) => {
      combinedConfig[type] = {
        name: type[0].toUpperCase() + type.slice(1),
        ...typeConfig,
        post: {
          path: `posts/${
            typeConfig.post?.path ?? type + "s"
          }/{yyyy}-{MM}-{dd}-{slug}.md`,
          url: `${typeConfig.post?.url ?? "posts"}/{yyyy}/{MM}/{dd}/{slug}`,
        },
        media: {
          path: `assets/img/${
            type == "recipe" ? "recipe-ik" : "{yyyy}-{DDD}"
          }-{filename}`,
        },
      };
      return combinedConfig;
    }, {}),

    postTemplate,
  },
  [store.name]: store,
  "@indiekit/endpoint-media": {
    imageProcessing: {
      // See https://sharp.pixelplumbing.com/api-resize for options
      resize: {
        width: 2048,
        fit: "inside",
        withoutEnlargement: true,
      },
    },
  },
};

export default config;
