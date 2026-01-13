import { useState, useCallback, useMemo } from "react";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { logError } from "../../../utils/errorUtils";

/**
 * Hook to manage video volume.
 *
 * - Tracks current volume state (0–1)
 * - Updates <video> element volume
 * - Handles errors if video element is not available
 */
export function useVideoVolume(videoRef) {
  const [volume, setVolume] = useState(0.8); // Default volume at 80%
  const { error, handleError, clearError } = useErrorHandler();

  /**
   * Change volume
   */
  const onVolumeChange = useCallback(
    (value) => {
      const video = videoRef.current;
      clearError();

      if (!video) {
        const err = new Error("Video element not found");
        logError(err, { action: "onVolumeChange", value });
        handleError(err, "Video not available");
        return;
      }

      const clampedValue = Math.min(1, Math.max(0, value)); // Clamp between 0 and 1

      try {
        setVolume(clampedValue);
        video.volume = clampedValue;
      } catch (err) {
        logError(err, { action: "onVolumeChange", value });
        handleError(err, "Failed to change video volume");
      }
    },
    [videoRef, handleError, clearError]
  );

  // Memoize return object for stable references
  return useMemo(
    () => ({
      volume,
      error,
      onVolumeChange,
      clearError,
    }),
    [volume, error, onVolumeChange, clearError]
  );
}
