/// <reference types="node" />
/**
 * QR code key verification.
 */
import { VerificationBase as Base, VerificationEventHandlerMap } from "./Base";
import { VerificationRequest } from "./request/VerificationRequest";
import { MatrixClient } from "../../client";
import { IVerificationChannel } from "./request/Channel";
import { MatrixEvent } from "../../models/event";
export declare const SHOW_QR_CODE_METHOD = "m.qr_code.show.v1";
export declare const SCAN_QR_CODE_METHOD = "m.qr_code.scan.v1";
interface IReciprocateQr {
    confirm(): void;
    cancel(): void;
}
export declare enum QrCodeEvent {
    ShowReciprocateQr = "show_reciprocate_qr"
}
type EventHandlerMap = {
    [QrCodeEvent.ShowReciprocateQr]: (qr: IReciprocateQr) => void;
} & VerificationEventHandlerMap;
export declare class ReciprocateQRCode extends Base<QrCodeEvent, EventHandlerMap> {
    reciprocateQREvent?: IReciprocateQr;
    static factory(channel: IVerificationChannel, baseApis: MatrixClient, userId: string, deviceId: string, startEvent: MatrixEvent, request: VerificationRequest): ReciprocateQRCode;
    static get NAME(): string;
    protected doVerification: () => Promise<void>;
}
declare enum Mode {
    VerifyOtherUser = 0,
    VerifySelfTrusted = 1,
    VerifySelfUntrusted = 2
}
export declare class QRCodeData {
    readonly mode: Mode;
    private readonly sharedSecret;
    readonly otherUserMasterKey: string | null;
    readonly otherDeviceKey: string | null;
    readonly myMasterKey: string | null;
    private readonly buffer;
    constructor(mode: Mode, sharedSecret: string, otherUserMasterKey: string | null, otherDeviceKey: string | null, myMasterKey: string | null, buffer: Buffer);
    static create(request: VerificationRequest, client: MatrixClient): Promise<QRCodeData>;
    /**
     * The unpadded base64 encoded shared secret.
     */
    get encodedSharedSecret(): string;
    getBuffer(): Buffer;
    private static generateSharedSecret;
    private static getOtherDeviceKey;
    private static determineMode;
    private static generateQrData;
    private static generateBuffer;
}
export {};
//# sourceMappingURL=QRCode.d.ts.map