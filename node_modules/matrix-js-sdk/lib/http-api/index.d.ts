import { FetchHttpApi } from "./fetch";
import { FileType, IContentUri, IHttpOpts, Upload, UploadOpts, UploadResponse } from "./interface";
export * from "./interface";
export * from "./prefix";
export * from "./errors";
export * from "./method";
export * from "./utils";
export declare class MatrixHttpApi<O extends IHttpOpts> extends FetchHttpApi<O> {
    private uploads;
    /**
     * Upload content to the homeserver
     *
     * @param file - The object to upload. On a browser, something that
     *   can be sent to XMLHttpRequest.send (typically a File).  Under node.js,
     *   a Buffer, String or ReadStream.
     *
     * @param opts - options object
     *
     * @returns Promise which resolves to response object, as
     *    determined by this.opts.onlyData, opts.rawResponse, and
     *    opts.onlyContentUri.  Rejects with an error (usually a MatrixError).
     */
    uploadContent(file: FileType, opts?: UploadOpts): Promise<UploadResponse>;
    cancelUpload(promise: Promise<UploadResponse>): boolean;
    getCurrentUploads(): Upload[];
    /**
     * Get the content repository url with query parameters.
     * @returns An object with a 'base', 'path' and 'params' for base URL,
     *          path and query parameters respectively.
     */
    getContentUri(): IContentUri;
}
//# sourceMappingURL=index.d.ts.map