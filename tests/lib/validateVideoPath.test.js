import { describe, it, expect, beforeAll, afterAll } from "vitest";
import path from "path";
import fs from "fs";
import { validateVideoPath } from "../../app/lib/validateVideoPath";

const uploadsDir = path.resolve(process.cwd(), "uploads");
const testVideoPath = path.join(uploadsDir, "test.mp4");
const testTxtPath = path.join(uploadsDir, "test.txt");

describe("validateVideoPath", () => {
  beforeAll(() => {
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(testVideoPath, "fake video content");
    fs.writeFileSync(testTxtPath, "not a video");
  });

  afterAll(() => {
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  });

  it("returns resolved path for valid mp4 file inside uploads", () => {
    const result = validateVideoPath(testVideoPath);
    expect(result).toBe(path.resolve(testVideoPath));
  });

  it("throws if filePath is missing", () => {
    expect(() => validateVideoPath()).toThrow("Invalid filePath");
  });

  it("throws if filePath is not a string", () => {
    expect(() => validateVideoPath(123)).toThrow("Invalid filePath");
  });

  it("throws if path traversal is attempted", () => {
    const evilPath = path.join(uploadsDir, "..", "secret.mp4");
    expect(() => validateVideoPath(evilPath)).toThrow(
      "Access outside uploads directory"
    );
  });

  it("throws if file does not exist", () => {
    const missingPath = path.join(uploadsDir, "missing.mp4");
    expect(() => validateVideoPath(missingPath)).toThrow("File not found");
  });

  it("throws if file extension is not mp4", () => {
    expect(() => validateVideoPath(testTxtPath)).toThrow("Invalid file type");
  });
});
