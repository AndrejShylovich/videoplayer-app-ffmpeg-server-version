/**
 * Centralized error logger.
 * Allows attaching additional context for easier debugging.
 */
export function logError(err, context = {}) {
  console.error("[ERROR]", {
    message: err.message,
    stack: err.stack,
    ...context,
  });
}

/**
 * Wrapper around fetch with:
 * - HTTP status validation
 * - unified error handling
 * - support for request aborting
 */
export async function safeFetch(
  url,
  options,
  errorMessage = "Request failed"
) {
  try {
    const res = await fetch(url, options);

    // Treat non-2xx responses as errors
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    // AbortError is expected behavior (e.g. component unmount)
    if (err.name === "AbortError") {
      console.warn("[FETCH] Aborted:", url);
      throw err;
    }

    // Log full technical error, but expose a safe message to the caller
    logError(err, { url, options });
    throw new Error(errorMessage);
  }
}
