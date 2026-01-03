import React from "react";

const VolumeControl = ({ volume, onVolumeChange }) => {
  const percentage = Math.round(volume * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Volume:</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={onVolumeChange}
        className="volume-bar w-24 h-2 bg-gray-200 rounded-lg cursor-pointer"
        aria-label="Volume control"
      />
      <span className="text-sm text-gray-600 w-8">{percentage}%</span>
    </div>
  );
};

export default VolumeControl;
