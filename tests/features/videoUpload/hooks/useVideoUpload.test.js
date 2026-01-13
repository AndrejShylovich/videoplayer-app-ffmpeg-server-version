import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVideoUpload } from "../../../../app/features/videoUpload/hooks/useVideoUpload";

/* =======================
   Mocks
======================= */

vi.mock("../../../../app/utils/errorUtils", () => ({
  logError: vi.fn(),
}));

const clearErrorMock = vi.fn();
const handleErrorMock = vi.fn();

vi.mock("../../../../app/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    error: null,
    clearError: clearErrorMock,
    handleError: handleErrorMock,
  }),
}));

/* =======================
   Helpers
======================= */

function createMockFile() {
  return new File(["video"], "video.mp4", { type: "video/mp4" });
}

/* =======================
   Tests
======================= */

describe("useVideoUpload hook", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:video-url"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("successfully uploads a video", async () => {
    const file = createMockFile();

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ filePath: "/uploads/video.mp4" }),
    });

    const { result } = renderHook(() => useVideoUpload());

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(fetch).toHaveBeenCalledWith(
      "/api/upload-video",
      expect.any(Object)
    );

    expect(result.current.videoUrl).toBe("blob:video-url");
    expect(result.current.serverFilePath).toBe("/uploads/video.mp4");
    expect(result.current.isLoading).toBe(false);
    expect(clearErrorMock).toHaveBeenCalled();
  });

  it("handles server response error", async () => {
    const file = createMockFile();

    fetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useVideoUpload());

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(handleErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      "Failed to upload video"
    );

    expect(result.current.videoUrl).toBeNull();
    expect(result.current.serverFilePath).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("handles missing filePath in server response", async () => {
    const file = createMockFile();

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useVideoUpload());

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(handleErrorMock).toHaveBeenCalled();
    expect(result.current.serverFilePath).toBeNull();
  });

  it("reset clears state", () => {
    const { result } = renderHook(() => useVideoUpload());

    act(() => {
      result.current.reset();
    });

    expect(result.current.videoUrl).toBeNull();
    expect(result.current.serverFilePath).toBeNull();
    expect(clearErrorMock).toHaveBeenCalled();
  });

  it("does nothing if no file is provided", async () => {
    const { result } = renderHook(() => useVideoUpload());

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});
