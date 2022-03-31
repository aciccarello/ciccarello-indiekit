import _ from 'lodash';
import {Indiekit} from '@indiekit/indiekit';
import {JekyllPreset} from '@indiekit/preset-jekyll';
import { GithubStore } from "@indiekit/store-github";
import { TwitterSyndicator } from "@indiekit/syndicator-twitter";

// New indiekit instance
const indiekit = new Indiekit();

// Configure publication preset
const jekyll = new JekyllPreset();

// Configure content store
const github = new GithubStore({
  user: "aciccarello",
  repo: "ciccarello.me",
  branch: "dev",
});

// Configure Twitter syndicator
const twitter = new TwitterSyndicator({
  checked: true,
  forced: true,
  user: "ajciccarello",
});

const postTypes = [
  {
    type: "article",
    name: "Article",
    post: {
      path: "_posts/blog/{yyyy}-{MM}-{dd}/{slug}.md",
      url: "blog/{yyyy}/{MM}/{dd}/{slug}/",
    },
    media: {
      path: "src/articles/{yyyy}/{MM}/{slug}/{filename}",
      url: "{yyyy}/{MM}/{slug}/{filename}",
    },
  },
  {
    type: "note",
    name: "Note",
    post: {
      path: "src/notes/{t}.md",
      url: "notes/{t}/",
    },
  },
  {
    type: "photo",
    name: "Photo",
    post: {
      path: "src/photos/{t}.md",
      url: "photos/{t}/",
    },
    media: {
      path: "src/media/{t}.{ext}",
      url: "media/{t}.{ext}",
    },
  },
  {
    type: "bookmark",
    name: "Bookmark",
    post: {
      path: "src/bookmarks/{yyyy}-{MM}-{dd}-{slug}.md",
      url: "bookmarks/{yyyy}/{MM}/{slug}/",
    },
  },
  {
    type: "reply",
    name: "Reply",
    post: {
      path: "src/replies/{t}.md",
      url: "replies/{t}/",
    },
  },
];

// Publication settings
indiekit.set(
  "publication.categories",
  // TODO: Add json file to site
  // "https://www.ciccarello.me/categories/index.json"
  ["technology", "foster care", "personal", "travel"]
);
indiekit.set("publication.me", "https://www.ciccarello.me");
indiekit.set("publication.postTypes", postTypes);
indiekit.set("publication.preset", jekyll);
indiekit.set("publication.store", github);
indiekit.set("application.themeColor", "#d50000");
indiekit.set("publication.syndicationTargets", [twitter]);

// Server
const server = indiekit.server();

export default server;
