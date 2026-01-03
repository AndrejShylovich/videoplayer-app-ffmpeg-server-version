import { useState, useEffect, useCallback, useRef } from "react";

export function useThumbnails({ videoUrl, duration, serverFilePath }) {
  const [thumbnails, setThumbnails] = useState([]);
  const prevRef = useRef([]);

  const generate = useCallback(async () => {
    if (!duration) return;

    const res = await fetch("/api/frames-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filePath: serverFilePath,
        fps: 3,
        frameWidth: 120,
      }),
    });

    const { frames } = await res.json();

    const next = frames.map((url, i) => ({
      time: ((i + 1) * duration) / frames.length,
      url,
    }));

    // 🔥 чистим старые
    prevRef.current.forEach(t =>
      URL.revokeObjectURL(t.url)
    );

    prevRef.current = next;
    setThumbnails(next);
  }, [duration, serverFilePath]);

  useEffect(() => {
    generate();

    return () => {
      prevRef.current.forEach(t =>
        URL.revokeObjectURL(t.url)
      );
      prevRef.current = [];
    };
  }, [videoUrl, generate]);

  return thumbnails;
}
