import path from "path";
import { NextResponse } from "next/server";
import { tmpdir } from "os";
import { writeFile, readFile, unlink } from "fs/promises";

const ffmpeg = require("fluent-ffmpeg");

export async function POST(request) {
  try {
    const formData = await request.formData();

    const videoBlob = formData.get("videoBlob");
    const start = formData.get("start");
    const end = formData.get("end");

    if (!videoBlob || !start || !end) {
      return new Response("Missing parameters", { status: 400 });
    }

    const tempInputPath = path.join(tmpdir(), `input-${Date.now()}.mp4`);
    const tempOutputPath = path.join(tmpdir(), `output-${Date.now()}.mp4`);

    const arrayBuffer = await videoBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempInputPath, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(tempInputPath)
        .setStartTime(start)
        .setDuration(end - start)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions([
          "-preset veryslow", 
          "-crf 18", 
          "-pix_fmt yuv420p",
          "-movflags +faststart",
          "-vsync 0", 
        ])
        .output(tempOutputPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
    const resultBuffer = await readFile(tempOutputPath);
    await unlink(tempInputPath);
    await unlink(tempOutputPath);

    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="trimmed-video.mp4"',
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Processing failed", { status: 500 });
  }
}
