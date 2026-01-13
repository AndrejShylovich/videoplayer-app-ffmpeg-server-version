import { logError, safeFetch } from "../../app/utils/errorUtils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("errorUtils", () => {
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("logError", () => {
    it("logs error with message, stack, and context", () => {
      const err = new Error("Test error");
      logError(err, { foo: "bar" });

      expect(consoleErrorSpy).toHaveBeenCalledWith("[ERROR]", {
        message: "Test error",
        stack: err.stack,
        foo: "bar",
      });
    });
  });

  describe("safeFetch", () => {
    it("returns JSON on successful request", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ ok: true }),
      });

      const result = await safeFetch("/test");

      expect(result).toEqual({ ok: true });
      expect(fetch).toHaveBeenCalledWith("/test", undefined);
    });

    it("throws custom error on HTTP failure", async () => {
      fetch.mockResolvedValue({ ok: false, status: 404 });

      await expect(
        safeFetch("/test", {}, "Failed to fetch")
      ).rejects.toThrow("Failed to fetch");

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("logs error and throws custom message", async () => {
      fetch.mockRejectedValue(new Error("Network error"));

      await expect(safeFetch("/test")).rejects.toThrow("Request failed");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[ERROR]",
        expect.objectContaining({ message: "Network error" })
      );
    });

    it("throws AbortError without logging", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";

      fetch.mockRejectedValue(abortError);

      await expect(safeFetch("/test")).rejects.toBe(abortError);

      expect(consoleWarnSpy).toHaveBeenCalledWith("[FETCH] Aborted:", "/test");
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
