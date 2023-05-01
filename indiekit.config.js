// @ts-check
require("dotenv").config();

// Configure content store
let store;
let mongodbUrl;
let baseUrl;
switch (process.env.NODE_ENV) {
  case "production":
    store = {
      name: "@indiekit/store-github",
      user: "aciccarello",
      repo: "ciccarello.me",
      branch: "dev", // Will change this to "main" when production ready
    };
    baseUrl = "https://www.ciccarello.me";
  case "development":
    store = {
      name: "@indiekit/store-github",
      user: "aciccarello",
      repo: "ciccarello.me",
      branch: "dev",
    };
    baseUrl = "https://dev.ciccarello.me";
  default:
    store = {
      name: "@indiekit/store-file-system",
      directory: process.env.SITE_DIRECTORY,
    };
    mongodbUrl =
      "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=indiekit";
    baseUrl = "http://localhost:8080";
}
console.log(
  `Running in ${process.env.NODE_ENV || "local"} environment. Saving to`,
  store.name
);

module.exports = {
  plugins: [store.name],
  application: { themeColor: "#af1e0b", mongodbUrl },
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
      { type: "recipe" },
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
    ].map((typeConfig) => ({
      name: typeConfig.type[0].toUpperCase() + typeConfig.type.slice(1),
      ...typeConfig,
      post: {
        path: `_posts/${
          typeConfig.post?.path ?? typeConfig.type + "s"
        }/{yyyy}-{MM}-{dd}-{slug}.md`,
        url: `${typeConfig.post?.url ?? "posts"}/{yyyy}/{MM}/{dd}/{slug}`,
      },
      media: {
        path: "assets/img/{filename}" /*, url: "/assets/img/{filename}"*/,
      },
    })),

    postTemplate: require("./src/formatFile"),
  },
  [store.name]: store,
};
