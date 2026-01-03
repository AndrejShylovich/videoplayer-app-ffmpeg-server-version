import { useState } from "react";

export function useVideoSeek({
  videoRef,
  duration,
  seekRef,
  setPlayed,
}) {
  const [isSeeking, setIsSeeking] = useState(false);

  const onSeekStart = () => {
    seekRef.current = true;
    setIsSeeking(true);
  };

  const onSeekChange = (value) => {
    setPlayed(value);
  };

  const onSeekEnd = (value) => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = value * duration;
    seekRef.current = false;
    setIsSeeking(false);
  };

  return {
    isSeeking,
    onSeekStart,
    onSeekChange,
    onSeekEnd,
  };
}
