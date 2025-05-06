import { jest } from "@jest/globals";
import formatFile from "./formatFile.js";

beforeAll(() => {
  jest.spyOn(console, "log").mockReturnValue();
});

afterAll(() => {
  jest.restoreAllMocks();
});

it("should create a photo post", async () => {
  expect(
    await formatFile((await import("./fixtures/photo-post.json")).default)
  ).toMatchSnapshot();
});

it("should ignore properties from Aaron's post", async () => {
  expect(
    await formatFile(
      (
        await import("./fixtures/aaronparecki_com_lawyer.json")
      ).default
    )
  ).toMatchSnapshot();
});

it("should process find the author in james' post", async () => {
  expect(
    await formatFile(
      (
        await import("./fixtures/jamesg_blog_folder_names.json")
      ).default
    )
  ).toMatchSnapshot();
});

it("should process David's checkin", async () => {
  expect(
    await formatFile(
      (
        await import("./fixtures/david_shanske_com_checkin.json")
      ).default
    )
  ).toMatchSnapshot();
});

it("should modify the content from marty's post", async () => {
  expect(
    await formatFile(
      (
        await import("./fixtures/martymcgui_re_go-time.json")
      ).default
    )
  ).toMatchSnapshot();
});

it("should fill in references from mastodon", async () => {
  expect(
    await formatFile(
      (
        await import("./fixtures/nick_nisi_mastodon.json")
      ).default
    )
  ).toMatchSnapshot();
});

it("should create a listen-of post from an indiekit jam", async () => {
  expect(
    await formatFile((await import("./fixtures/indiekit_jam.json")).default)
  ).toMatchSnapshot();
});

it("should create a listen-of post from sparkles", async () => {
  expect(
    await formatFile((await import("./fixtures/sparkles_listen.json")).default)
  ).toMatchSnapshot();
});

it("should create a read-of post from sparkles", async () => {
  expect(
    await formatFile((await import("./fixtures/sparkles_read.json")).default)
  ).toMatchSnapshot();
});
