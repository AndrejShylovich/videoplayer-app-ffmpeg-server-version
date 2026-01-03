import { useState } from "react";

export function useVideoVolume(videoRef) {
  const [volume, setVolume] = useState(0.8);

  const onVolumeChange = (value) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  };

  return {
    volume,
    onVolumeChange,
  };
}
