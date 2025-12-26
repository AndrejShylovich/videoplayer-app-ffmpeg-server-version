"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

import VideoControls from "../videoControls/VideoControls";
import VideoTrimmer from "../videoTrimmer/VideoTrimmer";
import TimelineThumbnails from "../timelineThumbnails/TimelineThumbnails";

const VideoPlayer = ({ videoUrl, ffmpeg, serverFilePath }) => {
  /* ================== STATE ================== */
  const [thumbnails, setThumbnails] = useState([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0); // 0..1
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const [volume, setVolume] = useState(0.8);

  // trimming
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimmedUrl, setTrimmedUrl] = useState(null);

  /* ================== REFS ================== */
  const videoRef = useRef(null);
  const ffmpegRef = useRef(ffmpeg);
  const seekRef = useRef(false);
  const rafRef = useRef(null);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ================== RESET ON VIDEO CHANGE ================== */
  useEffect(() => {
    setThumbnails([]);
    setIsPlaying(false);
    setPlayed(0);
    setDuration(0);
    setIsSeeking(false);
    setVolume(0.8);

    setTrimStart(0);
    setTrimEnd(10);
    setTrimmedUrl(null);
  }, [videoUrl]);

  /* ================== METADATA ================== */
  const handleLoadedMetadata = () => {
    const d = videoRef.current.duration;
    setDuration(d);
    setTrimEnd(Math.min(10, d));
  };

  const handleTrimChange = useCallback(
    (start, end) => {
      setTrimStart(clamp(start, 0, duration - 0.1));
      setTrimEnd(clamp(end, start + 0.1, duration));
    },
    [duration]
  );

  /* ================== RAF PROGRESS ================== */
  const updatePlaybackPosition = useCallback(() => {
    if (videoRef.current && !seekRef.current && !isSeeking && duration > 0) {
      setPlayed(videoRef.current.currentTime / duration);
    }
    rafRef.current = requestAnimationFrame(updatePlaybackPosition);
  }, [duration, isSeeking]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(updatePlaybackPosition);
    return () => cancelAnimationFrame(rafRef.current);
  }, [updatePlaybackPosition]);

  /* ================== PLAYBACK ================== */
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying((p) => !p);
  };

  const skipTime = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(duration, videoRef.current.currentTime + seconds)
    );
  };

  /* ================== SEEK ================== */
  const handleSeekStart = () => {
    seekRef.current = true;
    setIsSeeking(true);
  };

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekEnd = (e) => {
    const value = parseFloat(e.target.value);
    videoRef.current.currentTime = value * duration;
    seekRef.current = false;
    setIsSeeking(false);
  };

  /* ================== VOLUME ================== */
  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
    }
  };

  /* ================== THUMBNAILS ================== */
  const generateThumbnails = useCallback(async () => {
    if (!duration) return;

    try {
      const res = await fetch("/api/frames-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: serverFilePath,
          fps: 3, // кол-во кадров в секунду
          frameWidth: 120, // ширина миниатюр
        }),
      });

      const {frames} = await res.json();
      console.log(frames)
      setThumbnails(
        frames.map((url, i) => ({
          time: ((i + 1) * duration) / frames.length,
          url,
        }))
      );
    } catch (e) {
      console.error("Thumbnail error:", e);
    }
  }, [videoUrl, duration]);

  useEffect(() => {
    const init = async () => {
      if (!ffmpegRef.current.loaded) {
        await ffmpegRef.current.load();
      }
      generateThumbnails();
    };
    init();

    return () => {
      thumbnails.forEach((t) => URL.revokeObjectURL(t.url));
    };
  }, [videoUrl, generateThumbnails]);

  /* ================== TRIM ================== */
  const handleTrim = useCallback(async () => {
    try {
      setIsTrimming(true);
      setTrimmedUrl(null);

      const videoBlob = await fetch(videoUrl).then((r) => r.blob());

      const formData = new FormData();
      formData.append("start", trimStart);
      formData.append("end", trimEnd);
      formData.append("videoBlob", videoBlob, "video.mp4");

      const res = await fetch("/api/trim-video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Trim failed");

      const blob = await res.blob();
      setTrimmedUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error("Trim error:", e);
    } finally {
      setIsTrimming(false);
    }
  }, [videoUrl, trimStart, trimEnd]);

  /* ================== RENDER ================== */
  return (
    <div className="video-container bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="aspect-video bg-black rounded overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          preload="metadata"
        />
      </div>

      <VideoControls
        isPlaying={isPlaying}
        played={played}
        duration={duration}
        volume={volume}
        isSeeking={isSeeking}
        onPlayPause={togglePlay}
        onSeekChange={handleSeekChange}
        onSeekStart={handleSeekStart}
        onSeekEnd={handleSeekEnd}
        onVolumeChange={handleVolumeChange}
        onSkip={skipTime}
      />

      {thumbnails.length > 0 && (
        <TimelineThumbnails
          thumbnails={thumbnails}
          currentTime={played * duration}
          duration={duration}
          trimStart={trimStart}
          trimEnd={trimEnd}
          onThumbnailClick={(time) => {
            videoRef.current.currentTime = time;
            setPlayed(time / duration);
          }}
        />
      )}

      {duration > 0 && (
        <VideoTrimmer
          duration={duration}
          startTime={trimStart}
          endTime={trimEnd}
          isTrimming={isTrimming}
          trimmedUrl={trimmedUrl}
          onChange={handleTrimChange}
          onTrim={handleTrim}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
