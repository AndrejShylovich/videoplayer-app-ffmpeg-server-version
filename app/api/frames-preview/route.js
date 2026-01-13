import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { NextResponse } from "next/server";
import { validateVideoPath } from "../../lib/validateVideoPath";

export async function POST(request) {
  let command = null;

  try {
    const { filePath, fps = 3, frameWidth = 120 } = await request.json();
    let resolvedPath;
    try {
      resolvedPath = validateVideoPath(filePath);

    } catch (err) {
      return new NextResponse(err.message, { status: 400 });
    }
    const videoId = path.basename(resolvedPath, path.extname(resolvedPath));

    // 👉 api/uploads/frames/<videoId>
    const outputDir = path.join(
      process.cwd(),
      "app",
      "data",

      "frames",
      videoId
    );
    fs.mkdirSync(outputDir, { recursive: true });

    const abortPromise = new Promise((_, reject) => {
      request.signal.addEventListener("abort", () => {
        if (command) command.kill("SIGKILL");
        reject(new Error("FFMPEG_ABORTED"));
      });
    });

    const ffmpegPromise = new Promise((resolve, reject) => {
      command = ffmpeg(resolvedPath)
        .output(path.join(outputDir, "frame-%05d.png"))
        .outputOptions([
          `-vf fps=${fps},scale=${frameWidth}:-1`,
          "-vsync vfr",
        ])
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    await Promise.race([ffmpegPromise, abortPromise]);

    const frames = fs
      .readdirSync(outputDir)
      .filter((f) => f.startsWith("frame-"))
      .map(
        (f) => `/api/uploads/frames/${videoId}/${f}`
      );
    return NextResponse.json({ success: true, frames });
  } catch (err) {
    if (err.message === "FFMPEG_ABORTED") {
      return new NextResponse(null, { status: 499 });
    }

    console.error("[FRAMES] Error:", err);
    return new NextResponse("Processing failed", { status: 500 });
  }
}
