import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { NextResponse } from "next/server";
import { validateVideoPath } from "../../lib/validateVideoPath";

export async function POST(request) {
  let command = null;
  let aborted = false;

  try {
    const { filePath, start, end, crf } = await request.json();

    if (start == null || end == null) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    let resolvedPath;
    try {
      resolvedPath = validateVideoPath(filePath);
    } catch (err) {
      return new NextResponse(err.message, { status: 400 });
    }

    const duration = end - start;
    if (duration <= 0) {
      return new NextResponse("Invalid trim range", { status: 400 });
    }

    const safeCrf =
      typeof crf === "number" && crf >= 0 && crf <= 51 ? crf : 18;

    const videoId = path.basename(resolvedPath, path.extname(resolvedPath));

    // 👉 api/uploads/trimmed
    const outputDir = path.join(
      process.cwd(),
      "app",
      "data",
      "trimmed"
    );

    fs.mkdirSync(outputDir, { recursive: true });

    const outputFileName = `${videoId}-${Date.now()}-${start}-${end}.mp4`;
    const outputPath = path.join(outputDir, outputFileName);

    request.signal.addEventListener("abort", () => {
      aborted = true;
      if (command) command.kill("SIGKILL");
    });

    await new Promise((resolve, reject) => {
      command = ffmpeg(resolvedPath)
        .setStartTime(start)
        .setDuration(duration)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions([
          "-preset ultrafast",
          `-crf ${safeCrf}`,
          "-pix_fmt yuv420p",
          "-movflags +faststart",
        ])
        .output(outputPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    if (aborted) {
      cleanupFile(outputPath);
      return new NextResponse(null, { status: 499 });
    }

    return NextResponse.json({
      success: true,
      url: `/api/uploads/trimmed/${outputFileName}`,
    });
  } catch (err) {
    if (aborted) {
      return new NextResponse(null, { status: 499 });
    }

    console.error("[TRIM] Error:", err);
    return new NextResponse("Processing failed", { status: 500 });
  }
}

function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.warn("[TRIM] Cleanup failed:", e);
  }
}
