import { IContent, MatrixEvent } from "../models/event";
import { ICacheCallbacks } from "./CrossSigning";
import { Crypto, ICryptoCallbacks, IBootstrapCrossSigningOpts } from "./index";
import { ClientEvent, ClientEventHandlerMap, ICrossSigningKey, ISignedKey, KeySignatures } from "../client";
import { ISecretStorageKeyInfo } from "./api";
import { IKeyBackupInfo } from "./keybackup";
import { TypedEventEmitter } from "../models/typed-event-emitter";
import { IAccountDataClient } from "./SecretStorage";
interface ICrossSigningKeys {
    authUpload: IBootstrapCrossSigningOpts["authUploadDeviceSigningKeys"];
    keys: Record<"master" | "self_signing" | "user_signing", ICrossSigningKey>;
}
/**
 * Builds an EncryptionSetupOperation by calling any of the add.. methods.
 * Once done, `buildOperation()` can be called which allows to apply to operation.
 *
 * This is used as a helper by Crypto to keep track of all the network requests
 * and other side-effects of bootstrapping, so it can be applied in one go (and retried in the future)
 * Also keeps track of all the private keys created during bootstrapping, so we don't need to prompt for them
 * more than once.
 */
export declare class EncryptionSetupBuilder {
    readonly accountDataClientAdapter: AccountDataClientAdapter;
    readonly crossSigningCallbacks: CrossSigningCallbacks;
    readonly ssssCryptoCallbacks: SSSSCryptoCallbacks;
    private crossSigningKeys?;
    private keySignatures?;
    private keyBackupInfo?;
    private sessionBackupPrivateKey?;
    /**
     * @param accountData - pre-existing account data, will only be read, not written.
     * @param delegateCryptoCallbacks - crypto callbacks to delegate to if the key isn't in cache yet
     */
    constructor(accountData: Record<string, MatrixEvent>, delegateCryptoCallbacks?: ICryptoCallbacks);
    /**
     * Adds new cross-signing public keys
     *
     * @param authUpload - Function called to await an interactive auth
     * flow when uploading device signing keys.
     * Args:
     *     A function that makes the request requiring auth. Receives
     *     the auth data as an object. Can be called multiple times, first with
     *     an empty authDict, to obtain the flows.
     * @param keys - the new keys
     */
    addCrossSigningKeys(authUpload: ICrossSigningKeys["authUpload"], keys: ICrossSigningKeys["keys"]): void;
    /**
     * Adds the key backup info to be updated on the server
     *
     * Used either to create a new key backup, or add signatures
     * from the new MSK.
     *
     * @param keyBackupInfo - as received from/sent to the server
     */
    addSessionBackup(keyBackupInfo: IKeyBackupInfo): void;
    /**
     * Adds the session backup private key to be updated in the local cache
     *
     * Used after fixing the format of the key
     *
     */
    addSessionBackupPrivateKeyToCache(privateKey: Uint8Array): void;
    /**
     * Add signatures from a given user and device/x-sign key
     * Used to sign the new cross-signing key with the device key
     *
     */
    addKeySignature(userId: string, deviceId: string, signature: ISignedKey): void;
    setAccountData(type: string, content: object): Promise<void>;
    /**
     * builds the operation containing all the parts that have been added to the builder
     */
    buildOperation(): EncryptionSetupOperation;
    /**
     * Stores the created keys locally.
     *
     * This does not yet store the operation in a way that it can be restored,
     * but that is the idea in the future.
     */
    persist(crypto: Crypto): Promise<void>;
}
/**
 * Can be created from EncryptionSetupBuilder, or
 * (in a follow-up PR, not implemented yet) restored from storage, to retry.
 *
 * It does not have knowledge of any private keys, unlike the builder.
 */
export declare class EncryptionSetupOperation {
    private readonly accountData;
    private readonly crossSigningKeys?;
    private readonly keyBackupInfo?;
    private readonly keySignatures?;
    /**
     */
    constructor(accountData: Map<string, object>, crossSigningKeys?: ICrossSigningKeys | undefined, keyBackupInfo?: IKeyBackupInfo | undefined, keySignatures?: KeySignatures | undefined);
    /**
     * Runs the (remaining part of, in the future) operation by sending requests to the server.
     */
    apply(crypto: Crypto): Promise<void>;
}
/**
 * Catches account data set by SecretStorage during bootstrapping by
 * implementing the methods related to account data in MatrixClient
 */
declare class AccountDataClientAdapter extends TypedEventEmitter<ClientEvent.AccountData, ClientEventHandlerMap> implements IAccountDataClient {
    private readonly existingValues;
    readonly values: Map<string, MatrixEvent>;
    /**
     * @param existingValues - existing account data
     */
    constructor(existingValues: Record<string, MatrixEvent>);
    /**
     * @returns the content of the account data
     */
    getAccountDataFromServer<T extends {
        [k: string]: any;
    }>(type: string): Promise<T>;
    /**
     * @returns the content of the account data
     */
    getAccountData(type: string): IContent | null;
    setAccountData(type: string, content: any): Promise<{}>;
}
/**
 * Catches the private cross-signing keys set during bootstrapping
 * by both cache callbacks (see createCryptoStoreCacheCallbacks) as non-cache callbacks.
 * See CrossSigningInfo constructor
 */
declare class CrossSigningCallbacks implements ICryptoCallbacks, ICacheCallbacks {
    readonly privateKeys: Map<string, Uint8Array>;
    getCrossSigningKeyCache(type: string, expectedPublicKey: string): Promise<Uint8Array | null>;
    storeCrossSigningKeyCache(type: string, key: Uint8Array): Promise<void>;
    getCrossSigningKey(type: string, expectedPubkey: string): Promise<Uint8Array | null>;
    saveCrossSigningKeys(privateKeys: Record<string, Uint8Array>): void;
}
/**
 * Catches the 4S private key set during bootstrapping by implementing
 * the SecretStorage crypto callbacks
 */
declare class SSSSCryptoCallbacks {
    private readonly delegateCryptoCallbacks?;
    private readonly privateKeys;
    constructor(delegateCryptoCallbacks?: ICryptoCallbacks | undefined);
    getSecretStorageKey({ keys }: {
        keys: Record<string, ISecretStorageKeyInfo>;
    }, name: string): Promise<[string, Uint8Array] | null>;
    addPrivateKey(keyId: string, keyInfo: ISecretStorageKeyInfo, privKey: Uint8Array): void;
}
export {};
//# sourceMappingURL=EncryptionSetup.d.ts.map