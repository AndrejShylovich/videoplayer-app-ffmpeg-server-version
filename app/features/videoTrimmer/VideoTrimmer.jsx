"use client";

import React, { useRef, useState, useCallback } from "react";
import CustomButton from "../../components/ui/CustomButton";
import { formatForTime } from "../../utils/formatForTime";
import { logError } from "../../utils/errorUtils";

/**
 * VideoTrimmer component
 *
 * Provides a UI for trimming a video:
 * - Drag handles to select start/end times
 * - Drag entire range
 * - Adjust video quality (CRF)
 * - Trigger trim operation and download result
 * - Shows errors if operations fail
 */

const VideoTrimmer = ({
  duration,
  startTime,
  endTime,
  isTrimming,
  trimmedUrl,
  onTrim,
  onChange,
  crf,
  onCrfChange,
  error,
  clearError,
  handleError,
}) => {
  const barRef = useRef(null);          // Reference to the trim bar element
  const [dragType, setDragType] = useState(null); // Which handle/range is being dragged

  /**
   * Convert a mouse X-coordinate to a time within the video duration
   */
  const getTimeFromX = useCallback(
    (clientX) => {
      try {
        const rect = barRef.current.getBoundingClientRect();
        const ratio = (clientX - rect.left) / rect.width;
        return Math.max(0, Math.min(duration, ratio * duration));
      } catch (err) {
        logError(err, { action: "getTimeFromX" });
        handleError?.(err, "Failed to calculate time from coordinates");
        return 0;
      }
    },
    [duration, handleError]
  );

  // Start dragging a handle or range
  const onMouseDown = (type) => (e) => {
    e.preventDefault();
    setDragType(type);
  };

  /**
   * Handle mouse movement when dragging
   * Updates start/end times based on drag type
   */
  const onMouseMove = useCallback(
    (e) => {
      if (!dragType) return;

      try {
        const t = getTimeFromX(e.clientX);

        if (dragType === "start") onChange(t, endTime);
        else if (dragType === "end") onChange(startTime, t);
        else if (dragType === "range") {
          const length = endTime - startTime;
          let newStart = t;
          let newEnd = t + length;

          // Keep range within bounds
          if (newStart < 0) {
            newStart = 0;
            newEnd = length;
          }
          if (newEnd > duration) {
            newEnd = duration;
            newStart = duration - length;
          }

          onChange(newStart, newEnd);
        }
      } catch (err) {
        logError(err, { action: "trimDrag", dragType, startTime, endTime });
        handleError?.(err, "Error while dragging the trim slider");
      }
    },
    [dragType, startTime, endTime, onChange, duration, getTimeFromX, handleError]
  );

  const stopDrag = () => setDragType(null); // Stop dragging

  // Trigger trim action
  const handleTrimClick = () => {
    if (isTrimming) return;
    clearError?.();
    try {
      onTrim();
    } catch (err) {
      logError(err, { action: "onTrim" });
      handleError?.(err, "Failed to trim video");
    }
  };

  // Handle CRF (quality) changes
  const handleCrfChange = (e) => {
    try {
      onCrfChange(Number(e.target.value));
    } catch (err) {
      logError(err, { action: "onCrfChange" });
      handleError?.(err, "Failed to change video quality");
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">Video Trimming</h2>

      {/* Trim bar */}
      <div
        ref={barRef}
        className="relative h-4 bg-gray-200 rounded cursor-pointer"
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {/* Selected range */}
        <div
          className="absolute h-full bg-green-400/40"
          style={{
            left: `${(startTime / duration) * 100}%`,
            width: `${((endTime - startTime) / duration) * 100}%`,
          }}
          onMouseDown={onMouseDown("range")}
        />
        {/* Start handle */}
        <div
          className="absolute top-0 w-2 h-full bg-green-600 cursor-ew-resize"
          style={{ left: `${(startTime / duration) * 100}%` }}
          onMouseDown={onMouseDown("start")}
        />
        {/* End handle */}
        <div
          className="absolute top-0 w-2 h-full bg-green-600 cursor-ew-resize"
          style={{ left: `${(endTime / duration) * 100}%` }}
          onMouseDown={onMouseDown("end")}
        />
      </div>

      {/* Display start, end, and duration */}
      <div className="flex justify-between text-sm text-gray-700">
        <span>Start: {formatForTime(startTime)}</span>
        <span>End: {formatForTime(endTime)}</span>
        <span>Duration: {formatForTime(endTime - startTime)}</span>
      </div>

      {/* Video quality selector */}
      <label className="text-sm text-gray-700">Video Quality</label>
      <select
        value={crf}
        onChange={handleCrfChange}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value={14}>Ultra (CRF 14)</option>
        <option value={18}>High (CRF 18)</option>
        <option value={23}>Medium (CRF 23)</option>
        <option value={28}>Low (CRF 28)</option>
      </select>

      {/* Trim button */}
      <CustomButton
        onClick={handleTrimClick}
        disabled={isTrimming}
        className={`${isTrimming ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {isTrimming ? "Trimming..." : "Trim"}
      </CustomButton>

      {/* Download link for trimmed video */}
      {trimmedUrl && (
        <a
          href={trimmedUrl}
          download="trimmed.mp4"
          className="text-blue-600 underline"
        >
          Download Video
        </a>
      )}

      {/* Error display */}
      {error && (
        <div className="p-2 bg-red-100 text-red-800 rounded">
          {typeof error === "string" ? error : error.message}
        </div>
      )}
    </div>
  );
};

export default React.memo(VideoTrimmer);
