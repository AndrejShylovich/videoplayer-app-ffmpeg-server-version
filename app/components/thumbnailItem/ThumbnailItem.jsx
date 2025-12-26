"use client";

import React, { useCallback } from "react";

const ThumbnailItem = ({ thumb, isActive, isTrimmed, onClick }) => {
  const activeClasses = isActive
    ? "ring-2 ring-blue-500"
    : isTrimmed
    ? "ring-2 ring-green-500"
    : "";
  /*const activeClasses = isActive
    ? "ring-2 ring-blue-500 opacity-100"
    : "hover:opacity-80 opacity-90";*/

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      onClick();
    },
    [onClick]
  );

  return (
    <div
      className={`thumbnail cursor-pointer transition-opacity ${activeClasses}`}
      onClick={handleClick}
      aria-label={`Jump to ${thumb.time} seconds`}
      role="button"
      tabIndex={0}
    >
      <img
        src={thumb.url}
        alt={`Thumbnail at ${thumb.time}s`}
        width={50}
        height={50}
      />
    </div>
  );
};

export default React.memo(ThumbnailItem);
