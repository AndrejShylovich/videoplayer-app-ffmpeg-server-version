import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useVideoPlayback } from "../../../../app/features/videoPlayer/hooks/useVideoPlayback";
import { useErrorHandler } from "../../../../app/hooks/useErrorHandler";
import { logError } from "../../../../app/utils/errorUtils";

vi.mock("../../../../app/hooks/useErrorHandler");
vi.mock("../../../../app/utils/errorUtils");

function createMockVideo() {
  let listeners = {};

  return {
    paused: true,
    duration: 120,
    currentTime: 0,
    error: null,

    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),

    addEventListener: vi.fn((event, cb) => {
      listeners[event] = cb;
    }),
    removeEventListener: vi.fn(),

    trigger(event) {
      listeners[event]?.();
    },
  };
}

describe("useVideoPlayback hook", () => {
  let video;
  let videoRef;

  beforeEach(() => {
    video = createMockVideo();
    videoRef = { current: video };
    vi.clearAllMocks();
  });

  useErrorHandler.mockReturnValue({
    error: null,
    handleError: vi.fn(),
    clearError: vi.fn(),
  });

  it("plays the video when togglePlay() is called", async () => {
    const { result } = renderHook(() => useVideoPlayback(videoRef));

    await act(async () => {
      result.current.togglePlay();
    });

    expect(video.play).toHaveBeenCalled();
  });

  it("pauses the video if it is already playing", () => {
    video.paused = false;

    const { result } = renderHook(() => useVideoPlayback(videoRef));

    act(() => {
      result.current.togglePlay();
    });

    expect(video.pause).toHaveBeenCalled();
  });

  it("sets duration on onLoadedMetadata()", () => {
    const { result } = renderHook(() => useVideoPlayback(videoRef));

    act(() => {
      result.current.onLoadedMetadata();
    });

    expect(result.current.duration).toBe(120);
  });

  it("handles invalid video duration error", () => {
    video.duration = Infinity;

    const { result } = renderHook(() => useVideoPlayback(videoRef));

    act(() => {
      result.current.onLoadedMetadata();
    });

    expect(logError).toHaveBeenCalled();
    expect(useErrorHandler().handleError).toHaveBeenCalled();
  });

  it("updates isPlaying state on play event", () => {
    const { result } = renderHook(() => useVideoPlayback(videoRef));

    act(() => {
      video.trigger("play");
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it("updates isPlaying state on pause event", () => {
    const { result } = renderHook(() => useVideoPlayback(videoRef));

    act(() => {
      video.trigger("pause");
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("updates played state on timeupdate event", async () => {
    const { result } = renderHook(() => useVideoPlayback(videoRef));

    act(() => {
      result.current.setDuration(100);
    });

    await act(async () => {});

    act(() => {
      video.currentTime = 50;
      video.trigger("timeupdate");
    });

    expect(result.current.played).toBe(0.5);
  });

  it("handles video error event", () => {
    video.error = new Error("Video failed");

    renderHook(() => useVideoPlayback(videoRef));

    act(() => {
      video.trigger("error");
    });

    expect(logError).toHaveBeenCalled();
    expect(useErrorHandler().handleError).toHaveBeenCalled();
  });
});
