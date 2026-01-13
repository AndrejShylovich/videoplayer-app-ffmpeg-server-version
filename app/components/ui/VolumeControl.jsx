import React from "react";

/**
 * VolumeControl component
 *
 * Renders a slider to adjust video volume with a percentage display.
 */
const VolumeControl = ({ volume, onVolumeChange }) => {
  const percentage = Math.round(volume * 100); // Display as 0–100%

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <span className="text-sm text-gray-600">Volume:</span>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-24 h-2 bg-gray-200 rounded-lg cursor-pointer"
        aria-label="Volume control"
      />

      {/* Percentage display */}
      <span className="text-sm text-gray-600 w-8">{percentage}%</span>
    </div>
  );
};

export default VolumeControl;
