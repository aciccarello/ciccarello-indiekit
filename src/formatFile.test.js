const formatFile = require("./formatFile.js");
const htmlMetadataMock = require("html-metadata");
jest.mock("html-metadata", () => jest.fn().mockResolvedValue({}));

beforeAll(() => {
  jest.spyOn(console, "log").mockReturnValue();
});

afterAll(() => {
  jest.restoreAllMocks();
});

it("should ignore properties from Aaron's post", async () => {
  expect(
    await formatFile(require("./fixtures/aaronparecki_com_lawyer.json"))
  ).toMatchSnapshot();
});

it("should process find the author in james' post", async () => {
  expect(
    await formatFile(require("./fixtures/jamesg_blog_folder_names.json"))
  ).toMatchSnapshot();
});

it("should process David's checkin", async () => {
  expect(
    await formatFile(require("./fixtures/david_shanske_com_checkin.json"))
  ).toMatchSnapshot();
});

it("should modify the content from marty's post", async () => {
  expect(
    await formatFile(require("./fixtures/martymcgui_re_go-time.json"))
  ).toMatchSnapshot();
});

it("should fill in references from mastodon", async () => {
  htmlMetadataMock.mockResolvedValue(
    require("./fixtures/nick_nisi_mastodon.json")
  );

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
