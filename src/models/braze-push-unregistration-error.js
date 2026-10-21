/**
 * @class BrazePushUnregistrationError
 * @classdesc Thrown when `unregisterPush` or `logout` fails. The SDK does not retry on its own;
 * inspect `isRetriable` to decide whether calling again may succeed.
 * @property {string} message - Human-readable description of the failure(s).
 * @property {boolean} isRetriable - Whether calling the failed operation again may succeed. For
 *   `logout` on iOS, this is for retrying logout as a whole.
 * @property {number|null} httpStatusCode - The HTTP status code when the failure came from an HTTP
 *   response, or `null` otherwise (e.g. a local rate limit or the SDK being disabled). For `logout`
 *   on iOS, prefers the `unregisterPush` status, then falls back to the push-to-start status.
 */
export class BrazePushUnregistrationError extends Error {
  constructor({ message, isRetriable, httpStatusCode }) {
    super(message);
    this.name = 'BrazePushUnregistrationError';
    this.isRetriable = isRetriable;
    this.httpStatusCode = httpStatusCode;
  }

  /**
   * Builds a `BrazePushUnregistrationError` from an error rejected by the native bridge. The
   * native layer surfaces `isRetriable` and an optional `httpStatusCode` in the error's `userInfo`.
   * @param {*} error - The error rejected by the native bridge.
   * @returns {BrazePushUnregistrationError}
   */
  static fromNativeError(error) {
    const userInfo = (error && error.userInfo) || {};
    let isRetriable = false;
    let httpStatusCode = null;
    if (typeof userInfo.isRetriable === 'boolean') {
      isRetriable = userInfo.isRetriable;
    }
    if (typeof userInfo.httpStatusCode === 'number') {
      httpStatusCode = userInfo.httpStatusCode;
    }
    // Fallback path to ensure it is a readable message.
    const message =
      (error && error.message) || (error && error.code) || String(error);
    return new BrazePushUnregistrationError({
      message,
      isRetriable,
      httpStatusCode
    });
  }
}
