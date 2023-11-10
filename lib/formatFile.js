// @ts-check
import { stringify } from "yaml";
// import htmlMetadata from "html-metadata";

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
    const references = Object.entries(referencesMap).map(([url, ref]) => {
      let entry = ref;
      if (!entry.type && entry.children) {
        // Find main entry
        entry = entry.children.find(({ type }) => type === "entry");
      }
      if (!entry) {
        console.warn("Entry not found on referenced page", ref.url, ref);
        return ref;
      }
      let { author, content, "post-type": postType } = entry;
      if (!author) {
        // Assume top level card is the author
        author = entry.children?.find(({ type }) => type === "card");
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

      return {
        url: ref.url ?? url,
        name,
        "post-type": postType,
        type,
        published,
        updated,
        author,
        content,
      };
    });

    // Retrieve missing metadata using opengraph
    /*
    const possibleReferences = Array.from(
      new Set([
        properties["bookmark-of"],
        properties["like-of"],
        properties["repost-of"],
        properties["in-reply-to"],
      ])
    )
      .filter((url) => url && !references?.find((refUrl) => url === refUrl))
      .map(async (url) => {
        try {
          const metadata = {}; // await htmlMetadata(url);
          console.log("Found the following metadata for url", url, metadata);
          const { general, jsonLd, openGraph } = metadata;
          const authorName =
            jsonLd?.author?.name || general?.author || openGraph?.author;
          // Look for Mastodon user name in title
          // Identify by suffix of (@username@domain.com)
          // Exclude :emoji: codes
          openGraph?.title
            ?.match(/([^:\n]*)(?:\:?.*\:?) \(@.+@.+\)/)?.[1]
            ?.trim?.();
          const authorUrl = jsonLd?.author?.url;
          const author =
            authorName || authorUrl
              ? { name: authorName, url: authorUrl }
              : undefined;

          let content =
            jsonLd?.description ||
            openGraph?.description ||
            general?.description;
          if (content?.length > 500) {
            content = content.slice(0, 500) + "…";
          }

          references.push({
            url,
            name: (
              jsonLd?.headline ||
              openGraph?.title ||
              general?.title
            )?.split("|")?.[0],
            published: jsonLd?.datePublished || openGraph?.published_time,
            updated: jsonLd?.dateModified || openGraph?.modified_time,
            author,
            content,
          });
        } catch (e) {
          console.warn(
            `Unable to scrape URL ${url} because an error was encountered`,
            e
          );
        }
      });
    await Promise.all(possibleReferences);
    */

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
}
