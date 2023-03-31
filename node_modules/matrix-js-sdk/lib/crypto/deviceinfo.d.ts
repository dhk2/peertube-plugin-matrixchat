import { ISignatures } from "../@types/signed";
export interface IDevice {
    keys: Record<string, string>;
    algorithms: string[];
    verified: DeviceVerification;
    known: boolean;
    unsigned?: Record<string, any>;
    signatures?: ISignatures;
}
declare enum DeviceVerification {
    Blocked = -1,
    Unverified = 0,
    Verified = 1
}
/**
 * Information about a user's device
 */
export declare class DeviceInfo {
    readonly deviceId: string;
    /**
     * rehydrate a DeviceInfo from the session store
     *
     * @param obj -  raw object from session store
     * @param deviceId - id of the device
     *
     * @returns new DeviceInfo
     */
    static fromStorage(obj: Partial<IDevice>, deviceId: string): DeviceInfo;
    static DeviceVerification: {
        VERIFIED: DeviceVerification;
        UNVERIFIED: DeviceVerification;
        BLOCKED: DeviceVerification;
    };
    /** list of algorithms supported by this device */
    algorithms: string[];
    /** a map from `<key type>:<id> -> <base64-encoded key>` */
    keys: Record<string, string>;
    /** whether the device has been verified/blocked by the user */
    verified: DeviceVerification;
    /**
     * whether the user knows of this device's existence
     * (useful when warning the user that a user has added new devices)
     */
    known: boolean;
    /** additional data from the homeserver */
    unsigned: Record<string, any>;
    signatures: ISignatures;
    /**
     * @param deviceId - id of the device
     */
    constructor(deviceId: string);
    /**
     * Prepare a DeviceInfo for JSON serialisation in the session store
     *
     * @returns deviceinfo with non-serialised members removed
     */
    toStorage(): IDevice;
    /**
     * Get the fingerprint for this device (ie, the Ed25519 key)
     *
     * @returns base64-encoded fingerprint of this device
     */
    getFingerprint(): string;
    /**
     * Get the identity key for this device (ie, the Curve25519 key)
     *
     * @returns base64-encoded identity key of this device
     */
    getIdentityKey(): string;
    /**
     * Get the configured display name for this device, if any
     *
     * @returns displayname
     */
    getDisplayName(): string | null;
    /**
     * Returns true if this device is blocked
     *
     * @returns true if blocked
     */
    isBlocked(): boolean;
    /**
     * Returns true if this device is verified
     *
     * @returns true if verified
     */
    isVerified(): boolean;
    /**
     * Returns true if this device is unverified
     *
     * @returns true if unverified
     */
    isUnverified(): boolean;
    /**
     * Returns true if the user knows about this device's existence
     *
     * @returns true if known
     */
    isKnown(): boolean;
}
export {};
//# sourceMappingURL=deviceinfo.d.ts.map