"use client";

import React, { useRef, useEffect, useCallback } from "react";

import VideoControls from "../videoControls/VideoControls";
import VideoTrimmer from "../videoTrimmer/VideoTrimmer";
import TimelineThumbnails from "../timelineThumbnails/TimelineThumbnails";

import { useVideoPlayback } from "./hooks/useVideoPlayback";
import { useVideoSeek } from "./hooks/useVideoSeek";
import { useVideoVolume } from "./hooks/useVideoVolume";
import { useThumbnails } from "./hooks/useThumbnails";
import { useVideoTrim } from "./hooks/useVideoTrim";

import { logError } from "../../utils/errorUtils";

/**
 * VideoPlayer component
 *
 * Combines video playback, controls, thumbnails, and trimming functionality.
 * Handles playback state, seeking, volume, thumbnails, trimming, and error reporting.
 */
const VideoPlayer = ({ videoUrl, serverFilePath }) => {
  const videoRef = useRef(null); // Reference to <video> element

  // Hooks for playback, seek, volume, thumbnails, and trimming
  const playback = useVideoPlayback(videoRef);
  const seek = useVideoSeek({
    videoRef,
    duration: playback.duration,
    seekRef: playback.seekRef,
    setPlayed: playback.setPlayed,
  });
  const volume = useVideoVolume(videoRef);
  const thumbnailsHook = useThumbnails({
    duration: playback.duration,
    serverFilePath,
  });
  const trim = useVideoTrim(playback.duration, serverFilePath);

  const { thumbnails, error: thumbnailsError } = thumbnailsHook;
  // Reset playback state when video URL changes
  useEffect(() => {
    playback.setPlayed(0);
    playback.setDuration(0);
  }, [videoUrl, playback.setPlayed, playback.setDuration]);

  /**
   * Skip forward/backward by a given number of seconds
   */
  const onSkip = useCallback(
    (seconds) => {
      const video = videoRef.current;
      if (!video || playback.duration <= 0) return;

      const newTime = Math.max(
        0,
        Math.min(playback.duration, video.currentTime + seconds)
      );

      try {
        video.currentTime = newTime;
        playback.setPlayed(newTime / playback.duration);
      } catch (err) {
        logError(err, { action: "skip", seconds });
        playback.handleError?.(err, "Failed to skip video");
      }
    },
    [playback.duration, playback.setPlayed, playback]
  );

  /**
   * Seek video to a specific time (used by thumbnails)
   */
  const onThumbnailClick = useCallback(
    (time) => {
      const video = videoRef.current;
      if (!video || playback.duration <= 0) return;

      try {
        video.currentTime = time;
        playback.setPlayed(time / playback.duration);
      } catch (err) {
        logError(err, { action: "thumbnailClick", time });
        playback.handleError?.(err, "Failed to seek video via thumbnail");
      }
    },
    [playback.duration, playback.setPlayed]
  );

  // Collect all errors from sub-hooks/components
  const errors = [
    playback.error,
    seek.error,
    volume.error,
    thumbnailsError,
    trim.error,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        onLoadedMetadata={playback.onLoadedMetadata}
        onClick={playback.togglePlay}
        className="w-full aspect-video bg-black"
        aria-label="Video player"
      />

      {/* Playback controls */}
      <VideoControls
        isPlaying={playback.isPlaying}
        played={playback.played}
        duration={playback.duration}
        volume={volume.volume}
        isSeeking={seek.isSeeking}
        onPlayPause={playback.togglePlay}
        onSeekStart={seek.onSeekStart}
        onSeekChange={seek.onSeekChange}
        onSeekEnd={seek.onSeekEnd}
        onVolumeChange={volume.onVolumeChange}
        onSkip={onSkip}
      />

      {/* Timeline with clickable thumbnails */}
      <TimelineThumbnails
        thumbnails={thumbnails}
        currentTime={playback.played * playback.duration}
        trimStart={trim.trimStart}
        trimEnd={trim.trimEnd}
        onThumbnailClick={onThumbnailClick}
        handleError={playback.handleError}
      />

      {/* Video trimmer */}
      <VideoTrimmer
        duration={playback.duration}
        startTime={trim.trimStart}
        endTime={trim.trimEnd}
        isTrimming={trim.isTrimming}
        trimmedUrl={trim.trimmedUrl}
        onChange={trim.onChange}
        onTrim={trim.trim}
        crf={trim.crf}
        onCrfChange={trim.setCrf}
        error={trim.error}
        clearError={trim.clearError}
        handleError={trim.handleError}
      />

      {/* Display aggregated errors */}
      {errors.length > 0 && (
        <div className="p-2 bg-red-100 text-red-800 rounded space-y-1">
          {errors.map((err, i) => (
            <div key={i}>{typeof err === "string" ? err : err.message}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
