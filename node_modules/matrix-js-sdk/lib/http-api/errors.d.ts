import { IUsageLimit } from "../@types/partials";
import { MatrixEvent } from "../models/event";
interface IErrorJson extends Partial<IUsageLimit> {
    [key: string]: any;
    errcode?: string;
    error?: string;
}
/**
 * Construct a generic HTTP error. This is a JavaScript Error with additional information
 * specific to HTTP responses.
 * @param msg - The error message to include.
 * @param httpStatus - The HTTP response status code.
 */
export declare class HTTPError extends Error {
    readonly httpStatus?: number | undefined;
    constructor(msg: string, httpStatus?: number | undefined);
}
export declare class MatrixError extends HTTPError {
    readonly httpStatus?: number | undefined;
    url?: string | undefined;
    event?: MatrixEvent | undefined;
    readonly errcode?: string;
    data: IErrorJson;
    /**
     * Construct a Matrix error. This is a JavaScript Error with additional
     * information specific to the standard Matrix error response.
     * @param errorJson - The Matrix error JSON returned from the homeserver.
     * @param httpStatus - The numeric HTTP status code given
     */
    constructor(errorJson?: IErrorJson, httpStatus?: number | undefined, url?: string | undefined, event?: MatrixEvent | undefined);
}
/**
 * Construct a ConnectionError. This is a JavaScript Error indicating
 * that a request failed because of some error with the connection, either
 * CORS was not correctly configured on the server, the server didn't response,
 * the request timed out, or the internet connection on the client side went down.
 */
export declare class ConnectionError extends Error {
    constructor(message: string, cause?: Error);
    get name(): string;
}
export {};
//# sourceMappingURL=errors.d.ts.map