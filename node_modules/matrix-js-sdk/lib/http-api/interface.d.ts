import { MatrixError } from "./errors";
export interface IHttpOpts {
    fetchFn?: typeof global.fetch;
    baseUrl: string;
    idBaseUrl?: string;
    prefix: string;
    extraParams?: Record<string, string>;
    accessToken?: string;
    useAuthorizationHeader?: boolean;
    onlyData?: boolean;
    localTimeoutMs?: number;
}
export interface IRequestOpts {
    /**
     * The alternative base url to use.
     * If not specified, uses this.opts.baseUrl
     */
    baseUrl?: string;
    /**
     * The full prefix to use e.g.
     * "/_matrix/client/v2_alpha". If not specified, uses this.opts.prefix.
     */
    prefix?: string;
    /**
     * map of additional request headers
     */
    headers?: Record<string, string>;
    abortSignal?: AbortSignal;
    /**
     * The maximum amount of time to wait before
     * timing out the request. If not specified, there is no timeout.
     */
    localTimeoutMs?: number;
    keepAlive?: boolean;
    json?: boolean;
    inhibitLogoutEmit?: boolean;
}
export interface IContentUri {
    base: string;
    path: string;
    params: {
        access_token: string;
    };
}
export declare enum HttpApiEvent {
    SessionLoggedOut = "Session.logged_out",
    NoConsent = "no_consent"
}
export type HttpApiEventHandlerMap = {
    /**
     * Fires whenever the login session the JS SDK is using is no
     * longer valid and the user must log in again.
     * NB. This only fires when action is required from the user, not
     * when then login session can be renewed by using a refresh token.
     * @example
     * ```
     * matrixClient.on("Session.logged_out", function(errorObj){
     *   // show the login screen
     * });
     * ```
     */
    [HttpApiEvent.SessionLoggedOut]: (err: MatrixError) => void;
    /**
     * Fires when the JS SDK receives a M_CONSENT_NOT_GIVEN error in response
     * to a HTTP request.
     * @example
     * ```
     * matrixClient.on("no_consent", function(message, contentUri) {
     *     console.info(message + ' Go to ' + contentUri);
     * });
     * ```
     */
    [HttpApiEvent.NoConsent]: (message: string, consentUri: string) => void;
};
export interface UploadProgress {
    loaded: number;
    total: number;
}
export interface UploadOpts {
    /**
     * Name to give the file on the server. Defaults to <tt>file.name</tt>.
     */
    name?: string;
    /**
     * Content-type for the upload. Defaults to
     *   <tt>file.type</tt>, or <tt>applicaton/octet-stream</tt>.
     */
    type?: string;
    /**
     * if false will not send the filename,
     *   e.g for encrypted file uploads where filename leaks are undesirable.
     *   Defaults to true.
     */
    includeFilename?: boolean;
    /**
     * Optional. Called when a chunk of
     *    data has been uploaded, with an object containing the fields `loaded`
     *    (number of bytes transferred) and `total` (total size, if known).
     */
    progressHandler?(progress: UploadProgress): void;
    abortController?: AbortController;
}
export interface Upload {
    loaded: number;
    total: number;
    promise: Promise<UploadResponse>;
    abortController: AbortController;
}
export interface UploadResponse {
    content_uri: string;
}
export type FileType = XMLHttpRequestBodyInit;
//# sourceMappingURL=interface.d.ts.map