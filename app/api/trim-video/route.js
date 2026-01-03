import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { NextResponse } from "next/server";

export async function POST(request) {
  const startedAt = Date.now();

  try {
    const { filePath, start, end, crf } = await request.json();

    let lastLogTime = 0;
    console.log("[TRIM] Request received", {
      filePath,
      start,
      end,
    });
    console.log(crf)
    const safeCrf = typeof crf === "number" && crf >= 0 && crf <= 51 ? crf : 18;

    if (!filePath || start == null || end == null) {
      console.warn("[TRIM] Missing parameters");
      return new NextResponse("Missing parameters", { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      console.warn("[TRIM] File not found:", filePath);
      return new NextResponse("File not found", { status: 404 });
    }

    const duration = end - start;
    if (duration <= 0) {
      console.warn("[TRIM] Invalid range:", { start, end });
      return new NextResponse("Invalid trim range", { status: 400 });
    }

    const videoId = path.basename(filePath, path.extname(filePath));
    const outputDir = path.join(process.cwd(), "public", "trimmed");
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${videoId}-${start}-${end}.mp4`);

    console.log("[TRIM] Output:", outputPath);

    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .setStartTime(start)
        .setDuration(duration)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions([
          "-preset veryslow",
          `-crf ${safeCrf}`,
          "-pix_fmt yuv420p",
          "-movflags +faststart",
        ])
        .output(outputPath)
        .on("start", (cmd) => {
          console.log("[FFMPEG] Start:", cmd);
          console.log("[FFMPEG] Quality:", safeCrf);
        })
        .on("progress", (p) => {
          const now = Date.now();
          if (now - lastLogTime < 1000) return;
          lastLogTime = now;

          const percent =
            typeof p.percent === "number" && Number.isFinite(p.percent)
              ? p.percent.toFixed(1)
              : null;

          const timemark =
            typeof p.timemark === "string" && p.timemark !== "N/A"
              ? p.timemark
              : null;

          if (percent && timemark) {
            console.log(`[FFMPEG] ${percent}% | ${timemark}`);
          } else if (timemark) {
            console.log(`[FFMPEG] time ${timemark}`);
          } else {
            console.log("[FFMPEG] working...");
          }
        })
        .on("end", () => {
          console.log("[FFMPEG] Finished");
          resolve();
        })
        .on("error", (err, stdout, stderr) => {
          console.error("[FFMPEG] Error:", err.message);
          if (stderr) console.error(stderr);
          reject(err);
        })
        .run();
    });

    console.log(`[TRIM] Done in ${Date.now() - startedAt} ms`);

    return NextResponse.json({
      success: true,
      url: `/trimmed/${path.basename(outputPath)}`,
    });
  } catch (err) {
    console.error("[TRIM] Fatal error:", err);
    return new NextResponse("Processing failed", { status: 500 });
  }
}
