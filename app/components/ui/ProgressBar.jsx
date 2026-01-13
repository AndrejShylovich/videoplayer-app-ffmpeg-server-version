import React, { useMemo } from "react";
import { formatForTime } from "../../utils/formatForTime";

/**
 * ProgressBar component
 *
 * Renders a seekable progress bar with current time and total duration.
 */
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

  // Format times for display
  const formattedCurrentTime = useMemo(() => formatForTime(currentTime), [currentTime]);
  const formattedDuration = useMemo(() => formatForTime(duration), [duration]);

  return (
    <div className="flex items-center gap-3">
      {/* Seekable slider */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.0001}
        value={played}
        onChange={(e) => onChange(+e.target.value)}
        onMouseDown={onMouseDown}
        onMouseUp={(e) => onMouseUp(+e.target.value)}
        onTouchStart={onTouchStart}
        onTouchEnd={(e) => onTouchEnd(+e.target.value)}
        className={`flex-1 h-2 rounded-lg cursor-pointer ${isSeeking ? "bg-transparent" : ""}`}
      />

      {/* Time display */}
      <div className="text-sm text-gray-600 min-w-[8rem] text-right">
        {formattedCurrentTime} / {formattedDuration}
      </div>
    </div>
  );
};

export default ProgressBar;
