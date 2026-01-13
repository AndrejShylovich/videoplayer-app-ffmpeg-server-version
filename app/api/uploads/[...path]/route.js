import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  const { path: fileSegments } = await params; 

  const filePath = path.join(
    process.cwd(),
    "app",
    "data",
    ...fileSegments
  );

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  let contentType = "application/octet-stream";
  if (ext === ".png") contentType = "image/png";
  if (ext === ".mp4") contentType = "video/mp4";

  return new NextResponse(file, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": file.length.toString(),
    },
  });
}
