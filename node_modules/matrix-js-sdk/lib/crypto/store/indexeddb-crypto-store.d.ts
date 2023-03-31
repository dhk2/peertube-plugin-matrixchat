import { PrefixedLogger } from "../../logger";
import { CryptoStore, IDeviceData, IProblem, ISession, ISessionInfo, IWithheld, Mode, OutgoingRoomKeyRequest, ParkedSharedHistory, SecretStorePrivateKeys } from "./base";
import { IRoomKeyRequestBody } from "../index";
import { ICrossSigningKey } from "../../client";
import { IOlmDevice } from "../algorithms/megolm";
import { IRoomEncryption } from "../RoomList";
import { InboundGroupSessionData } from "../OlmDevice";
/**
 * Internal module. indexeddb storage for e2e.
 */
/**
 * An implementation of CryptoStore, which is normally backed by an indexeddb,
 * but with fallback to MemoryCryptoStore.
 */
export declare class IndexedDBCryptoStore implements CryptoStore {
    private readonly indexedDB;
    private readonly dbName;
    static STORE_ACCOUNT: string;
    static STORE_SESSIONS: string;
    static STORE_INBOUND_GROUP_SESSIONS: string;
    static STORE_INBOUND_GROUP_SESSIONS_WITHHELD: string;
    static STORE_SHARED_HISTORY_INBOUND_GROUP_SESSIONS: string;
    static STORE_PARKED_SHARED_HISTORY: string;
    static STORE_DEVICE_DATA: string;
    static STORE_ROOMS: string;
    static STORE_BACKUP: string;
    static exists(indexedDB: IDBFactory, dbName: string): Promise<boolean>;
    private backendPromise?;
    private backend?;
    /**
     * Create a new IndexedDBCryptoStore
     *
     * @param indexedDB -  global indexedDB instance
     * @param dbName -   name of db to connect to
     */
    constructor(indexedDB: IDBFactory, dbName: string);
    /**
     * Ensure the database exists and is up-to-date, or fall back to
     * a local storage or in-memory store.
     *
     * This must be called before the store can be used.
     *
     * @returns resolves to either an IndexedDBCryptoStoreBackend.Backend,
     * or a MemoryCryptoStore
     */
    startup(): Promise<CryptoStore>;
    /**
     * Delete all data from this store.
     *
     * @returns resolves when the store has been cleared.
     */
    deleteAllData(): Promise<void>;
    /**
     * Look for an existing outgoing room key request, and if none is found,
     * add a new one
     *
     *
     * @returns resolves to
     *    {@link OutgoingRoomKeyRequest}: either the
     *    same instance as passed in, or the existing one.
     */
    getOrAddOutgoingRoomKeyRequest(request: OutgoingRoomKeyRequest): Promise<OutgoingRoomKeyRequest>;
    /**
     * Look for an existing room key request
     *
     * @param requestBody - existing request to look for
     *
     * @returns resolves to the matching
     *    {@link OutgoingRoomKeyRequest}, or null if
     *    not found
     */
    getOutgoingRoomKeyRequest(requestBody: IRoomKeyRequestBody): Promise<OutgoingRoomKeyRequest | null>;
    /**
     * Look for room key requests by state
     *
     * @param wantedStates - list of acceptable states
     *
     * @returns resolves to the a
     *    {@link OutgoingRoomKeyRequest}, or null if
     *    there are no pending requests in those states. If there are multiple
     *    requests in those states, an arbitrary one is chosen.
     */
    getOutgoingRoomKeyRequestByState(wantedStates: number[]): Promise<OutgoingRoomKeyRequest | null>;
    /**
     * Look for room key requests by state –
     * unlike above, return a list of all entries in one state.
     *
     * @returns Returns an array of requests in the given state
     */
    getAllOutgoingRoomKeyRequestsByState(wantedState: number): Promise<OutgoingRoomKeyRequest[]>;
    /**
     * Look for room key requests by target device and state
     *
     * @param userId - Target user ID
     * @param deviceId - Target device ID
     * @param wantedStates - list of acceptable states
     *
     * @returns resolves to a list of all the
     *    {@link OutgoingRoomKeyRequest}
     */
    getOutgoingRoomKeyRequestsByTarget(userId: string, deviceId: string, wantedStates: number[]): Promise<OutgoingRoomKeyRequest[]>;
    /**
     * Look for an existing room key request by id and state, and update it if
     * found
     *
     * @param requestId -      ID of request to update
     * @param expectedState -  state we expect to find the request in
     * @param updates -        name/value map of updates to apply
     *
     * @returns resolves to
     *    {@link OutgoingRoomKeyRequest}
     *    updated request, or null if no matching row was found
     */
    updateOutgoingRoomKeyRequest(requestId: string, expectedState: number, updates: Partial<OutgoingRoomKeyRequest>): Promise<OutgoingRoomKeyRequest | null>;
    /**
     * Look for an existing room key request by id and state, and delete it if
     * found
     *
     * @param requestId -      ID of request to update
     * @param expectedState -  state we expect to find the request in
     *
     * @returns resolves once the operation is completed
     */
    deleteOutgoingRoomKeyRequest(requestId: string, expectedState: number): Promise<OutgoingRoomKeyRequest | null>;
    getAccount(txn: IDBTransaction, func: (accountPickle: string | null) => void): void;
    /**
     * Write the account pickle to the store.
     * This requires an active transaction. See doTxn().
     *
     * @param txn - An active transaction. See doTxn().
     * @param accountPickle - The new account pickle to store.
     */
    storeAccount(txn: IDBTransaction, accountPickle: string): void;
    /**
     * Get the public part of the cross-signing keys (eg. self-signing key,
     * user signing key).
     *
     * @param txn - An active transaction. See doTxn().
     * @param func - Called with the account keys object:
     *        `{ key_type: base64 encoded seed }` where key type = user_signing_key_seed or self_signing_key_seed
     */
    getCrossSigningKeys(txn: IDBTransaction, func: (keys: Record<string, ICrossSigningKey> | null) => void): void;
    /**
     * @param txn - An active transaction. See doTxn().
     * @param func - Called with the private key
     * @param type - A key type
     */
    getSecretStorePrivateKey<K extends keyof SecretStorePrivateKeys>(txn: IDBTransaction, func: (key: SecretStorePrivateKeys[K] | null) => void, type: K): void;
    /**
     * Write the cross-signing keys back to the store
     *
     * @param txn - An active transaction. See doTxn().
     * @param keys - keys object as getCrossSigningKeys()
     */
    storeCrossSigningKeys(txn: IDBTransaction, keys: Record<string, ICrossSigningKey>): void;
    /**
     * Write the cross-signing private keys back to the store
     *
     * @param txn - An active transaction. See doTxn().
     * @param type - The type of cross-signing private key to store
     * @param key - keys object as getCrossSigningKeys()
     */
    storeSecretStorePrivateKey<K extends keyof SecretStorePrivateKeys>(txn: IDBTransaction, type: K, key: SecretStorePrivateKeys[K]): void;
    /**
     * Returns the number of end-to-end sessions in the store
     * @param txn - An active transaction. See doTxn().
     * @param func - Called with the count of sessions
     */
    countEndToEndSessions(txn: IDBTransaction, func: (count: number) => void): void;
    /**
     * Retrieve a specific end-to-end session between the logged-in user
     * and another device.
     * @param deviceKey - The public key of the other device.
     * @param sessionId - The ID of the session to retrieve
     * @param txn - An active transaction. See doTxn().
     * @param func - Called with A map from sessionId
     *     to session information object with 'session' key being the
     *     Base64 end-to-end session and lastReceivedMessageTs being the
     *     timestamp in milliseconds at which the session last received
     *     a message.
     */
    getEndToEndSession(deviceKey: string, sessionId: string, txn: IDBTransaction, func: (session: ISessionInfo | null) => void): void;
    /**
     * Retrieve the end-to-end sessions between the logged-in user and another
     * device.
     * @param deviceKey - The public key of the other device.
     * @param txn - An active transaction. See doTxn().
     * @param func - Called with A map from sessionId
     *     to session information object with 'session' key being the
     *     Base64 end-to-end session and lastReceivedMessageTs being the
     *     timestamp in milliseconds at which the session last received
     *     a message.
     */
    getEndToEndSessions(deviceKey: string, txn: IDBTransaction, func: (sessions: {
        [sessionId: string]: ISessionInfo;
    }) => void): void;
    /**
     * Retrieve all end-to-end sessions
     * @param txn - An active transaction. See doTxn().
     * @param func - Called one for each session with
     *     an object with, deviceKey, lastReceivedMessageTs, sessionId
     *     and session keys.
     */
    getAllEndToEndSessions(txn: IDBTransaction, func: (session: ISessionInfo | null) => void): void;
    /**
     * Store a session between the logged-in user and another device
     * @param deviceKey - The public key of the other device.
     * @param sessionId - The ID for this end-to-end session.
     * @param sessionInfo - Session information object
     * @param txn - An active transaction. See doTxn().
     */
    storeEndToEndSession(deviceKey: string, sessionId: string, sessionInfo: ISessionInfo, txn: IDBTransaction): void;
    storeEndToEndSessionProblem(deviceKey: string, type: string, fixed: boolean): Promise<void>;
    getEndToEndSessionProblem(deviceKey: string, timestamp: number): Promise<IProblem | null>;
    filterOutNotifiedErrorDevices(devices: IOlmDevice[]): Promise<IOlmDevice[]>;
    /**
     * Retrieve the end-to-end inbound group session for a given
     * server key and session ID
     * @param senderCurve25519Key - The sender's curve 25519 key
     * @param sessionId - The ID of the session
     * @param txn - An active transaction. See doTxn().
     * @param func - Called with A map from sessionId
     *     to Base64 end-to-end session.
     */
    getEndToEndInboundGroupSession(senderCurve25519Key: string, sessionId: string, txn: IDBTransaction, func: (groupSession: InboundGroupSessionData | null, groupSessionWithheld: IWithheld | null) => void): void;
    /**
     * Fetches all inbound group sessions in the store
     * @param txn - An active transaction. See doTxn().
     * @param func - Called once for each group session
     *     in the store with an object having keys `{senderKey, sessionId, sessionData}`,
     *     then once with null to indicate the end of the list.
     */
    getAllEndToEndInboundGroupSessions(txn: IDBTransaction, func: (session: ISession | null) => void): void;
    /**
     * Adds an end-to-end inbound group session to the store.
     * If there already exists an inbound group session with the same
     * senderCurve25519Key and sessionID, the session will not be added.
     * @param senderCurve25519Key - The sender's curve 25519 key
     * @param sessionId - The ID of the session
     * @param sessionData - The session data structure
     * @param txn - An active transaction. See doTxn().
     */
    addEndToEndInboundGroupSession(senderCurve25519Key: string, sessionId: string, sessionData: InboundGroupSessionData, txn: IDBTransaction): void;
    /**
     * Writes an end-to-end inbound group session to the store.
     * If there already exists an inbound group session with the same
     * senderCurve25519Key and sessionID, it will be overwritten.
     * @param senderCurve25519Key - The sender's curve 25519 key
     * @param sessionId - The ID of the session
     * @param sessionData - The session data structure
     * @param txn - An active transaction. See doTxn().
     */
    storeEndToEndInboundGroupSession(senderCurve25519Key: string, sessionId: string, sessionData: InboundGroupSessionData, txn: IDBTransaction): void;
    storeEndToEndInboundGroupSessionWithheld(senderCurve25519Key: string, sessionId: string, sessionData: IWithheld, txn: IDBTransaction): void;
    /**
     * Store the state of all tracked devices
     * This contains devices for each user, a tracking state for each user
     * and a sync token matching the point in time the snapshot represents.
     * These all need to be written out in full each time such that the snapshot
     * is always consistent, so they are stored in one object.
     *
     * @param txn - An active transaction. See doTxn().
     */
    storeEndToEndDeviceData(deviceData: IDeviceData, txn: IDBTransaction): void;
    /**
     * Get the state of all tracked devices
     *
     * @param txn - An active transaction. See doTxn().
     * @param func - Function called with the
     *     device data
     */
    getEndToEndDeviceData(txn: IDBTransaction, func: (deviceData: IDeviceData | null) => void): void;
    /**
     * Store the end-to-end state for a room.
     * @param roomId - The room's ID.
     * @param roomInfo - The end-to-end info for the room.
     * @param txn - An active transaction. See doTxn().
     */
    storeEndToEndRoom(roomId: string, roomInfo: IRoomEncryption, txn: IDBTransaction): void;
    /**
     * Get an object of `roomId->roomInfo` for all e2e rooms in the store
     * @param txn - An active transaction. See doTxn().
     * @param func - Function called with the end-to-end encrypted rooms
     */
    getEndToEndRooms(txn: IDBTransaction, func: (rooms: Record<string, IRoomEncryption>) => void): void;
    /**
     * Get the inbound group sessions that need to be backed up.
     * @param limit - The maximum number of sessions to retrieve.  0
     * for no limit.
     * @returns resolves to an array of inbound group sessions
     */
    getSessionsNeedingBackup(limit: number): Promise<ISession[]>;
    /**
     * Count the inbound group sessions that need to be backed up.
     * @param txn - An active transaction. See doTxn(). (optional)
     * @returns resolves to the number of sessions
     */
    countSessionsNeedingBackup(txn?: IDBTransaction): Promise<number>;
    /**
     * Unmark sessions as needing to be backed up.
     * @param sessions - The sessions that need to be backed up.
     * @param txn - An active transaction. See doTxn(). (optional)
     * @returns resolves when the sessions are unmarked
     */
    unmarkSessionsNeedingBackup(sessions: ISession[], txn?: IDBTransaction): Promise<void>;
    /**
     * Mark sessions as needing to be backed up.
     * @param sessions - The sessions that need to be backed up.
     * @param txn - An active transaction. See doTxn(). (optional)
     * @returns resolves when the sessions are marked
     */
    markSessionsNeedingBackup(sessions: ISession[], txn?: IDBTransaction): Promise<void>;
    /**
     * Add a shared-history group session for a room.
     * @param roomId - The room that the key belongs to
     * @param senderKey - The sender's curve 25519 key
     * @param sessionId - The ID of the session
     * @param txn - An active transaction. See doTxn(). (optional)
     */
    addSharedHistoryInboundGroupSession(roomId: string, senderKey: string, sessionId: string, txn?: IDBTransaction): void;
    /**
     * Get the shared-history group session for a room.
     * @param roomId - The room that the key belongs to
     * @param txn - An active transaction. See doTxn(). (optional)
     * @returns Promise which resolves to an array of [senderKey, sessionId]
     */
    getSharedHistoryInboundGroupSessions(roomId: string, txn?: IDBTransaction): Promise<[senderKey: string, sessionId: string][]>;
    /**
     * Park a shared-history group session for a room we may be invited to later.
     */
    addParkedSharedHistory(roomId: string, parkedData: ParkedSharedHistory, txn?: IDBTransaction): void;
    /**
     * Pop out all shared-history group sessions for a room.
     */
    takeParkedSharedHistory(roomId: string, txn?: IDBTransaction): Promise<ParkedSharedHistory[]>;
    /**
     * Perform a transaction on the crypto store. Any store methods
     * that require a transaction (txn) object to be passed in may
     * only be called within a callback of either this function or
     * one of the store functions operating on the same transaction.
     *
     * @param mode - 'readwrite' if you need to call setter
     *     functions with this transaction. Otherwise, 'readonly'.
     * @param stores - List IndexedDBCryptoStore.STORE_*
     *     options representing all types of object that will be
     *     accessed or written to with this transaction.
     * @param func - Function called with the
     *     transaction object: an opaque object that should be passed
     *     to store functions.
     * @param log - A possibly customised log
     * @returns Promise that resolves with the result of the `func`
     *     when the transaction is complete. If the backend is
     *     async (ie. the indexeddb backend) any of the callback
     *     functions throwing an exception will cause this promise to
     *     reject with that exception. On synchronous backends, the
     *     exception will propagate to the caller of the getFoo method.
     */
    doTxn<T>(mode: Mode, stores: Iterable<string>, func: (txn: IDBTransaction) => T, log?: PrefixedLogger): Promise<T>;
}
//# sourceMappingURL=indexeddb-crypto-store.d.ts.map