import { formatForTime } from "../../utils/formatForTime";
import React, { useMemo } from "react";

const ProgressBar = ({
  played,
  duration,
  onChange,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  isSeeking,
}) => {
  const currentTime = played * duration;
  const formattedCurrentTime = useMemo(
    () => formatForTime(currentTime),
    [currentTime]
  );
  const formattedDuration = useMemo(() => formatForTime(duration), [duration]);
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
        className="seek-bar flex-1 h-2 bg-gray-200 rounded-lg cursor-pointer"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
            played * 100
          }%, #e5e7eb ${played * 100}%, #e5e7eb 100%)`,
          transition: isSeeking ? "none" : "background 0.2s ease",
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
