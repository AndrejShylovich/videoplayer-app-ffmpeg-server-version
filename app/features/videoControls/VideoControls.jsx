import React from "react";
import ProgressBar from "../../components/ui/ProgressBar";
import VolumeControl from "../../components/ui/VolumeControl";
import PlaybackControls from "../playbackControls/PlaybackControls";

const VideoControls = ({
  isPlaying,
  played,
  duration,
  volume,
  isSeeking,
  onPlayPause,
  onSeekChange,
  onSeekStart,
  onSeekEnd,
  onVolumeChange,
  onSkip,
}) => (
  <div className="controls space-y-3">
    <PlaybackControls
      isPlaying={isPlaying}
      onPlayPause={onPlayPause}
      onSkip={onSkip}
    />

    <ProgressBar
      played={played}
      duration={duration}
      isSeeking={isSeeking}
      onChange={onSeekChange}
      onMouseDown={onSeekStart}
      onMouseUp={onSeekEnd}
      onTouchStart={onSeekStart}
      onTouchEnd={onSeekEnd}
    />

    <VolumeControl
      volume={volume}
      onVolumeChange={onVolumeChange}
    />
  </div>
);

export default React.memo(VideoControls);
