import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";

// Мокаем fs
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
  },
  existsSync: vi.fn(),
}));

import fs from "fs";

describe("validateVideoPath", () => {
  const cwd = "/project";
  const validFile = path.join("app", "data", "video.mp4");

  let validateVideoPath;

  beforeEach(async () => {
    vi.resetModules();
    vi.spyOn(process, "cwd").mockReturnValue(cwd);

    ({ validateVideoPath } = await import(
      "../../app/lib/validateVideoPath.js"
    ));
  });

  it("throws if file does not exist", () => {
    fs.existsSync.mockReturnValue(false);

    expect(() =>
      validateVideoPath(validFile)
    ).toThrow("File not found");
  });

  it("throws if file extension is not .mp4", () => {
    fs.existsSync.mockReturnValue(true);

    const invalidFile = path.join("app", "data", "video.avi");

    expect(() =>
      validateVideoPath(invalidFile)
    ).toThrow("Invalid file type");
  });

  it("returns resolved path for valid mp4 file", () => {
    fs.existsSync.mockReturnValue(true);

    const result = validateVideoPath(validFile);

    expect(result).toBe(
      path.resolve(cwd, "app", "data", "video.mp4")
    );
  });
});
