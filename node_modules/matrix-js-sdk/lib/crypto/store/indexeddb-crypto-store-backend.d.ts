import { PrefixedLogger } from "../../logger";
import { CryptoStore, IDeviceData, IProblem, ISession, ISessionInfo, IWithheld, Mode, OutgoingRoomKeyRequest, ParkedSharedHistory, SecretStorePrivateKeys } from "./base";
import { IRoomKeyRequestBody } from "../index";
import { ICrossSigningKey } from "../../client";
import { IOlmDevice } from "../algorithms/megolm";
import { IRoomEncryption } from "../RoomList";
import { InboundGroupSessionData } from "../OlmDevice";
/**
 * Implementation of a CryptoStore which is backed by an existing
 * IndexedDB connection. Generally you want IndexedDBCryptoStore
 * which connects to the database and defers to one of these.
 */
export declare class Backend implements CryptoStore {
    private db;
    private nextTxnId;
    /**
     */
    constructor(db: IDBDatabase);
    startup(): Promise<CryptoStore>;
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
     * look for an existing room key request in the db
     *
     * @internal
     * @param txn -  database transaction
     * @param requestBody - existing request to look for
     * @param callback -  function to call with the results of the
     *    search. Either passed a matching
     *    {@link OutgoingRoomKeyRequest}, or null if
     *    not found.
     */
    private _getOutgoingRoomKeyRequest;
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
     *
     * @returns All elements in a given state
     */
    getAllOutgoingRoomKeyRequestsByState(wantedState: number): Promise<OutgoingRoomKeyRequest[]>;
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
    storeAccount(txn: IDBTransaction, accountPickle: string): void;
    getCrossSigningKeys(txn: IDBTransaction, func: (keys: Record<string, ICrossSigningKey> | null) => void): void;
    getSecretStorePrivateKey<K extends keyof SecretStorePrivateKeys>(txn: IDBTransaction, func: (key: SecretStorePrivateKeys[K] | null) => void, type: K): void;
    storeCrossSigningKeys(txn: IDBTransaction, keys: Record<string, ICrossSigningKey>): void;
    storeSecretStorePrivateKey<K extends keyof SecretStorePrivateKeys>(txn: IDBTransaction, type: K, key: SecretStorePrivateKeys[K]): void;
    countEndToEndSessions(txn: IDBTransaction, func: (count: number) => void): void;
    getEndToEndSessions(deviceKey: string, txn: IDBTransaction, func: (sessions: {
        [sessionId: string]: ISessionInfo;
    }) => void): void;
    getEndToEndSession(deviceKey: string, sessionId: string, txn: IDBTransaction, func: (session: ISessionInfo | null) => void): void;
    getAllEndToEndSessions(txn: IDBTransaction, func: (session: ISessionInfo | null) => void): void;
    storeEndToEndSession(deviceKey: string, sessionId: string, sessionInfo: ISessionInfo, txn: IDBTransaction): void;
    storeEndToEndSessionProblem(deviceKey: string, type: string, fixed: boolean): Promise<void>;
    getEndToEndSessionProblem(deviceKey: string, timestamp: number): Promise<IProblem | null>;
    filterOutNotifiedErrorDevices(devices: IOlmDevice[]): Promise<IOlmDevice[]>;
    getEndToEndInboundGroupSession(senderCurve25519Key: string, sessionId: string, txn: IDBTransaction, func: (groupSession: InboundGroupSessionData | null, groupSessionWithheld: IWithheld | null) => void): void;
    getAllEndToEndInboundGroupSessions(txn: IDBTransaction, func: (session: ISession | null) => void): void;
    addEndToEndInboundGroupSession(senderCurve25519Key: string, sessionId: string, sessionData: InboundGroupSessionData, txn: IDBTransaction): void;
    storeEndToEndInboundGroupSession(senderCurve25519Key: string, sessionId: string, sessionData: InboundGroupSessionData, txn: IDBTransaction): void;
    storeEndToEndInboundGroupSessionWithheld(senderCurve25519Key: string, sessionId: string, sessionData: IWithheld, txn: IDBTransaction): void;
    getEndToEndDeviceData(txn: IDBTransaction, func: (deviceData: IDeviceData | null) => void): void;
    storeEndToEndDeviceData(deviceData: IDeviceData, txn: IDBTransaction): void;
    storeEndToEndRoom(roomId: string, roomInfo: IRoomEncryption, txn: IDBTransaction): void;
    getEndToEndRooms(txn: IDBTransaction, func: (rooms: Record<string, IRoomEncryption>) => void): void;
    getSessionsNeedingBackup(limit: number): Promise<ISession[]>;
    countSessionsNeedingBackup(txn?: IDBTransaction): Promise<number>;
    unmarkSessionsNeedingBackup(sessions: ISession[], txn?: IDBTransaction): Promise<void>;
    markSessionsNeedingBackup(sessions: ISession[], txn?: IDBTransaction): Promise<void>;
    addSharedHistoryInboundGroupSession(roomId: string, senderKey: string, sessionId: string, txn?: IDBTransaction): void;
    getSharedHistoryInboundGroupSessions(roomId: string, txn?: IDBTransaction): Promise<[senderKey: string, sessionId: string][]>;
    addParkedSharedHistory(roomId: string, parkedData: ParkedSharedHistory, txn?: IDBTransaction): void;
    takeParkedSharedHistory(roomId: string, txn?: IDBTransaction): Promise<ParkedSharedHistory[]>;
    doTxn<T>(mode: Mode, stores: string | string[], func: (txn: IDBTransaction) => T, log?: PrefixedLogger): Promise<T>;
}
export declare const VERSION: number;
export declare function upgradeDatabase(db: IDBDatabase, oldVersion: number): void;
//# sourceMappingURL=indexeddb-crypto-store-backend.d.ts.map