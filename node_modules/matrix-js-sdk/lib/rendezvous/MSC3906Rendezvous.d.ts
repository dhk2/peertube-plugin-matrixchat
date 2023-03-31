import { RendezvousChannel, RendezvousFailureListener, RendezvousFailureReason, RendezvousIntent } from ".";
import { MatrixClient } from "../client";
import { CrossSigningInfo } from "../crypto/CrossSigning";
import { DeviceInfo } from "../crypto/deviceinfo";
declare enum PayloadType {
    Start = "m.login.start",
    Finish = "m.login.finish",
    Progress = "m.login.progress"
}
declare enum Outcome {
    Success = "success",
    Failure = "failure",
    Verified = "verified",
    Declined = "declined",
    Unsupported = "unsupported"
}
export interface MSC3906RendezvousPayload {
    type: PayloadType;
    intent?: RendezvousIntent;
    outcome?: Outcome;
    device_id?: string;
    device_key?: string;
    verifying_device_id?: string;
    verifying_device_key?: string;
    master_key?: string;
    protocols?: string[];
    protocol?: string;
    login_token?: string;
    homeserver?: string;
}
/**
 * Implements MSC3906 to allow a user to sign in on a new device using QR code.
 * This implementation only supports generating a QR code on a device that is already signed in.
 * Note that this is UNSTABLE and may have breaking changes without notice.
 */
export declare class MSC3906Rendezvous {
    private channel;
    private client;
    onFailure?: RendezvousFailureListener | undefined;
    private newDeviceId?;
    private newDeviceKey?;
    private ourIntent;
    private _code?;
    /**
     * @param channel - The secure channel used for communication
     * @param client - The Matrix client in used on the device already logged in
     * @param onFailure - Callback for when the rendezvous fails
     */
    constructor(channel: RendezvousChannel<MSC3906RendezvousPayload>, client: MatrixClient, onFailure?: RendezvousFailureListener | undefined);
    /**
     * Returns the code representing the rendezvous suitable for rendering in a QR code or undefined if not generated yet.
     */
    get code(): string | undefined;
    /**
     * Generate the code including doing partial set up of the channel where required.
     */
    generateCode(): Promise<void>;
    startAfterShowingCode(): Promise<string | undefined>;
    private receive;
    private send;
    declineLoginOnExistingDevice(): Promise<void>;
    approveLoginOnExistingDevice(loginToken: string): Promise<string | undefined>;
    private verifyAndCrossSignDevice;
    /**
     * Verify the device and cross-sign it.
     * @param timeout - time in milliseconds to wait for device to come online
     * @returns the new device info if the device was verified
     */
    verifyNewDeviceOnExistingDevice(timeout?: number): Promise<DeviceInfo | CrossSigningInfo | undefined>;
    cancel(reason: RendezvousFailureReason): Promise<void>;
    close(): Promise<void>;
}
export {};
//# sourceMappingURL=MSC3906Rendezvous.d.ts.map