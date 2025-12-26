import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { filePath, fps = 3, frameWidth = 100 } = await request.json();

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const videoId = path.basename(filePath, ".mp4");
    const outputDir = path.join(process.cwd(), "public", "frames", videoId);
    fs.mkdirSync(outputDir, { recursive: true });

    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .output(path.join(outputDir, "frame-%05d.png"))
        .outputOptions([`-vf fps=${fps},scale=${frameWidth}:-1`, "-vsync vfr"])
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    const frames = fs
      .readdirSync(outputDir)
      .filter((f) => f.startsWith("frame-"))
      .map((f) => `/frames/${videoId}/${f}`);

    return NextResponse.json({ success: true, frames });
  } catch (err) {
    console.error(err);
    return new NextResponse("Processing failed", { status: 500 });
  }
}
