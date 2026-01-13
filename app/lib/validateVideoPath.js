import path from "path";
import fs from "fs";

// Root directory where uploaded videos are stored
const uploadsDir = path.resolve(process.cwd(), "app", "data");

/**
 * Validates that a given file path points to a legitimate MP4
 * video inside the uploads directory.
 */

export function validateVideoPath(filePath) {
  // Ensure a non-empty string is provided
  if (!filePath || typeof filePath !== "string") {
    throw new Error("Invalid filePath");
  }

  // Resolve to absolute path
  const resolvedPath = path.resolve(filePath);

  // Prevent directory traversal: must stay inside uploads directory
  if (!resolvedPath.startsWith(uploadsDir + path.sep)) {
    throw new Error("Access outside uploads directory");
  }

  // Check that the file actually exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error("File not found");
  }

  // Only allow MP4 files
  if (path.extname(resolvedPath).toLowerCase() !== ".mp4") {
    throw new Error("Invalid file type");
  }

  return resolvedPath;
}
