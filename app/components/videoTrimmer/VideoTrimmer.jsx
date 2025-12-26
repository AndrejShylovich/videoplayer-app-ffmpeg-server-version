"use client";

import React, { useRef, useState, useCallback } from "react";
import CustomButton from "../customComponents/CustomButton";
import { formatTime } from "@/app/utils/formatTime";

const VideoTrimmer = ({
  duration,
  startTime,
  endTime,
  isTrimming,
  trimmedUrl,
  onTrim,
  onChange,
}) => {
  const barRef = useRef(null);
  const [dragType, setDragType] = useState(null);

  const getTimeFromX = (clientX) => {
    const rect = barRef.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(duration, ratio * duration));
  };

  const onMouseDown = (type) => (e) => {
    e.preventDefault();
    setDragType(type);
  };

  const onMouseMove = useCallback(
    (e) => {
      if (!dragType) return;

      const t = getTimeFromX(e.clientX);

      if (dragType === "start") onChange(t, endTime);
      if (dragType === "end") onChange(startTime, t);

      if (dragType === "range") {
        const length = endTime - startTime;
        onChange(t, t + length);
      }
    },
    [dragType, startTime, endTime, onChange]
  );

  const stopDrag = () => setDragType(null);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">Обрезка видео</h2>

      {/* timeline */}
      <div
        ref={barRef}
        className="relative h-4 bg-gray-200 rounded cursor-pointer"
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {/* trim area */}
        <div
          className="absolute h-full bg-green-400/40"
          style={{
            left: `${(startTime / duration) * 100}%`,
            width: `${((endTime - startTime) / duration) * 100}%`,
          }}
          onMouseDown={onMouseDown("range")}
        />

        {/* start handle */}
        <div
          className="absolute top-0 w-2 h-full bg-green-600 cursor-ew-resize"
          style={{ left: `${(startTime / duration) * 100}%` }}
          onMouseDown={onMouseDown("start")}
        />

        {/* end handle */}
        <div
          className="absolute top-0 w-2 h-full bg-green-600 cursor-ew-resize"
          style={{ left: `${(endTime / duration) * 100}%` }}
          onMouseDown={onMouseDown("end")}
        />
      </div>

      {/* timers */}
      <div className="flex justify-between text-sm text-gray-700">
        <span>Начало: {formatTime(startTime)}</span>
        <span>Конец: {formatTime(endTime)}</span>
        <span>Длительность: {formatTime(endTime - startTime)}</span>
      </div>

      <CustomButton onClick={onTrim} disabled={isTrimming}>
        {isTrimming ? "Обрезка..." : "Обрезать"}
      </CustomButton>

      {trimmedUrl && (
        <a
          href={trimmedUrl}
          download="trimmed.mp4"
          className="text-blue-600 underline"
        >
          Скачать видео
        </a>
      )}
    </div>
  );
};

export default React.memo(VideoTrimmer);
