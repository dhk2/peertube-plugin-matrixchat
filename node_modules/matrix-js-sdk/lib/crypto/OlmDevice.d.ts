import { PrefixedLogger } from "../logger";
import { CryptoStore, IProblem, ISessionInfo } from "./store/base";
import { IOlmDevice, IOutboundGroupSessionKey } from "./algorithms/megolm";
import { IMegolmSessionData, OlmGroupSessionExtraData } from "../@types/crypto";
import { IMessage } from "./algorithms/olm";
export declare class PayloadTooLargeError extends Error {
    readonly data: {
        errcode: string;
        error: string;
    };
}
interface IInitOpts {
    fromExportedDevice?: IExportedDevice;
    pickleKey?: string;
}
/** data stored in the session store about an inbound group session */
export interface InboundGroupSessionData {
    room_id: string;
    /** pickled Olm.InboundGroupSession */
    session: string;
    keysClaimed: Record<string, string>;
    /** Devices involved in forwarding this session to us (normally empty). */
    forwardingCurve25519KeyChain: string[];
    /** whether this session is untrusted. */
    untrusted?: boolean;
    /** whether this session exists during the room being set to shared history. */
    sharedHistory?: boolean;
}
export interface IDecryptedGroupMessage {
    result: string;
    keysClaimed: Record<string, string>;
    senderKey: string;
    forwardingCurve25519KeyChain: string[];
    untrusted: boolean;
}
export interface IInboundSession {
    payload: string;
    session_id: string;
}
export interface IExportedDevice {
    pickleKey: string;
    pickledAccount: string;
    sessions: ISessionInfo[];
}
interface IInboundGroupSessionKey {
    chain_index: number;
    key: string;
    forwarding_curve25519_key_chain: string[];
    sender_claimed_ed25519_key: string | null;
    shared_history: boolean;
    untrusted?: boolean;
}
type OneTimeKeys = {
    curve25519: {
        [keyId: string]: string;
    };
};
/**
 * Manages the olm cryptography functions. Each OlmDevice has a single
 * OlmAccount and a number of OlmSessions.
 *
 * Accounts and sessions are kept pickled in the cryptoStore.
 */
