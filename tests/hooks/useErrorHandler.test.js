import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useErrorHandler } from "../../app/hooks/useErrorHandler";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("useErrorHandler hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with initialError", () => {
    const { result } = renderHook(() =>
      useErrorHandler("Initial error")
    );

    expect(result.current.error).toBe("Initial error");
  });

  it("handleError sets error message from err.message", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error("Test error"));
    });

    expect(result.current.error).toBe("Test error");
    expect(toast.error).toHaveBeenCalledWith("An error occurred");
  });

  it("handleError uses custom message if provided", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(null, "Custom error");
    });

    expect(result.current.error).toBe("Custom error");
    expect(toast.error).toHaveBeenCalledWith("Custom error");
  });

  it("handleError falls back to default message if err.message is missing", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError({});
    });

    expect(result.current.error).toBe("An error occurred");
    expect(toast.error).toHaveBeenCalledWith("An error occurred");
  });

  it("clearError resets the error", () => {
    const { result } = renderHook(() =>
      useErrorHandler("Some error")
    );

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
