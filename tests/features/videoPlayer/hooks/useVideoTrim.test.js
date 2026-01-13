import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useVideoTrim } from "../../../../app/features/videoPlayer/hooks/useVideoTrim";
import { useErrorHandler } from "../../../../app/hooks/useErrorHandler";
import { safeFetch, logError } from "../../../../app/utils/errorUtils";

vi.mock("../../../../app/hooks/useErrorHandler");
vi.mock("../../../../app/utils/errorUtils");

describe("useVideoTrim hook", () => {
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
  });

  it("initializes trimStart / trimEnd when duration is provided", () => {
    const { result } = renderHook(() => useVideoTrim(20, "/video.mp4"));

    expect(result.current.trimStart).toBe(0);
    expect(result.current.trimEnd).toBe(10);
  });

  it("trimEnd is capped by duration", () => {
    const { result } = renderHook(() => useVideoTrim(5, "/video.mp4"));

    expect(result.current.trimEnd).toBe(5);
  });

  it("onChange correctly clamps values", () => {
    const { result } = renderHook(() => useVideoTrim(10, "/video.mp4"));

    act(() => {
      result.current.onChange(-5, 20);
    });

    expect(result.current.trimStart).toBe(0);
    expect(result.current.trimEnd).toBe(10);
  });

  it("onChange handles invalid duration", () => {
    const { result } = renderHook(() => useVideoTrim(0, "/video.mp4"));

    act(() => {
      result.current.onChange(1, 5);
    });

    expect(logError).toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
  });

  it("trim does not run without serverFilePath", async () => {
    const { result } = renderHook(() => useVideoTrim(10, null));

    await act(async () => {
      await result.current.trim();
    });

    expect(logError).toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
  });

  it("trim does not run with invalid range", async () => {
    const { result } = renderHook(() => useVideoTrim(10, "/video.mp4"));

    act(() => {
      result.current.onChange(5, 3);
    });

    await act(async () => {
      await result.current.trim();
    });

    expect(logError).toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
  });

  it("successfully trims the video", async () => {
    safeFetch.mockResolvedValue({ url: "/trimmed.mp4" });

    const { result } = renderHook(() => useVideoTrim(10, "/video.mp4"));

    await act(async () => {
      await result.current.trim();
    });

    expect(safeFetch).toHaveBeenCalled();
    expect(result.current.trimmedUrl).toBe("/trimmed.mp4");
    expect(result.current.isTrimming).toBe(false);
  });

  it("handles empty server response", async () => {
    safeFetch.mockResolvedValue({});

    const { result } = renderHook(() => useVideoTrim(10, "/video.mp4"));

    await act(async () => {
      await result.current.trim();
    });

    expect(logError).toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
  });

  it("aborts previous request when trim is called again", async () => {
    let abortCalled = false;

    class MockAbortController {
      constructor() {
        this.signal = {};
      }
      abort() {
        abortCalled = true;
      }
    }

    global.AbortController = MockAbortController;

    safeFetch.mockImplementation(
      () => new Promise(() => {}) // forever pending
    );

    const { result } = renderHook(() => useVideoTrim(10, "/video.mp4"));

    await act(async () => {
      result.current.trim();
    });

    await act(async () => {
      result.current.trim();
    });

    expect(abortCalled).toBe(true);
  });

  it("ignores AbortError", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";

    safeFetch.mockRejectedValue(abortError);

    const { result } = renderHook(() => useVideoTrim(10, "/video.mp4"));

    await act(async () => {
      await result.current.trim();
    });

    expect(handleErrorMock).not.toHaveBeenCalled();
  });

  it("abort is called on unmount", async () => {
    let aborted = false;

    class MockAbortController {
      constructor() {
        this.signal = {};
      }
      abort() {
        aborted = true;
      }
    }

    global.AbortController = MockAbortController;

    safeFetch.mockImplementation(
      () => new Promise(() => {}) // forever pending
    );

    const { result, unmount } = renderHook(() =>
      useVideoTrim(10, "/video.mp4")
    );

    act(() => {
      result.current.trim();
    });

    await act(async () => Promise.resolve());

    unmount();

    expect(aborted).toBe(true);
  });
});
