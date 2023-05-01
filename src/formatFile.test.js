const formatFile = require("./formatFile.js");

beforeAll(() => {
  jest.spyOn(console, "log").mockReturnValue();
});

afterAll(() => {
  jest.restoreAllMocks();
});

it("should ignore properties from Aaron's post", () => {
  expect(formatFile(require("./fixtures/aaronparecki_com_lawyer.json")))
    .toMatchInlineSnapshot(`
"---
date: 2023-04-28T06:39:26.637Z
eleventyExcludeFromCollections: draft
slug: aaron-lawyer
like-of: https://aaronparecki.com/2023/04/24/8/lawyer
references:
  https://aaronparecki.com/2023/04/24/8/lawyer:
    url: https://aaronparecki.com/2023/04/24/8/lawyer
    type: entry
    published: 2023-04-24T14:12:20-07:00
    author:
      type: card
      url: https://aaronparecki.com/
      photo:
        - alt: Aaron Parecki
          url: https://aaronparecki.com/images/profile.jpg
      name: Aaron Parecki
    content: In retrospect, I probably didn't need to include "but I am not a
      lawyer" in an email to our lawyers
indiekit_post-type: like

---


"
`);
});

it("should process find the author in james' post", () => {
  expect(formatFile(require("./fixtures/jamesg_blog_folder_names.json"))).
toMatchInlineSnapshot(`
"---
date: 2023-04-29T06:00:13.378Z
eleventyExcludeFromCollections: draft
slug: abcd
like-of: https://jamesg.blog/2023/04/18/source-code-folder-names/
references:
  https://jamesg.blog/2023/04/18/source-code-folder-names/:
    url: https://jamesg.blog/2023/04/18/source-code-folder-names/
    name: My source code root folder name
    type: entry
    published: 2023-04-18T00:00:00
    author:
      type: card
      name: James' Coffee Blog ☕
      url: https://jamesg.blog
    content: >-
      I like seeing what people call the root folder in which they store their
      source code. This is the folder where all — or a lot of — your projects
      are stored. In my case, my programming projects go in a folder called src.
      (Although I have a strange habit of nesting personal projects that are
      related to each other. I believe my source code files are in need of a
      spring clean.)

      That long parenthetical notwithstanding, I find the name src cool. It’s a short way of saying source code; apt, simple, eas…
indiekit_post-type: like

---


"
`);
});

it("should process David's checkin", () => {
  expect(formatFile(require("./fixtures/david_shanske_com_checkin.json"))).
toMatchInlineSnapshot(`
"---
date: 2023-04-28T06:46:25.459Z
eleventyExcludeFromCollections: draft
title: David's Checkin
slug: davids-checkin
bookmark-of: https://david.shanske.com/2022/11/12/5771/
references:
  https://david.shanske.com/2022/11/12/5771/:
    url: https://david.shanske.com/2022/11/12/5771/
    type: entry
    published: 2022-11-12T21:18:14-05:00
    author:
      type: card
      name: David Shanske
      url: https://david.shanske.com/
      photo: https://david.shanske.com/avatar/dshanske?s=42
indiekit_post-type: bookmark

---


"
`);
});

it("should modify the content from marty's post", () => {
  expect(formatFile(require("./fixtures/martymcgui_re_go-time.json"))).
toMatchInlineSnapshot(`
"---
date: 2023-05-01T00:03:00.564Z
title: Go time time
slug: go-again-time
bookmark-of: https://martymcgui.re/2023/03/19/go-time/
references:
  https://martymcgui.re/2023/03/19/go-time/:
    url: https://martymcgui.re/2023/03/19/go-time/
    name: Go Time
    type: entry
    published: 2023-03-19T13:14:22-0400
    author:
      type: card
      name: Marty McGuire
      url: https://martymcgui.re/
      photo:
        - alt: Marty McGuire
          url: https://martymcgui.re/images/logo.jpg
    content: >-
      This is one of those posts about a tech issue comes up from time to time
      for me that I find difficult to search for. Sorry (not sorry) if it is not
      helpful to anyone else!

        Too much context about my site building process

        

      My site is built with Hugo, a static site generator known for being quite fast, and with a powerful (and challenging) templating system.

      I use my site for lots of stuff, which sometimes means showing content from other sites in my posts. For example:

        
          Responses that…
indiekit_post-type: bookmark

---


"
`);
});
