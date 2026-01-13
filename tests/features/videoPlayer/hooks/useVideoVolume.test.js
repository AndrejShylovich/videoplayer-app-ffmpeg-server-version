import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useVideoVolume } from "../../../../app/features/videoPlayer/hooks/useVideoVolume";
import { useErrorHandler } from "../../../../app/hooks/useErrorHandler";
import { logError } from "../../../../app/utils/errorUtils";

vi.mock("../../../../app/hooks/useErrorHandler");
vi.mock("../../../../app/utils/errorUtils");

describe("useVideoVolume hook", () => {
  let video;
  let videoRef;
  let handleErrorMock;
  let clearErrorMock;

  beforeEach(() => {
    vi.clearAllMocks();

    handleErrorMock = vi.fn();
    clearErrorMock = vi.fn();

    useErrorHandler.mockReturnValue({
      error: null,
      handleError: handleErrorMock,
      clearError: clearErrorMock,
    });

    video = {
      volume: 0.8,
    };

    videoRef = { current: video };
  });

  it("initializes with volume = 0.8", () => {
    const { result } = renderHook(() => useVideoVolume(videoRef));

    expect(result.current.volume).toBe(0.8);
  });

  it("changes the video volume", () => {
    const { result } = renderHook(() => useVideoVolume(videoRef));

    act(() => {
      result.current.onVolumeChange(0.5);
    });

    expect(clearErrorMock).toHaveBeenCalled();
    expect(result.current.volume).toBe(0.5);
    expect(video.volume).toBe(0.5);
  });

  it("clamps values below 0 to 0", () => {
    const { result } = renderHook(() => useVideoVolume(videoRef));

    act(() => {
      result.current.onVolumeChange(-1);
    });

    expect(result.current.volume).toBe(0);
    expect(video.volume).toBe(0);
  });

  it("clamps values above 1 to 1", () => {
    const { result } = renderHook(() => useVideoVolume(videoRef));

    act(() => {
      result.current.onVolumeChange(2);
    });

    expect(result.current.volume).toBe(1);
    expect(video.volume).toBe(1);
  });

  it("handles missing video element", () => {
    videoRef.current = null;

    const { result } = renderHook(() => useVideoVolume(videoRef));

    act(() => {
      result.current.onVolumeChange(0.5);
    });

    expect(clearErrorMock).toHaveBeenCalled();
    expect(logError).toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
  });

  it("handles exceptions when setting volume", () => {
    Object.defineProperty(video, "volume", {
      set() {
        throw new Error("Volume failed");
      },
    });

    const { result } = renderHook(() => useVideoVolume(videoRef));

    act(() => {
      result.current.onVolumeChange(0.5);
    });

    expect(logError).toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
  });
});
