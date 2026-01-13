import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { logError } from "../../../utils/errorUtils";

/**
 * Hook to manage video playback state.
 *
 * Handles:
 * - Play/pause toggling
 * - Playback progress tracking
 * - Video duration
 * - Error handling for playback issues
 */
export function useVideoPlayback(videoRef) {
  const [isPlaying, setIsPlaying] = useState(false); // Whether video is currently playing
  const [played, setPlayed] = useState(0);           // Fraction of video played (0–1)
  const [duration, setDuration] = useState(0);       // Total duration in seconds

  const seekRef = useRef(false);                     // Flag for user seeking
  const { error, handleError, clearError } = useErrorHandler();

  /**
   * Toggle play/pause state
   */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    clearError();

    try {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise?.catch) {
          playPromise.catch((err) => {
            logError(err, { action: "video.play()" });
            handleError(err, "Failed to start video playback");
          });
        }
      } else {
        video.pause();
      }
    } catch (err) {
      logError(err, { action: "togglePlay" });
      handleError(err, "Error controlling video playback");
    }
  }, [videoRef, handleError, clearError]);

  /**
   * Handle loaded metadata event to set video duration
   */
  const onLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    clearError();

    try {
      if (Number.isFinite(video.duration)) {
        setDuration(video.duration);
      } else {
        throw new Error("Invalid video duration");
      }
    } catch (err) {
      logError(err, { action: "onLoadedMetadata" });
      handleError(err, "Failed to retrieve video duration");
    }
  }, [videoRef, handleError, clearError]);

  /**
   * Listen to play, pause, and error events
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      clearError();
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleErrorEvent = () => {
      const err = video.error || new Error("Unknown video error");
      logError(err, { action: "video error event" });
      handleError(err, "Video playback error");
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleErrorEvent);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleErrorEvent);
    };
  }, [videoRef, handleError, clearError]);

  /**
   * Update played fraction on timeupdate event
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!seekRef.current && duration > 0) {
        setPlayed(video.currentTime / duration);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [duration, videoRef]);

  // Memoize returned object to avoid unnecessary re-renders
  return useMemo(
    () => ({
      isPlaying,
      played,
      duration,
      error,
      setPlayed,
      setDuration,
      togglePlay,
      onLoadedMetadata,
      seekRef,
      clearError,
    }),
    [isPlaying, played, duration, error, togglePlay, onLoadedMetadata, clearError]
  );
}
