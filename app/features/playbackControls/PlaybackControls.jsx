import React from "react";
import CustomButton from "../../components/ui/CustomButton";

/**
 * PlaybackControls component
 *
 * Renders video playback buttons: skip backward, play/pause, skip forward.
 */
const PlaybackControls = ({ isPlaying, onPlayPause, onSkip }) => {
  return (
    <div className="flex justify-center gap-3">
      {/* Skip backward 10 seconds */}
      <CustomButton onClick={() => onSkip(-10)}>-10s</CustomButton>

      {/* Play / Pause toggle */}
      <CustomButton
        onClick={onPlayPause}
        active={isPlaying}
        className="w-12 h-12"
      >
        {isPlaying ? "⏸" : "⏵"}
      </CustomButton>

      {/* Skip forward 10 seconds */}
      <CustomButton onClick={() => onSkip(10)}>+10s</CustomButton>
    </div>
  );
};

export default PlaybackControls;
