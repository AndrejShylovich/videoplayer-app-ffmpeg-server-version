import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useVideoSeek } from "../../../../app/features/videoPlayer/hooks/useVideoSeek";
import { useErrorHandler } from "../../../../app/hooks/useErrorHandler";
import { logError } from "../../../../app/utils/errorUtils";

vi.mock("../../../../app/hooks/useErrorHandler");
vi.mock("../../../../app/utils/errorUtils");

describe("useVideoSeek hook", () => {
  let video;
  let videoRef;
  let seekRef;
  let setPlayedMock;
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
      currentTime: 0,
    };

    videoRef = { current: video };
    seekRef = { current: false };
    setPlayedMock = vi.fn();
  });

  it("sets seeking mode on onSeekStart()", () => {
    const { result } = renderHook(() =>
      useVideoSeek({
        videoRef,
        duration: 100,
        seekRef,
        setPlayed: setPlayedMock,
      })
    );

    act(() => {
      result.current.onSeekStart();
    });

    expect(clearErrorMock).toHaveBeenCalled();
    expect(seekRef.current).toBe(true);
    expect(result.current.isSeeking).toBe(true);
  });

  it("calls setPlayed on onSeekChange()", () => {
    const { result } = renderHook(() =>
      useVideoSeek({
        videoRef,
        duration: 100,
        seekRef,
        setPlayed: setPlayedMock,
      })
    );

    act(() => {
      result.current.onSeekChange(0.3);
    });

    expect(setPlayedMock).toHaveBeenCalledWith(0.3);
  });

  it("correctly seeks video on onSeekEnd()", () => {
    const { result } = renderHook(() =>
      useVideoSeek({
        videoRef,
        duration: 100,
        seekRef,
        setPlayed: setPlayedMock,
      })
    );

    seekRef.current = true;

    act(() => {
      result.current.onSeekEnd(0.5);
    });

    expect(video.currentTime).toBe(50);
    expect(seekRef.current).toBe(false);
    expect(result.current.isSeeking).toBe(false);
  });

  it("handles missing video element on onSeekEnd()", () => {
    videoRef.current = null;

    const { result } = renderHook(() =>
      useVideoSeek({
        videoRef,
        duration: 100,
        seekRef,
        setPlayed: setPlayedMock,
      })
    );

    act(() => {
      result.current.onSeekEnd(0.5);
    });

    expect(logError).toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
  });

  it("handles invalid duration on onSeekEnd()", () => {
    const { result } = renderHook(() =>
      useVideoSeek({
        videoRef,
        duration: Infinity,
        seekRef,
        setPlayed: setPlayedMock,
      })
    );

    act(() => {
      result.current.onSeekEnd(0.5);
    });

    expect(logError).toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
  });

  it("handles exceptions when setting currentTime on onSeekEnd()", () => {
    Object.defineProperty(video, "currentTime", {
      set() {
        throw new Error("Seek failed");
      },
    });

    const { result } = renderHook(() =>
      useVideoSeek({
        videoRef,
        duration: 100,
        seekRef,
        setPlayed: setPlayedMock,
      })
    );

    act(() => {
      result.current.onSeekEnd(0.5);
    });

    expect(logError).toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
  });
});