export declare class OlmDevice {
    private readonly cryptoStore;
    pickleKey: string;
    /** Curve25519 key for the account, unknown until we load the account from storage in init() */
    deviceCurve25519Key: string | null;
    /** Ed25519 key for the account, unknown until we load the account from storage in init() */
    deviceEd25519Key: string | null;
    private maxOneTimeKeys;
    private outboundGroupSessionStore;
    private inboundGroupSessionMessageIndexes;
    sessionsInProgress: Record<string, Promise<void>>;
    olmPrekeyPromise: Promise<any>;
    constructor(cryptoStore: CryptoStore);
    /**
     * @returns The version of Olm.
     */
    static getOlmVersion(): [number, number, number];
    /**
     * Initialise the OlmAccount. This must be called before any other operations
     * on the OlmDevice.
     *
     * Data from an exported Olm device can be provided
     * in order to re-create this device.
     *
     * Attempts to load the OlmAccount from the crypto store, or creates one if none is
     * found.
     *
     * Reads the device keys from the OlmAccount object.
     *
     * @param fromExportedDevice - (Optional) data from exported device
     *     that must be re-created.
     *     If present, opts.pickleKey is ignored
     *     (exported data already provides a pickle key)
     * @param pickleKey - (Optional) pickle key to set instead of default one
     */
    init({ pickleKey, fromExportedDevice }?: IInitOpts): Promise<void>;
    /**
     * Populates the crypto store using data that was exported from an existing device.
     * Note that for now only the “account” and “sessions” stores are populated;
     * Other stores will be as with a new device.
     *
     * @param exportedData - Data exported from another device
     *     through the “export” method.
     * @param account - an olm account to initialize
     */
    private initialiseFromExportedDevice;
    private initialiseAccount;
    /**
     * extract our OlmAccount from the crypto store and call the given function
     * with the account object
     * The `account` object is usable only within the callback passed to this
     * function and will be freed as soon the callback returns. It is *not*
     * usable for the rest of the lifetime of the transaction.
     * This function requires a live transaction object from cryptoStore.doTxn()
     * and therefore may only be called in a doTxn() callback.
     *
     * @param txn - Opaque transaction object from cryptoStore.doTxn()
     * @internal
     */
    private getAccount;
    private storeAccount;
    /**
     * Export data for re-creating the Olm device later.
     * TODO export data other than just account and (P2P) sessions.
     *
     * @returns The exported data
     */
    export(): Promise<IExportedDevice>;
    /**
     * extract an OlmSession from the session store and call the given function
     * The session is usable only within the callback passed to this
     * function and will be freed as soon the callback returns. It is *not*
     * usable for the rest of the lifetime of the transaction.
     *
     * @param txn - Opaque transaction object from cryptoStore.doTxn()
     * @internal
     */
    private getSession;
    /**
     * Creates a session object from a session pickle and executes the given
     * function with it. The session object is destroyed once the function
     * returns.
     *
     * @internal
     */
    private unpickleSession;
    /**
     * store our OlmSession in the session store
     *
     * @param sessionInfo - `{session: OlmSession, lastReceivedMessageTs: int}`
     * @param txn - Opaque transaction object from cryptoStore.doTxn()
     * @internal
     */
    private saveSession;
    /**
     * get an OlmUtility and call the given function
     *
     * @returns result of func
     * @internal
     */
    private getUtility;
    /**
     * Signs a message with the ed25519 key for this account.
     *
     * @param message -  message to be signed
     * @returns base64-encoded signature
     */
    sign(message: string): Promise<string>;
    /**
     * Get the current (unused, unpublished) one-time keys for this account.
     *
     * @returns one time keys; an object with the single property
     * <tt>curve25519</tt>, which is itself an object mapping key id to Curve25519
     * key.
     */
    getOneTimeKeys(): Promise<OneTimeKeys>;
    /**
     * Get the maximum number of one-time keys we can store.
     *
     * @returns number of keys
     */
    maxNumberOfOneTimeKeys(): number;
    /**
     * Marks all of the one-time keys as published.
     */
    markKeysAsPublished(): Promise<void>;
    /**
     * Generate some new one-time keys
     *
     * @param numKeys - number of keys to generate
     * @returns Resolved once the account is saved back having generated the keys
     */
    generateOneTimeKeys(numKeys: number): Promise<void>;
    /**
     * Generate a new fallback keys
     *
     * @returns Resolved once the account is saved back having generated the key
     */
    generateFallbackKey(): Promise<void>;
    getFallbackKey(): Promise<Record<string, Record<string, string>>>;
    forgetOldFallbackKey(): Promise<void>;
    /**
     * Generate a new outbound session
     *
     * The new session will be stored in the cryptoStore.
     *
     * @param theirIdentityKey - remote user's Curve25519 identity key
     * @param theirOneTimeKey -  remote user's one-time Curve25519 key
     * @returns sessionId for the outbound session.
     */
    createOutboundSession(theirIdentityKey: string, theirOneTimeKey: string): Promise<string>;
    /**
     * Generate a new inbound session, given an incoming message
     *
     * @param theirDeviceIdentityKey - remote user's Curve25519 identity key
     * @param messageType -  messageType field from the received message (must be 0)
     * @param ciphertext - base64-encoded body from the received message
     *
     * @returns decrypted payload, and
     *     session id of new session
     *
     * @throws Error if the received message was not valid (for instance, it didn't use a valid one-time key).
     */
    createInboundSession(theirDeviceIdentityKey: string, messageType: number, ciphertext: string): Promise<IInboundSession>;
    /**
     * Get a list of known session IDs for the given device
     *
     * @param theirDeviceIdentityKey - Curve25519 identity key for the
     *     remote device
     * @returns  a list of known session ids for the device
     */
    getSessionIdsForDevice(theirDeviceIdentityKey: string): Promise<string[]>;
    /**
     * Get the right olm session id for encrypting messages to the given identity key
     *
     * @param theirDeviceIdentityKey - Curve25519 identity key for the
     *     remote device
     * @param nowait - Don't wait for an in-progress session to complete.
     *     This should only be set to true of the calling function is the function
     *     that marked the session as being in-progress.
     * @param log - A possibly customised log
     * @returns  session id, or null if no established session
     */
    getSessionIdForDevice(theirDeviceIdentityKey: string, nowait?: boolean, log?: PrefixedLogger): Promise<string | null>;
    /**
     * Get information on the active Olm sessions for a device.
     * <p>
     * Returns an array, with an entry for each active session. The first entry in
     * the result will be the one used for outgoing messages. Each entry contains
     * the keys 'hasReceivedMessage' (true if the session has received an incoming
     * message and is therefore past the pre-key stage), and 'sessionId'.
     *
     * @param deviceIdentityKey - Curve25519 identity key for the device
     * @param nowait - Don't wait for an in-progress session to complete.
     *     This should only be set to true of the calling function is the function
     *     that marked the session as being in-progress.
     * @param log - A possibly customised log
     */
    getSessionInfoForDevice(deviceIdentityKey: string, nowait?: boolean, log?: PrefixedLogger): Promise<{
        sessionId: string;
        lastReceivedMessageTs: number;
        hasReceivedMessage: boolean;
    }[]>;
    /**
     * Encrypt an outgoing message using an existing session
     *
     * @param theirDeviceIdentityKey - Curve25519 identity key for the
     *     remote device
     * @param sessionId -  the id of the active session
     * @param payloadString -  payload to be encrypted and sent
     *
     * @returns ciphertext
     */
    encryptMessage(theirDeviceIdentityKey: string, sessionId: string, payloadString: string): Promise<IMessage>;
    /**
     * Decrypt an incoming message using an existing session
     *
     * @param theirDeviceIdentityKey - Curve25519 identity key for the
     *     remote device
     * @param sessionId -  the id of the active session
     * @param messageType -  messageType field from the received message
     * @param ciphertext - base64-encoded body from the received message
     *
     * @returns decrypted payload.
     */
    decryptMessage(theirDeviceIdentityKey: string, sessionId: string, messageType: number, ciphertext: string): Promise<string>;
    /**
     * Determine if an incoming messages is a prekey message matching an existing session
     *
     * @param theirDeviceIdentityKey - Curve25519 identity key for the
     *     remote device
     * @param sessionId -  the id of the active session
     * @param messageType -  messageType field from the received message
     * @param ciphertext - base64-encoded body from the received message
     *
     * @returns true if the received message is a prekey message which matches
     *    the given session.
     */
    matchesSession(theirDeviceIdentityKey: string, sessionId: string, messageType: number, ciphertext: string): Promise<boolean>;
    recordSessionProblem(deviceKey: string, type: string, fixed: boolean): Promise<void>;
    sessionMayHaveProblems(deviceKey: string, timestamp: number): Promise<IProblem | null>;
    filterOutNotifiedErrorDevices(devices: IOlmDevice[]): Promise<IOlmDevice[]>;
    /**
     * store an OutboundGroupSession in outboundGroupSessionStore
     *
     * @internal
     */
    private saveOutboundGroupSession;
    /**
     * extract an OutboundGroupSession from outboundGroupSessionStore and call the
     * given function
     *
     * @returns result of func
     * @internal
     */
    private getOutboundGroupSession;
    /**
     * Generate a new outbound group session
     *
     * @returns sessionId for the outbound session.
     */
    createOutboundGroupSession(): string;
    /**
     * Encrypt an outgoing message with an outbound group session
     *
     * @param sessionId -  the id of the outboundgroupsession
     * @param payloadString -  payload to be encrypted and sent
     *
     * @returns ciphertext
     */
    encryptGroupMessage(sessionId: string, payloadString: string): string;
    /**
     * Get the session keys for an outbound group session
     *
     * @param sessionId -  the id of the outbound group session
     *
     * @returns current chain index, and
     *     base64-encoded secret key.
     */
    getOutboundGroupSessionKey(sessionId: string): IOutboundGroupSessionKey;
    /**
     * Unpickle a session from a sessionData object and invoke the given function.
     * The session is valid only until func returns.
     *
     * @param sessionData - Object describing the session.
     * @param func - Invoked with the unpickled session
     * @returns result of func
     */
    private unpickleInboundGroupSession;
    /**
     * extract an InboundGroupSession from the crypto store and call the given function
     *
     * @param roomId - The room ID to extract the session for, or null to fetch
     *     sessions for any room.
     * @param txn - Opaque transaction object from cryptoStore.doTxn()
     * @param func - function to call.
     *
     * @internal
     */
    private getInboundGroupSession;
    /**
     * Add an inbound group session to the session store
     *
     * @param roomId -     room in which this session will be used
     * @param senderKey -  base64-encoded curve25519 key of the sender
     * @param forwardingCurve25519KeyChain -  Devices involved in forwarding
     *     this session to us.
     * @param sessionId -  session identifier
     * @param sessionKey - base64-encoded secret key
     * @param keysClaimed - Other keys the sender claims.
     * @param exportFormat - true if the megolm keys are in export format
     *    (ie, they lack an ed25519 signature)
     * @param extraSessionData - any other data to be include with the session
     */
    addInboundGroupSession(roomId: string, senderKey: string, forwardingCurve25519KeyChain: string[], sessionId: string, sessionKey: string, keysClaimed: Record<string, string>, exportFormat: boolean, extraSessionData?: OlmGroupSessionExtraData): Promise<void>;
    /**
     * Record in the data store why an inbound group session was withheld.
     *
     * @param roomId -     room that the session belongs to
     * @param senderKey -  base64-encoded curve25519 key of the sender
     * @param sessionId -  session identifier
     * @param code -       reason code
     * @param reason -     human-readable version of `code`
     */
    addInboundGroupSessionWithheld(roomId: string, senderKey: string, sessionId: string, code: string, reason: string): Promise<void>;
    /**
     * Decrypt a received message with an inbound group session
     *
     * @param roomId -    room in which the message was received
     * @param senderKey - base64-encoded curve25519 key of the sender
     * @param sessionId - session identifier
     * @param body -      base64-encoded body of the encrypted message
     * @param eventId -   ID of the event being decrypted
     * @param timestamp - timestamp of the event being decrypted
     *
     * @returns null if the sessionId is unknown
     */
    decryptGroupMessage(roomId: string, senderKey: string, sessionId: string, body: string, eventId: string, timestamp: number): Promise<IDecryptedGroupMessage | null>;
    /**
     * Determine if we have the keys for a given megolm session
     *
     * @param roomId -    room in which the message was received
     * @param senderKey - base64-encoded curve25519 key of the sender
     * @param sessionId - session identifier
     *
     * @returns true if we have the keys to this session
     */
    hasInboundSessionKeys(roomId: string, senderKey: string, sessionId: string): Promise<boolean>;
    /**
     * Extract the keys to a given megolm session, for sharing
     *
     * @param roomId -    room in which the message was received
     * @param senderKey - base64-encoded curve25519 key of the sender
     * @param sessionId - session identifier
     * @param chainIndex - The chain index at which to export the session.
     *     If omitted, export at the first index we know about.
     *
     * @returns
     *    details of the session key. The key is a base64-encoded megolm key in
     *    export format.
     *
     * @throws Error If the given chain index could not be obtained from the known
     *     index (ie. the given chain index is before the first we have).
     */
    getInboundGroupSessionKey(roomId: string, senderKey: string, sessionId: string, chainIndex?: number): Promise<IInboundGroupSessionKey | null>;
    /**
     * Export an inbound group session
     *
     * @param senderKey - base64-encoded curve25519 key of the sender
     * @param sessionId - session identifier
     * @param sessionData - The session object from the store
     * @returns exported session data
     */
    exportInboundGroupSession(senderKey: string, sessionId: string, sessionData: InboundGroupSessionData): IMegolmSessionData;
    getSharedHistoryInboundGroupSessions(roomId: string): Promise<[senderKey: string, sessionId: string][]>;
    /**
     * Verify an ed25519 signature.
     *
     * @param key - ed25519 key
     * @param message - message which was signed
     * @param signature - base64-encoded signature to be checked
     *
     * @throws Error if there is a problem with the verification. If the key was
     * too small then the message will be "OLM.INVALID_BASE64". If the signature
     * was invalid then the message will be "OLM.BAD_MESSAGE_MAC".
     */
    verifySignature(key: string, message: string, signature: string): void;
}
export declare const WITHHELD_MESSAGES: Record<string, string>;
export {};
//# sourceMappingURL=OlmDevice.d.ts.map