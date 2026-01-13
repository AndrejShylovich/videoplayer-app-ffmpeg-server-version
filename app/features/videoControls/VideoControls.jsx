import React from "react";
import ProgressBar from "../../components/ui/ProgressBar";
import VolumeControl from "../../components/ui/VolumeControl";
import PlaybackControls from "../playbackControls/PlaybackControls";

/**
 * VideoControls component
 *
 * Combines playback buttons, progress bar, and volume control.
 */
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
    {/* Playback buttons (play/pause, skip) */}
    <PlaybackControls
      isPlaying={isPlaying}
      onPlayPause={onPlayPause}
      onSkip={onSkip}
    />

    {/* Video progress bar */}
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

    {/* Volume control slider */}
    <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
  </div>
);

// React.memo to avoid unnecessary re-renders
export default React.memo(VideoControls);
