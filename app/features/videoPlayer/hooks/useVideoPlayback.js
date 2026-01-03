import { useState, useRef, useEffect, useCallback } from "react";

export function useVideoPlayback(videoRef) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);

  const rafRef = useRef(null);
  const seekRef = useRef(false);

  const togglePlay = () => {
    if (!videoRef.current) return;

    isPlaying
      ? videoRef.current.pause()
      : videoRef.current.play();

    setIsPlaying(p => !p);
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const update = useCallback(() => {
    const video = videoRef.current;

    if (video && !seekRef.current && duration > 0) {
      setPlayed(video.currentTime / duration);
    }

    rafRef.current = requestAnimationFrame(update);
  }, [duration, videoRef]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  return {
    isPlaying,
    played,
    duration,
    setPlayed,
    setDuration,
    togglePlay,
    onLoadedMetadata,
    seekRef,
  };
}
