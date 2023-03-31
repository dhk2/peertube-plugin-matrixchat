export declare enum InvalidStoreState {
    ToggledLazyLoading = 0
}
export declare class InvalidStoreError extends Error {
    readonly reason: InvalidStoreState;
    readonly value: any;
    static TOGGLED_LAZY_LOADING: InvalidStoreState;
    constructor(reason: InvalidStoreState, value: any);
}
export declare enum InvalidCryptoStoreState {
    TooNew = "TOO_NEW"
}
export declare class InvalidCryptoStoreError extends Error {
    readonly reason: InvalidCryptoStoreState;
    static TOO_NEW: InvalidCryptoStoreState;
    constructor(reason: InvalidCryptoStoreState);
}
export declare class KeySignatureUploadError extends Error {
    readonly value: any;
    constructor(message: string, value: any);
}
//# sourceMappingURL=errors.d.ts.map