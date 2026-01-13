"use client";

import React, { memo } from "react";
import ThumbnailItem from "../thumbnailItem/ThumbnailItem";
import { logError } from "../../utils/errorUtils";

/**
 * TimelineThumbnails component
 *
 * Displays a horizontal scrollable timeline of video thumbnails.
 * Highlights the current playback position and trim selection.
 */
const TimelineThumbnails = memo(
  ({ thumbnails, currentTime, trimStart, trimEnd, onThumbnailClick, handleError }) => {
    if (!thumbnails.length) return null;
    return (
      <div className="timeline flex gap-2 overflow-x-auto py-2 scrollbar-thin w-full">
        {thumbnails.map((thumb) => {
          /* Highlight if current playback time is near this thumbnail
          */
          const isActive =
            currentTime >= thumb.time - 0.165 &&
            currentTime <= thumb.time + 0.165;

          // Highlight if thumbnail is inside trim range
          const isTrim = thumb.time >= trimStart && thumb.time <= trimEnd;

          // Wrap click handler with try/catch to log errors
          const safeClick = () => {
            try {
              onThumbnailClick(thumb.time);
            } catch (err) {
              logError(err, { action: "thumbnailClick", thumb });
              handleError?.(err, "Failed to click thumbnail");
            }
          };

          return (
            <div key={thumb.url} className="flex-shrink-0">
              <ThumbnailItem
                thumb={thumb}
                isActive={isActive}
                isTrimmed={isTrim}
                onClick={safeClick}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

export default TimelineThumbnails;
