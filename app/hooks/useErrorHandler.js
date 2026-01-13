import { useState, useCallback } from "react";
import { toast } from "react-toastify";

/**
 * Custom React hook for centralized error handling.
 * Provides state for the current error, a function to handle errors,
 * and a function to clear errors.
 */
export function useErrorHandler(initialError = null) {
  // State to store the current error message
  const [error, setError] = useState(initialError);

  /**
   * Handles an error:
   * - Updates local error state
   * - Displays a toast notification
   */
  const handleError = useCallback((err, message = "An error occurred") => {
    setError(err?.message || message);
    toast.error(message);
  }, []);

  // Clears the current error state
  const clearError = useCallback(() => setError(null), []);

  return { error, handleError, clearError };
}
