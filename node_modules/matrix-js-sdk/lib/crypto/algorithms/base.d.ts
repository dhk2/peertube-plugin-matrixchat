/**
 * Internal module. Defines the base classes of the encryption implementations
 */
import type { IMegolmSessionData } from "../../@types/crypto";
import { MatrixClient } from "../../client";
import { Room } from "../../models/room";
import { OlmDevice } from "../OlmDevice";
import { IContent, MatrixEvent, RoomMember } from "../../matrix";
import { Crypto, IEncryptedContent, IEventDecryptionResult, IncomingRoomKeyRequest } from "..";
import { DeviceInfo } from "../deviceinfo";
import { IRoomEncryption } from "../RoomList";
/**
 * Map of registered encryption algorithm classes. A map from string to {@link EncryptionAlgorithm} class
 */
export declare const ENCRYPTION_CLASSES: Map<string, new (params: IParams) => EncryptionAlgorithm>;
export type DecryptionClassParams<P extends IParams = IParams> = Omit<P, "deviceId" | "config">;
/**
 * map of registered encryption algorithm classes. Map from string to {@link DecryptionAlgorithm} class
 */
export declare const DECRYPTION_CLASSES: Map<string, new (params: DecryptionClassParams) => DecryptionAlgorithm>;
export interface IParams {
    /** The UserID for the local user */
    userId: string;
    /** The identifier for this device. */
    deviceId: string;
    /** crypto core */
    crypto: Crypto;
    /** olm.js wrapper */
    olmDevice: OlmDevice;
    /** base matrix api interface */
    baseApis: MatrixClient;
    /** The ID of the room we will be sending to */
    roomId?: string;
    /** The body of the m.room.encryption event */
    config: IRoomEncryption & object;
}
/**
 * base type for encryption implementations
 */
export declare abstract class EncryptionAlgorithm {
    protected readonly userId: string;
    protected readonly deviceId: string;
    protected readonly crypto: Crypto;
    protected readonly olmDevice: OlmDevice;
    protected readonly baseApis: MatrixClient;
    protected readonly roomId?: string;
    /**
     * @param params - parameters
     */
    constructor(params: IParams);
    /**
     * Perform any background tasks that can be done before a message is ready to
     * send, in order to speed up sending of the message.
     *
     * @param room - the room the event is in
     */
    prepareToEncrypt(room: Room): void;
    /**
     * Encrypt a message event
     *
     * @public
     *
     * @param content - event content
     *
     * @returns Promise which resolves to the new event body
     */
    abstract encryptMessage(room: Room, eventType: string, content: IContent): Promise<IEncryptedContent>;
    /**
     * Called when the membership of a member of the room changes.
     *
     * @param event -  event causing the change
     * @param member -  user whose membership changed
     * @param oldMembership -  previous membership
     * @public
     */
    onRoomMembership(event: MatrixEvent, member: RoomMember, oldMembership?: string): void;
    reshareKeyWithDevice?(senderKey: string, sessionId: string, userId: string, device: DeviceInfo): Promise<void>;
    forceDiscardSession?(): void;
}
/**
 * base type for decryption implementations
 */
export declare abstract class DecryptionAlgorithm {
    protected readonly userId: string;
    protected readonly crypto: Crypto;
    protected readonly olmDevice: OlmDevice;
    protected readonly baseApis: MatrixClient;
    protected readonly roomId?: string;
    constructor(params: DecryptionClassParams);
    /**
     * Decrypt an event
     *
     * @param event - undecrypted event
     *
     * @returns promise which
     * resolves once we have finished decrypting. Rejects with an
     * `algorithms.DecryptionError` if there is a problem decrypting the event.
     */
    abstract decryptEvent(event: MatrixEvent): Promise<IEventDecryptionResult>;
    /**
     * Handle a key event
     *
     * @param params - event key event
     */
    onRoomKeyEvent(params: MatrixEvent): Promise<void>;
    /**
     * Import a room key
     *
     * @param opts - object
     */
    importRoomKey(session: IMegolmSessionData, opts: object): Promise<void>;
    /**
     * Determine if we have the keys necessary to respond to a room key request
     *
     * @returns true if we have the keys and could (theoretically) share
     *  them; else false.
     */
    hasKeysForKeyRequest(keyRequest: IncomingRoomKeyRequest): Promise<boolean>;
    /**
     * Send the response to a room key request
     *
     */
    shareKeysWithDevice(keyRequest: IncomingRoomKeyRequest): void;
    /**
     * Retry decrypting all the events from a sender that haven't been
     * decrypted yet.
     *
     * @param senderKey - the sender's key
     */
    retryDecryptionFromSender(senderKey: string): Promise<boolean>;
    onRoomKeyWithheldEvent?(event: MatrixEvent): Promise<void>;
    sendSharedHistoryInboundSessions?(devicesByUser: Record<string, DeviceInfo[]>): Promise<void>;
}
/**
 * Exception thrown when decryption fails
 *
 * @param msg - user-visible message describing the problem
 *
 * @param details - key/value pairs reported in the logs but not shown
 *   to the user.
 */
export declare class DecryptionError extends Error {
    readonly code: string;
    readonly detailedString: string;
    constructor(code: string, msg: string, details?: Record<string, string | Error>);
}
export declare class UnknownDeviceError extends Error {
    readonly devices: Record<string, Record<string, object>>;
    event?: MatrixEvent | undefined;
    /**
     * Exception thrown specifically when we want to warn the user to consider
     * the security of their conversation before continuing
     *
     * @param msg - message describing the problem
     * @param devices - set of unknown devices per user we're warning about
     */
    constructor(msg: string, devices: Record<string, Record<string, object>>, event?: MatrixEvent | undefined);
}
/**
 * Registers an encryption/decryption class for a particular algorithm
 *
 * @param algorithm - algorithm tag to register for
 *
 * @param encryptor - {@link EncryptionAlgorithm} implementation
 *
 * @param decryptor - {@link DecryptionAlgorithm} implementation
 */
export declare function registerAlgorithm<P extends IParams = IParams>(algorithm: string, encryptor: new (params: P) => EncryptionAlgorithm, decryptor: new (params: DecryptionClassParams<P>) => DecryptionAlgorithm): void;
//# sourceMappingURL=base.d.ts.map