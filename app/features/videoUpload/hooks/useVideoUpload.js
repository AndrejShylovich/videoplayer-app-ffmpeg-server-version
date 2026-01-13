"use client";

import { useCallback, useState } from "react";
import { logError } from "../../../utils/errorUtils";
import { useErrorHandler } from "../../../hooks/useErrorHandler";

/**
 * Custom hook for managing video upload flow.
 * Handles:
 * - Client-side preview
 * - Upload to server
 * - Loading state
 * - Error handling
 */

export function useVideoUpload() {
  const [videoUrl, setVideoUrl] = useState(null);           // Local preview URL
  const [serverFilePath, setServerFilePath] = useState(null); // Path returned from server
  const [isLoading, setIsLoading] = useState(false);        // Upload in progress

  // Custom error handling hook
  const { error, handleError, clearError } = useErrorHandler();

  /**
   * Upload a video file:
   * - Generates a client preview
   * - Posts to server via FormData
   * - Handles success and errors
   */
  const uploadFile = useCallback(
    async (file) => {
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      setIsLoading(true);
      clearError();

      try {
        const formData = new FormData();
        formData.append("videoFile", file);

        const res = await fetch("/api/upload-video", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status}`);
        }

        const data = await res.json();
        if (!data.filePath) {
          throw new Error("No filePath returned from server");
        }

        setServerFilePath(data.filePath);
      } catch (err) {
        // Log full error for debugging, show user-friendly message
        logError(err, { action: "uploadVideo", fileName: file.name });
        handleError(err, "Failed to upload video");
        setVideoUrl(null);
        setServerFilePath(null);
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, handleError]
  );

  // Reset hook state to initial
  const reset = useCallback(() => {
    setVideoUrl(null);
    setServerFilePath(null);
    clearError();
  }, [clearError]);

  return {
    videoUrl,
    serverFilePath,
    isLoading,
    error,
    uploadFile,
    reset,
  };
}
