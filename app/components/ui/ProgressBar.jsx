import { formatTime } from "@/app/utils/formatTime";
import React, { useMemo } from "react";

const ProgressBar = ({
  played,
  duration,
  trim,
  onChange,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  isSeeking,
}) => {
  const currentTime = played * duration;

  const formattedCurrentTime = useMemo(
    () => formatTime(currentTime),
    [currentTime]
  );

  const formattedDuration = useMemo(
    () => formatTime(duration),
    [duration]
  );

  const playedPercent = played * 100;
  const trimStartPercent =
    duration > 0 ? (trim.start / duration) * 100 : 0;
  const trimEndPercent =
    duration > 0 ? (trim.end / duration) * 100 : 100;

  const backgroundImage = `
    linear-gradient(
      to right,
      transparent ${trimStartPercent - 0.2}%,
      rgba(59,130,246,0.9) ${trimStartPercent}%,
      transparent ${trimStartPercent + 0.2}%
    ),
    linear-gradient(
      to right,
      transparent ${trimEndPercent - 0.2}%,
      rgba(59,130,246,0.9) ${trimEndPercent}%,
      transparent ${trimEndPercent + 0.2}%
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(0,0,0,0.35) 0px,
      rgba(0,0,0,0.35) 6px,
      rgba(0,0,0,0.45) 6px,
      rgba(0,0,0,0.45) 12px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(0,0,0,0.35) 0px,
      rgba(0,0,0,0.35) 6px,
      rgba(0,0,0,0.45) 6px,
      rgba(0,0,0,0.45) 12px
    ),
    linear-gradient(
      to right,
      #3b82f6 0%,
      #3b82f6 ${playedPercent}%,
      #e5e7eb ${playedPercent}%,
      #e5e7eb 100%
    )
  `;

  const backgroundSize = `
    100% 100%,
    100% 100%,
    ${trimStartPercent}% 100%,
    ${100 - trimEndPercent}% 100%,
    100% 100%
  `;

  const backgroundPosition = `
    0 0,
    0 0,
    0 0,
    ${trimEndPercent}% 0,
    0 0
  `;

  const backgroundRepeat = `
    no-repeat,
    no-repeat,
    repeat,
    repeat,
    no-repeat
  `;

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={1}
        step={0.0001}
        value={played}
        onChange={onChange}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="seek-bar flex-1 h-2 rounded-lg cursor-pointer"
        style={{
          backgroundImage,
          backgroundSize,
          backgroundPosition,
          backgroundRepeat,
          transition: isSeeking ? "none" : "background-position 0.25s ease",
        }}
        aria-label="Video progress bar"
      />

      <div className="time-display text-sm text-gray-600 min-w-[8rem] text-right">
        {formattedCurrentTime} / {formattedDuration}
      </div>
    </div>
  );
};

export default ProgressBar;
