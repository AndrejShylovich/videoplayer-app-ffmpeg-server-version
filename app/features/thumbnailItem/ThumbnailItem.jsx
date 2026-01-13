"use client";

import React from "react";

/**
 * ThumbnailItem component
 *
 * Represents a single video frame thumbnail in the timeline.
 * Highlights if it is the current playback position or within trim range.
 */

const ThumbnailItem = ({ thumb, isActive, isTrimmed, onClick }) => {
  // Apply ring highlighting based on state
  const ring = isActive
    ? "ring-2 ring-blue-500"
    : isTrimmed
    ? "ring-2 ring-green-500"
    : "";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Jump to ${thumb.time} seconds`}
      className={`
        w-[64px] h-[40px]
        overflow-hidden
        rounded
        flex-shrink-0
        cursor-pointer
        transition
        ${ring}
      `}
    >
      {/* Thumbnail image */}
      <img
        src={thumb.url}
        alt=""
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
};

// Memoize to avoid unnecessary re-renders
export default React.memo(ThumbnailItem);
