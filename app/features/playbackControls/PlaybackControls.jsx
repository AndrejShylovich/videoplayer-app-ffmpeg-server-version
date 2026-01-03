import React from "react";
import CustomButton from "../../components/ui/CustomButton";

const PlaybackControls = ({ isPlaying, onPlayPause, onSkip }) => {
  return (
    <div className="flex justify-center gap-3">
      <CustomButton onClick={() => onSkip(-10)}>-10c</CustomButton>
      <CustomButton
        onClick={onPlayPause}
        active={isPlaying}
        className="w-12 h-12"
      >
        {isPlaying ? "⏸" : "⏵"}
      </CustomButton>
      <CustomButton onClick={() => onSkip(10)}>+10c</CustomButton>
    </div>
  );
};

export default PlaybackControls;
