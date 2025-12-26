import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import CryptoJS from "crypto-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get("videoFile");

    if (!videoFile) return new NextResponse("No file", { status: 400 });

    const fileName = CryptoJS.lib.WordArray.random(16).toString() + ".mp4";
    const uploadDir = path.join(process.cwd(), "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, Buffer.from(await videoFile.arrayBuffer()));

    return NextResponse.json({ success: true, filePath });
  } catch (err) {
    console.error(err);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
