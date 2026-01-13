"use client";

import React, { useCallback, useState } from "react";

/**
 * VideoUpload component
 *
 * Provides drag-and-drop and click-to-select functionality for uploading videos.
 * Supports disabled/loading state and visual feedback for drag interactions.
 */

const VideoUpload = ({ isLoading, onFile }) => {
  // State to track whether a file is being dragged over the drop area
  const [dragActive, setDragActive] = useState(false);

  // Handle drag events to provide visual feedback
  const handleDrag = useCallback(
    (e) => {
      if (isLoading) return;
      e.preventDefault();
      setDragActive(e.type !== "dragleave"); // true for dragenter/dragover, false for dragleave
    },
    [isLoading]
  );

  // Handle file drop
  const handleDrop = useCallback(
    (e) => {
      if (isLoading) return;
      e.preventDefault();
      setDragActive(false);
      onFile(e.dataTransfer.files?.[0]); // pass the first file to parent
    },
    [isLoading, onFile]
  );

  // Handle file selection via the hidden input
  const handleChange = useCallback(
    (e) => onFile(e.target.files?.[0]),
    [onFile]
  );

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-md h-64 transition-all
        ${isLoading ? "opacity-70 pointer-events-none" : "cursor-pointer"}
        ${dragActive ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-300"}
      `}
    >
      {/* Display different messages depending on upload state */}
      {isLoading ? (
        <p className="text-gray-500">Uploading...</p>
      ) : (
        <p className="text-gray-500 text-center px-4">
          Drag and drop a video here, or click to select a file
        </p>
      )}

      {/* Hidden file input for click-to-upload */}
      <input
        type="file"
        accept="video/*"
        disabled={isLoading}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default VideoUpload;
