// @ts-check
import { stringify } from "yaml";

const mastodonTitleUserRegex = /^(.*)\((@[\w\.]+@[\w\.]+)\)$/;
const mastodonUserProfileRegex = /^https?:\/\/[\w\.]+\/@[\w\.]+/;

export default async function formatFile(properties) {
  try {
    console.log(
      "Processing postTemplate",
      JSON.stringify(properties, undefined, "\t")
    );
    let postContent;
    if (properties.content) {
      postContent =
        properties.content.text ||
        properties.content.html ||
        properties.content;
      postContent = `${postContent}\n`;
    } else {
      postContent = "";
    }

    const listenOf = properties["listen-of"] ?? properties["jam-of"];
    if (listenOf) {
      // The indiekit jam type doesn't include the name of the song in the content
      // Sparkles includes it in a summary property but we don't use that
      if (
        !postContent.substring(0, 20).toLowerCase().includes("listen") &&
        listenOf.name &&
        listenOf.author
      ) {
        const listenOfName = listenOf.url
          ? `[${listenOf.name}](${listenOf.url})`
          : listenOf.name;
        postContent = `Listening to ${listenOfName} by ${listenOf.author}.\n\n${postContent}`;
      }
      // Nither indiekit nor Sparkles include the emoji prefix
      if (!postContent.includes("🎵")) {
        postContent = `🎵 ${postContent}`;
      }

      if (!properties.category?.includes("jam")) {
        properties.category = properties.category ?? [];
        properties.category.push("jam");
      }
    }

    if (properties["read-of"]) {
      // Feels a little hacky to put this in the title but I'm short on ideas
      // Can reconsider in the future
      if (properties.summary && !properties.name) {
        properties.name = properties.summary;
        properties.summary = undefined;
      }
    }

    const {
      published,
      deleted,
      photo: photoProperty,
      references: referencesMap = {},
    } = properties;

    let photo = Array.isArray(photoProperty)
      ? photoProperty.shift()
      : photoProperty;

    const { url: image, alt: image_alt, ...image_other } = photo || {};

    // Try to normalize references to fix common errors on people's sites
    /** @type {any[] | undefined} */
    let references = Object.entries(referencesMap).map(([url, ref]) => {
      let entry = ref;
      if (!entry.type && entry.children) {
        // Find main entry
        entry = entry.children.find(({ type }) => type === "entry");
      }
      if (!entry) {
        console.warn("Entry not found on referenced page", url, ref);
        return ref;
      }
      let { name, author, content, summary, "post-type": postType } = entry;
      if (!author) {
        // Assume top level card is the author
        author = entry.children?.find(({ type }) => type === "card");
      }
      if (!author) {
        // Assume top level card is the author
        author = ref?.children?.find(({ type }) => type === "card");
      }
      if (!author && name) {
        const authorNameParts = mastodonTitleUserRegex.exec(name);
        const authorProfileUrl = mastodonUserProfileRegex.exec(url);

        if (authorNameParts) {
          const [_, authorName, username] = authorNameParts;
          const [authorUrl] = authorProfileUrl ?? [undefined];

          author = {
            type: "card",
            name: authorName.trim(),
            nickname: username,
            url: authorUrl,
          };
          name = undefined;
        }
      }

      if (!content && summary) {
        content = summary;
      }
      if (content?.text) {
        // Don't need both the HTML and text representation of content
        content = content.text;
      }
      if (content?.length > 500) {
        content = content.slice(0, 500) + "…";
      }

      // Whitelist what properties to include
      // Some sites include extra properties like comments that I don't need
      const { type, published, updated } = entry;

      return {
        /* URL referenced by like/reply including any params */
        referenceIdUrl: url,
        /* URL defined by the microformats or metaformats entry */
        url: ref.url ?? url,
        name,
        "post-type": postType,
        type,
        published,
        updated,
        author,
        // TODO: Should this be summary rather than content?
        content,
      };
    });
    if (references.length == 0) {
      references = undefined;
    }
    const slug = properties.slug ?? properties["mp-slug"];
    const eleventyExcludeFromCollectionsReason = deleted
      ? "deleted"
      : properties["post-status"] === "draft"
      ? "draft"
      : properties.visibility === "public"
      ? undefined
      : properties.visibility;

    properties = {
      date: published,
      updated: properties.updated,
      // TODO: Check how visibility is set
      eleventyExcludeFromCollections: eleventyExcludeFromCollectionsReason
        ? true
        : undefined,
      eleventyExcludeFromCollectionsReason,
      // Ignore title from micropub-like endpoint
      title: ["like"].includes(properties["post-type"])
        ? undefined
        : properties.name,
      slug,
      "bookmark-of": properties["bookmark-of"],
      "like-of": properties["like-of"],
      "repost-of": properties["repost-of"],
      "listen-of": listenOf,
      "read-of": properties["read-of"],
      "in-reply-to": properties["in-reply-to"],
      rating: properties.rating,
      tags: properties.category,
      image,
      image_alt,
      references,

      // Untested properties
      image_other: Object.keys(image_other).length ? image_other : undefined,
      indiekit_excerpt: properties.summary,
      indiekit_start: properties.start,
      indiekit_end: properties.end,
      indiekit_rsvp: properties.rsvp,
      indiekit_location: properties.location,
      indiekit_checkin: properties.checkin,
      indiekit_audio: properties.audio,
      indiekit_video: properties.video,

      "indiekit_post-type": properties["post-type"],
      syndication: properties.syndication,
      "mp-syndicate-to": properties["mp-syndicate-to"],
    };

    return `---
${stringify(properties)}---

${postContent}
`;
  } catch (error) {
    console.error("Problem generating post file content", error, properties);
    throw new Error(
      "Unable to create post file contents. See logs for details"
    );
  }
}
