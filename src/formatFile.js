// @ts-check
const { stringify } = require("yaml");

module.exports = function formatFile(properties) {
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

    const { published, deleted, photo, references } = properties;

    const { url: image, alt: image_alt, ...image_other } = photo || {};

    // Try to normalize references to fix common errors on people's sites
    for (const url in references) {
      let entry = references[url];
      if (!entry.type && entry.children) {
        // Find main entry
        entry = entry.children.find(({ type }) => type === "entry");
      }
      if (!entry) {
        console.warn("Entry not found on referenced page", url, entry);
        break;
      }
      let { author, content } = entry;
      if (!author) {
        // Assume top level card is the author
        author = references[url].children.find(({ type }) => type === "card");
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
      const { name, type, published, updated } = entry;

      references[url] = {
        url,
        name,
        type,
        published,
        updated,
        author,
        content,
      };
    }

    properties = {
      date: published,
      updated: properties.updated,
      // TODO: Check how visibility is set
      eleventyExcludeFromCollections: deleted
        ? "deleted"
        : properties["post-status"] === "draft"
        ? "draft"
        : properties.visibility === "public"
        ? undefined
        : properties.visibility,
      title: properties.name,
      slug: properties["mp-slug"],
      "bookmark-of": properties["bookmark-of"],
      "like-of": properties["like-of"],
      "repost-of": properties["repost-of"],
      "in-reply-to": properties["in-reply-to"],
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
${stringify(properties)}
---

${postContent}
`;
  } catch (error) {
    console.error("Problem generating post file content", error, properties);
    throw new Error(
      "Unable to create post file contents. See logs for details"
    );
  }
};
