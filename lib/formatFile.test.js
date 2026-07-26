import { jest } from "@jest/globals";
import formatFile from "./formatFile.js";

const formatFixture = async (name) => {
  const fixture = (
    await import(`./fixtures/${name}.json`, {
      with: { type: "json" },
    })
  ).default;

  return formatFile(fixture);
};

beforeAll(() => {
  jest.spyOn(console, "log").mockReturnValue();
});

afterAll(() => {
  jest.restoreAllMocks();
});

it("should create a photo post", async () => {
  expect(await formatFixture("photo-post")).toMatchSnapshot();
});

it("should ignore properties from Aaron's post", async () => {
  expect(await formatFixture("aaronparecki_com_lawyer")).toMatchSnapshot();
});

it("should process find the author in james' post", async () => {
  expect(await formatFixture("jamesg_blog_folder_names")).toMatchSnapshot();
});

it("should process David's checkin", async () => {
  expect(await formatFixture("david_shanske_com_checkin")).toMatchSnapshot();
});

it("should modify the content from marty's post", async () => {
  expect(await formatFixture("martymcgui_re_go-time")).toMatchSnapshot();
});

it("should format Dan Q blog post reference", async () => {
  expect(
    await formatFixture("danq_me_you_dont_have_to_blog_like_me")
  ).toMatchSnapshot();
});

it("should fill in references from mastodon", async () => {
  expect(await formatFixture("nick_nisi_mastodon")).toMatchSnapshot();
});

it("should create a listen-of post from an indiekit jam", async () => {
  expect(await formatFixture("indiekit_jam")).toMatchSnapshot();
});

it("should create a listen-of post from sparkles", async () => {
  expect(await formatFixture("sparkles_listen")).toMatchSnapshot();
});

it("should create a read-of post from sparkles", async () => {
  expect(await formatFixture("sparkles_read")).toMatchSnapshot();
});

it("should include provided syndication value", async () => {
  const output = await formatFile({
    published: "2026-07-10T00:00:00.000Z",
    "post-type": "note",
    syndication: "https://news.indieweb.org/en",
    content: "Hello world",
  });

  expect(output).toContain("syndication:\n  - https://news.indieweb.org/en");
});

it("should ignore mp-syndicate-to", async () => {
  const output = await formatFile({
    published: "2026-07-10T00:00:00.000Z",
    "post-type": "note",
    "mp-syndicate-to": ["https://news.indieweb.org/en"],
    content: "Hello world",
  });

  expect(output).not.toContain(
    "mp-syndicate-to:\n  - https://news.indieweb.org/en",
  );
  expect(output).not.toContain(
    "syndication:\n  - https://news.indieweb.org/en",
  );
});
