import { MemoryCryptoStore } from "./memory-crypto-store";
import { IDeviceData, IProblem, ISession, ISessionInfo, IWithheld, Mode, SecretStorePrivateKeys } from "./base";
import { IOlmDevice } from "../algorithms/megolm";
import { IRoomEncryption } from "../RoomList";
import { ICrossSigningKey } from "../../client";
import { InboundGroupSessionData } from "../OlmDevice";
export declare class LocalStorageCryptoStore extends MemoryCryptoStore {
    private readonly store;
    static exists(store: Storage): boolean;
    constructor(store: Storage);
    countEndToEndSessions(txn: unknown, func: (count: number) => void): void;
    private _getEndToEndSessions;
    getEndToEndSession(deviceKey: string, sessionId: string, txn: unknown, func: (session: ISessionInfo) => void): void;
    getEndToEndSessions(deviceKey: string, txn: unknown, func: (sessions: {
        [sessionId: string]: ISessionInfo;
    }) => void): void;
    getAllEndToEndSessions(txn: unknown, func: (session: ISessionInfo) => void): void;
    storeEndToEndSession(deviceKey: string, sessionId: string, sessionInfo: ISessionInfo, txn: unknown): void;
    storeEndToEndSessionProblem(deviceKey: string, type: string, fixed: boolean): Promise<void>;
    getEndToEndSessionProblem(deviceKey: string, timestamp: number): Promise<IProblem | null>;
    filterOutNotifiedErrorDevices(devices: IOlmDevice[]): Promise<IOlmDevice[]>;
    getEndToEndInboundGroupSession(senderCurve25519Key: string, sessionId: string, txn: unknown, func: (groupSession: InboundGroupSessionData | null, groupSessionWithheld: IWithheld | null) => void): void;
    getAllEndToEndInboundGroupSessions(txn: unknown, func: (session: ISession | null) => void): void;
    addEndToEndInboundGroupSession(senderCurve25519Key: string, sessionId: string, sessionData: InboundGroupSessionData, txn: unknown): void;
    storeEndToEndInboundGroupSession(senderCurve25519Key: string, sessionId: string, sessionData: InboundGroupSessionData, txn: unknown): void;
    storeEndToEndInboundGroupSessionWithheld(senderCurve25519Key: string, sessionId: string, sessionData: IWithheld, txn: unknown): void;
    getEndToEndDeviceData(txn: unknown, func: (deviceData: IDeviceData | null) => void): void;
    storeEndToEndDeviceData(deviceData: IDeviceData, txn: unknown): void;
    storeEndToEndRoom(roomId: string, roomInfo: IRoomEncryption, txn: unknown): void;
    getEndToEndRooms(txn: unknown, func: (rooms: Record<string, IRoomEncryption>) => void): void;
    getSessionsNeedingBackup(limit: number): Promise<ISession[]>;
    countSessionsNeedingBackup(): Promise<number>;
    unmarkSessionsNeedingBackup(sessions: ISession[]): Promise<void>;
    markSessionsNeedingBackup(sessions: ISession[]): Promise<void>;
    /**
     * Delete all data from this store.
     *
     * @returns Promise which resolves when the store has been cleared.
     */
    deleteAllData(): Promise<void>;
    getAccount(txn: unknown, func: (accountPickle: string | null) => void): void;
    storeAccount(txn: unknown, accountPickle: string): void;
    getCrossSigningKeys(txn: unknown, func: (keys: Record<string, ICrossSigningKey> | null) => void): void;
    getSecretStorePrivateKey<K extends keyof SecretStorePrivateKeys>(txn: unknown, func: (key: SecretStorePrivateKeys[K] | null) => void, type: K): void;
    storeCrossSigningKeys(txn: unknown, keys: Record<string, ICrossSigningKey>): void;
    storeSecretStorePrivateKey<K extends keyof SecretStorePrivateKeys>(txn: unknown, type: K, key: SecretStorePrivateKeys[K]): void;
    doTxn<T>(mode: Mode, stores: Iterable<string>, func: (txn: unknown) => T): Promise<T>;
}
//# sourceMappingURL=localStorage-crypto-store.d.ts.map