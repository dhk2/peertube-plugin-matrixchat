/**
 * Get the HTTP URL for an MXC URI.
 * @param baseUrl - The base homeserver url which has a content repo.
 * @param mxc - The mxc:// URI.
 * @param width - The desired width of the thumbnail.
 * @param height - The desired height of the thumbnail.
 * @param resizeMethod - The thumbnail resize method to use, either
 * "crop" or "scale".
 * @param allowDirectLinks - If true, return any non-mxc URLs
 * directly. Fetching such URLs will leak information about the user to
 * anyone they share a room with. If false, will return the emptry string
 * for such URLs.
 * @returns The complete URL to the content.
 */
export declare function getHttpUriForMxc(baseUrl: string, mxc?: string, width?: number, height?: number, resizeMethod?: string, allowDirectLinks?: boolean): string;
//# sourceMappingURL=content-repo.d.ts.map