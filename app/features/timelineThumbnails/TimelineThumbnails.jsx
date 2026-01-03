import React, { memo } from "react";
import ThumbnailItem from "../thumbnailItem/ThumbnailItem";

const TimelineThumbnails = memo(
  ({ thumbnails, currentTime, trimStart, trimEnd, onThumbnailClick }) => {
    if (!thumbnails.length) return null;

    return (
      <div className="timeline flex gap-2 overflow-x-auto py-2 scrollbar-thin w-full">
        {thumbnails.map((thumb) => {
          const isActive =
            currentTime >= thumb.time - 0.165 &&
            currentTime <= thumb.time + 0.165;

          const isTrim = thumb.time >= trimStart && thumb.time <= trimEnd;
          return (
            <div key={thumb.url} className="flex-shrink-0">
              <ThumbnailItem
                thumb={thumb}
                isActive={isActive}
                isTrimmed={isTrim}
                onClick={() => onThumbnailClick(thumb.time)}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

export default TimelineThumbnails;
