import { useState, useRef, useEffect, useCallback } from "react";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { logError, safeFetch } from "../../../utils/errorUtils";

/**
 * Hook to generate video thumbnails for preview.
 *
 * - Fetches a set of video frames from the server
 * - Computes timestamp for each frame
 * - Handles aborting ongoing requests
 * - Cleans up previously generated object URLs
 *
 */
export function useThumbnails({ duration, serverFilePath }) {
  const [thumbnails, setThumbnails] = useState([]); // Array of { time, url }
  const prevRef = useRef([]);                        // Store previous URLs for cleanup
  const abortRef = useRef(null);                     // AbortController for ongoing request

  const { error, handleError, clearError } = useErrorHandler();

  /**
   * Generate thumbnails by requesting frames from the server
   */
  const generate = useCallback(async () => {
    if (!duration || !serverFilePath) return;

    // Abort any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    clearError();

    try {
      const fps = Math.min(3, 50 / duration); // Limit FPS based on video length

      const data = await safeFetch(
        "/api/frames-preview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filePath: serverFilePath,
            fps,
            frameWidth: 120,
          }),
          signal: controller.signal,
        },
        "Failed to fetch video frames"
      );

      if (!Array.isArray(data.frames)) {
        throw new Error("Invalid frames response");
      }

      // Map frames to timestamps
      const next = data.frames.map((url, i) => ({
        time: ((i + 1) * duration) / data.frames.length,
        url,
      }));
      // Cleanup previous object URLs
      prevRef.current.forEach((t) => URL.revokeObjectURL(t.url));
      prevRef.current = next;

      setThumbnails(next);
    } catch (err) {
      if (err.name === "AbortError") return;

      logError(err, { serverFilePath, duration });
      handleError(err, "Failed to generate video preview");
    }
  }, [duration, serverFilePath,  handleError, clearError]);

  // Generate thumbnails when inputs change, clean up on unmount
  useEffect(() => {
    generate();

    return () => {
      abortRef.current?.abort();
      prevRef.current.forEach((t) => URL.revokeObjectURL(t.url));
      prevRef.current = [];
    };
  }, [generate]);

  return { thumbnails, error, regenerate: generate, clearError };
}
