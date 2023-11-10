import { jest } from "@jest/globals";
import config from "../indiekit.config";

beforeAll(() => {
  jest.spyOn(console, "log").mockReturnValue();
});

afterAll(() => {
  jest.restoreAllMocks();
});

it("should be able to import the config without failing", async () => {
  expect(config).toMatchSnapshot();
});
