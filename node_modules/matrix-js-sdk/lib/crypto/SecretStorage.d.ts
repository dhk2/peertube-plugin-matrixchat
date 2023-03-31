import { ICryptoCallbacks } from ".";
import { IContent, MatrixEvent } from "../models/event";
import { ClientEvent, ClientEventHandlerMap, MatrixClient } from "../client";
import { IAddSecretStorageKeyOpts, ISecretStorageKeyInfo } from "./api";
import { TypedEventEmitter } from "../models/typed-event-emitter";
export declare const SECRET_STORAGE_ALGORITHM_V1_AES = "m.secret_storage.v1.aes-hmac-sha2";
export type SecretStorageKeyTuple = [keyId: string, keyInfo: ISecretStorageKeyInfo];
export type SecretStorageKeyObject = {
    keyId: string;
    keyInfo: ISecretStorageKeyInfo;
};
export interface ISecretRequest {
    requestId: string;
    promise: Promise<string>;
    cancel: (reason: string) => void;
}
export interface IAccountDataClient extends TypedEventEmitter<ClientEvent.AccountData, ClientEventHandlerMap> {
    getAccountDataFromServer: <T extends {
        [k: string]: any;
    }>(eventType: string) => Promise<T>;
    getAccountData: (eventType: string) => IContent | null;
    setAccountData: (eventType: string, content: any) => Promise<{}>;
}
/**
 * Implements Secure Secret Storage and Sharing (MSC1946)
 */
export declare class SecretStorage<B extends MatrixClient | undefined = MatrixClient> {
    private readonly accountDataAdapter;
    private readonly cryptoCallbacks;
    private readonly baseApis;
    private requests;
    constructor(accountDataAdapter: IAccountDataClient, cryptoCallbacks: ICryptoCallbacks, baseApis: B);
    getDefaultKeyId(): Promise<string | null>;
    setDefaultKeyId(keyId: string): Promise<void>;
    /**
     * Add a key for encrypting secrets.
     *
     * @param algorithm - the algorithm used by the key.
     * @param opts - the options for the algorithm.  The properties used
     *     depend on the algorithm given.
     * @param keyId - the ID of the key.  If not given, a random
     *     ID will be generated.
     *
     * @returns An object with:
     *     keyId: the ID of the key
     *     keyInfo: details about the key (iv, mac, passphrase)
     */
    addKey(algorithm: string, opts?: IAddSecretStorageKeyOpts, keyId?: string): Promise<SecretStorageKeyObject>;
    /**
     * Get the key information for a given ID.
     *
     * @param keyId - The ID of the key to check
     *     for. Defaults to the default key ID if not provided.
     * @returns If the key was found, the return value is an array of
     *     the form [keyId, keyInfo].  Otherwise, null is returned.
     *     XXX: why is this an array when addKey returns an object?
     */
    getKey(keyId?: string | null): Promise<SecretStorageKeyTuple | null>;
    /**
     * Check whether we have a key with a given ID.
     *
     * @param keyId - The ID of the key to check
     *     for. Defaults to the default key ID if not provided.
     * @returns Whether we have the key.
     */
    hasKey(keyId?: string): Promise<boolean>;
    /**
     * Check whether a key matches what we expect based on the key info
     *
     * @param key - the key to check
     * @param info - the key info
     *
     * @returns whether or not the key matches
     */
    checkKey(key: Uint8Array, info: ISecretStorageKeyInfo): Promise<boolean>;
    /**
     * Store an encrypted secret on the server
     *
     * @param name - The name of the secret
     * @param secret - The secret contents.
     * @param keys - The IDs of the keys to use to encrypt the secret
     *     or null/undefined to use the default key.
     */
    store(name: string, secret: string, keys?: string[] | null): Promise<void>;
    /**
     * Get a secret from storage.
     *
     * @param name - the name of the secret
     *
     * @returns the contents of the secret
     */
    get(name: string): Promise<string | undefined>;
    /**
     * Check if a secret is stored on the server.
     *
     * @param name - the name of the secret
     *
     * @returns map of key name to key info the secret is encrypted
     *     with, or null if it is not present or not encrypted with a trusted
     *     key
     */
    isStored(name: string): Promise<Record<string, ISecretStorageKeyInfo> | null>;
    /**
     * Request a secret from another device
     *
     * @param name - the name of the secret to request
     * @param devices - the devices to request the secret from
     */
    request(this: SecretStorage<MatrixClient>, name: string, devices: string[]): ISecretRequest;
    onRequestReceived(this: SecretStorage<MatrixClient>, event: MatrixEvent): Promise<void>;
    onSecretReceived(this: SecretStorage<MatrixClient>, event: MatrixEvent): void;
    private getSecretStorageKey;
}
//# sourceMappingURL=SecretStorage.d.ts.map