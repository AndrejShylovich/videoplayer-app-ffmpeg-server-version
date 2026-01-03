import { useState, useCallback, useEffect } from "react";
import { clamp } from "../../../utils/clamp";

export function useVideoTrim(duration, serverFilePath) {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [crf, setCrf] = useState(18);

  const [isTrimming, setIsTrimming] = useState(false);
  const [trimmedUrl, setTrimmedUrl] = useState(null);
  
  useEffect(() => {
    if (!duration) return;

    setTrimStart(0);
    setTrimEnd(Math.min(10, duration));
  }, [duration]);

  const onChange = (start, end) => {
    setTrimStart(clamp(start, 0, duration - 0.1));
    setTrimEnd(clamp(end, start + 0.1, duration));
  };

  const trim = useCallback(async () => {
    setIsTrimming(true);
    setTrimmedUrl(null);

    const res = await fetch("/api/trim-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filePath: serverFilePath,
        start: trimStart,
        end: trimEnd,
        crf,
      }),
    });

    const { url } = await res.json();
    setTrimmedUrl(url);
    setIsTrimming(false);
  }, [serverFilePath, trimStart, trimEnd, crf]);

  return {
    trimStart,
    trimEnd,
    crf,
    setCrf,
    isTrimming,
    trimmedUrl,
    onChange,
    trim,
  };
}
