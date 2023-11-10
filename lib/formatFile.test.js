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

xit("should fill in references from mastodon", async () => {
  // htmlMetadataMock.mockResolvedValue(
  //   require("./fixtures/nick_nisi_mastodon.json")
  // );

  expect(
    await formatFile({
      type: "entry",
      "post-type": "like",
      "like-of": "https://fediverse.nicknisi.com/@nicknisi/109991177881690708",
      visibility: "public",
      "post-status": "draft",
      "mp-slug": "abcd",
      published: "2023-04-29T06:00:13.378Z",
      url: "http://localhost:8080/posts/2023/04/29/abcd",
    })
  ).toMatchSnapshot();
});
