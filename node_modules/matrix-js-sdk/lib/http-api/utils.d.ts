export declare function timeoutSignal(ms: number): AbortSignal;
export declare function anySignal(signals: AbortSignal[]): {
    signal: AbortSignal;
    cleanup(): void;
};
/**
 * Attempt to turn an HTTP error response into a Javascript Error.
 *
 * If it is a JSON response, we will parse it into a MatrixError. Otherwise
 * we return a generic Error.
 *
 * @param response - response object
 * @param body - raw body of the response
 * @returns
 */
export declare function parseErrorResponse(response: XMLHttpRequest | Response, body?: string): Error;
/**
 * Retries a network operation run in a callback.
 * @param maxAttempts - maximum attempts to try
 * @param callback - callback that returns a promise of the network operation. If rejected with ConnectionError, it will be retried by calling the callback again.
 * @returns the result of the network operation
 * @throws {@link ConnectionError} If after maxAttempts the callback still throws ConnectionError
 */
export declare function retryNetworkOperation<T>(maxAttempts: number, callback: () => Promise<T>): Promise<T>;
//# sourceMappingURL=utils.d.ts.map