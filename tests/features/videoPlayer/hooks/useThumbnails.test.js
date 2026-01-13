import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThumbnails } from "../../../../app/features/videoPlayer/hooks/useThumbnails";

const mockHandleError = vi.fn();
const mockClearError = vi.fn();

vi.mock("../../../../app/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    error: null,
    handleError: mockHandleError,
    clearError: mockClearError,
  }),
}));

const safeFetchMock = vi.fn();
const logErrorMock = vi.fn();

vi.mock("../../../../app/utils/errorUtils", () => ({
  safeFetch: (...args) => safeFetchMock(...args),
  logError: (...args) => logErrorMock(...args),
}));

const framesResponse = {
  frames: ["url1", "url2", "url3"],
};

describe("useThumbnails hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.revokeObjectURL = vi.fn();
    global.AbortController = class {
      signal = "signal";
      abort = vi.fn();
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not call fetch if duration or serverFilePath is missing", () => {
    renderHook(() =>
      useThumbnails({ duration: 0, serverFilePath: null })
    );

    expect(safeFetchMock).not.toHaveBeenCalled();
  });

  it("successfully fetches and generates thumbnails", async () => {
    safeFetchMock.mockResolvedValue(framesResponse);

    const { result } = renderHook(() =>
      useThumbnails({
        duration: 9,
        serverFilePath: "/file.mp4",
      })
    );

    await act(async () => {});

    expect(safeFetchMock).toHaveBeenCalledWith(
      "/api/frames-preview",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          filePath: "/file.mp4",
          fps: Math.min(3, 50 / 9),
          frameWidth: 120,
        }),
      }),
      "Failed to fetch video frames"
    );

    expect(result.current.thumbnails).toHaveLength(3);
    expect(result.current.thumbnails[0]).toEqual({
      time: 3,
      url: "url1",
    });
  });

  it("cleans up previous ObjectURLs on regenerate", async () => {
    safeFetchMock.mockResolvedValue(framesResponse);

    const { result } = renderHook(() =>
      useThumbnails({
        duration: 6,
        serverFilePath: "/file.mp4",
      })
    );

    await act(async () => {});

    await act(async () => {
      await result.current.regenerate();
    });

    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("handles invalid server response", async () => {
    safeFetchMock.mockResolvedValue({});

    renderHook(() =>
      useThumbnails({
        duration: 5,
        serverFilePath: "/file.mp4",
      })
    );

    await act(async () => {});

    expect(logErrorMock).toHaveBeenCalled();
    expect(mockHandleError).toHaveBeenCalledWith(
      expect.any(Error),
      "Failed to generate video preview"
    );
  });

  it("ignores AbortError", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";

    safeFetchMock.mockRejectedValue(abortError);

    renderHook(() =>
      useThumbnails({
        duration: 5,
        serverFilePath: "/file.mp4",
      })
    );

    await act(async () => {});

    expect(logErrorMock).not.toHaveBeenCalled();
    expect(mockHandleError).not.toHaveBeenCalled();
  });

  it("calls abort on unmount", async () => {
    safeFetchMock.mockResolvedValue(framesResponse);

    const { unmount } = renderHook(() =>
      useThumbnails({
        duration: 5,
        serverFilePath: "/file.mp4",
      })
    );

    await act(async () => {});

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
