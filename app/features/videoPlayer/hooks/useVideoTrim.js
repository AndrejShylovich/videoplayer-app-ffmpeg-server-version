import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { clamp } from "../../../utils/clamp";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { safeFetch, logError } from "../../../utils/errorUtils";

/**
 * Hook to manage video trimming.
 *
 * - Handles trim start/end times
 * - Supports CRF (quality) selection
 * - Calls server API to trim video
 * - Tracks trimming state and result URL
 * - Manages errors and aborting requests
 */
export function useVideoTrim(duration, serverFilePath) {
  const [trimStart, setTrimStart] = useState(0); // Start of trim range
  const [trimEnd, setTrimEnd] = useState(0);     // End of trim range
  const [crf, setCrf] = useState(18);           // Video quality (CRF)
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimmedUrl, setTrimmedUrl] = useState(null);

  const abortRef = useRef(null);                 // AbortController for ongoing trim request
  const { error, handleError, clearError } = useErrorHandler();

  // Reset trim range when duration changes
  useEffect(() => {
    if (!duration) return;
    clearError();
    setTrimStart(0);
    setTrimEnd(Math.min(10, duration));
  }, [duration, clearError]);

  /**
   * Update trim start/end range
   */
  const onChange = useCallback(
    (start, end) => {
      clearError();

      if (!Number.isFinite(duration) || duration <= 0) {
        const err = new Error("Invalid video duration");
        logError(err, { action: "trimRangeChange", duration });
        handleError(err, "Invalid video duration");
        return;
      }

      setTrimStart(clamp(start, 0, duration - 0.1));
      setTrimEnd(clamp(end, start + 0.1, duration));
    },
    [duration, handleError, clearError]
  );

  /**
   * Trigger trim operation
   */
  const trim = useCallback(async () => {
    if (!serverFilePath) {
      const err = new Error("Missing serverFilePath");
      logError(err, { action: "trim" });
      handleError(err, "Video file not found");
      return;
    }

    if (trimEnd <= trimStart) {
      const err = new Error("Invalid trim range");
      logError(err, { action: "trim", trimStart, trimEnd });
      handleError(err, "Invalid trim range");
      return;
    }

    // Abort previous trim request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    clearError();
    setIsTrimming(true);
    setTrimmedUrl(null);

    try {
      const data = await safeFetch(
        "/api/trim-video",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filePath: serverFilePath,
            start: trimStart,
            end: trimEnd,
            crf,
          }),
          signal: controller.signal,
        },
        "Failed to trim video"
      );

      if (!data?.url) {
        throw new Error("Empty trim response");
      }

      setTrimmedUrl(data.url);
    } catch (err) {
      if (err.name === "AbortError") return;

      logError(err, { action: "trimVideo" });
      handleError(err, "Failed to trim video");
    } finally {
      setIsTrimming(false);
    }
  }, [serverFilePath, trimStart, trimEnd, crf, handleError, clearError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Memoize return object for stable reference
  return useMemo(
    () => ({
      trimStart,
      trimEnd,
      crf,
      setCrf,
      isTrimming,
      trimmedUrl,
      error,
      onChange,
      trim,
      clearError,
    }),
    [
      trimStart,
      trimEnd,
      crf,
      isTrimming,
      trimmedUrl,
      error,
      onChange,
      trim,
      clearError,
    ]
  );
}
