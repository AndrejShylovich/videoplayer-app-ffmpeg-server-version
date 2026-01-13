import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

/**
 * POST /api/upload-video
 *
 * Handles video file upload via multipart/form-data.
 * Saves uploaded MP4 files to the server with a unique name.
 *
 * Request: multipart/form-data with field "videoFile"
 * Response:
 *  - { success: true, filePath: string } - Path to saved video
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get("videoFile");

    // Validate file
    if (!videoFile) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Generate unique filename
    const fileName = randomUUID() + ".mp4";
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "app", "data", "video");
    
    fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    // Save file to disk
    await writeFile(filePath, Buffer.from(await videoFile.arrayBuffer()));

    return NextResponse.json({ success: true, filePath });
  } catch (err) {
    console.error("[UPLOAD] Error:", err);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
