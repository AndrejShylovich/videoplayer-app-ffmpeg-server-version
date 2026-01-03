"use client";

import React, { useRef, useEffect } from "react";

import VideoControls from "../videoControls/VideoControls";
import VideoTrimmer from "../videoTrimmer/VideoTrimmer";
import TimelineThumbnails from "../timelineThumbnails/TimelineThumbnails";

import { useVideoPlayback } from "./hooks/useVideoPlayback";
import { useVideoSeek } from "./hooks/useVideoSeek";
import { useVideoVolume } from "./hooks/useVideoVolume";
import { useThumbnails } from "./hooks/useThumbnails";
import { useVideoTrim } from "./hooks/useVideoTrim";

const VideoPlayer = ({ videoUrl, serverFilePath }) => {
  const videoRef = useRef(null);

  const playback = useVideoPlayback(videoRef);
  const seek = useVideoSeek({
    videoRef,
    duration: playback.duration,
    seekRef: playback.seekRef,
    setPlayed: playback.setPlayed,
  });
  const volume = useVideoVolume(videoRef);
  const thumbnails = useThumbnails({
    videoUrl,
    duration: playback.duration,
    serverFilePath,
  });
  const trim = useVideoTrim(playback.duration, serverFilePath);

  useEffect(() => {
    playback.setPlayed(0);
    playback.setDuration(0);
  }, [videoUrl]);

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        src={videoUrl}
        onLoadedMetadata={playback.onLoadedMetadata}
        onClick={playback.togglePlay}
        className="w-full aspect-video bg-black"
      />

      <VideoControls
        isPlaying={playback.isPlaying}
        played={playback.played}
        duration={playback.duration}
        volume={volume.volume}
        isSeeking={seek.isSeeking}
        onPlayPause={playback.togglePlay}
        onSeekStart={seek.onSeekStart}
        onSeekChange={e => seek.onSeekChange(+e.target.value)}
        onSeekEnd={e => seek.onSeekEnd(+e.target.value)}
        onVolumeChange={e => volume.onVolumeChange(+e.target.value)}
      />

      <TimelineThumbnails
        thumbnails={thumbnails}
        currentTime={playback.played * playback.duration}
        duration={playback.duration}
        trimStart={trim.trimStart}
        trimEnd={trim.trimEnd}
        onThumbnailClick={time => {
          videoRef.current.currentTime = time;
          playback.setPlayed(time / playback.duration);
        }}
      />

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
      />
    </div>
  );
};

export default VideoPlayer;
