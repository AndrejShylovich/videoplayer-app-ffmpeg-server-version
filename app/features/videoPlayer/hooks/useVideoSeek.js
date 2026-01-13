import { useState, useCallback } from "react";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { logError } from "../../../utils/errorUtils";

/**
 * Hook to manage video seeking logic.
 *
 * - Tracks whether the user is currently dragging the seek bar
 * - Updates playback position during seek
 * - Handles errors if video element or duration is invalid
 */
export function useVideoSeek({ videoRef, duration, seekRef, setPlayed }) {
  const [isSeeking, setIsSeeking] = useState(false); // Whether user is dragging the seek bar
  const { error, handleError, clearError } = useErrorHandler();

  /**
   * Called when user starts dragging the seek handle
   */
  const onSeekStart = useCallback(() => {
    clearError();
    seekRef.current = true;
    setIsSeeking(true);
  }, [seekRef, clearError]);

  /**
   * Called while user is dragging the seek handle
   * Updates played fraction in real time
   */
  const onSeekChange = useCallback(
    (value) => {
      setPlayed(value);
    },
    [setPlayed]
  );

  /**
   * Called when user releases the seek handle
   * Updates the video's currentTime
   */
  const onSeekEnd = useCallback(
    (value) => {
      const video = videoRef.current;

      if (!video) {
        const err = new Error("Video element not found");
        logError(err, { action: "onSeekEnd" });
        handleError(err, "Video not available");
        return;
      }

      if (duration <= 0 || !Number.isFinite(duration)) {
        const err = new Error("Invalid video duration");
        logError(err, { action: "onSeekEnd", duration });
        handleError(err, "Invalid video duration");
        return;
      }

      try {
        video.currentTime = value * duration;
        seekRef.current = false;
        setIsSeeking(false);
      } catch (err) {
        logError(err, { action: "onSeekEnd", value, duration });
        handleError(err, "Error seeking video");
      }
    },
    [videoRef, duration, seekRef, handleError]
  );

  return {
    isSeeking,
    error,
    onSeekStart,
    onSeekChange,
    onSeekEnd,
    clearError,
  };
}
