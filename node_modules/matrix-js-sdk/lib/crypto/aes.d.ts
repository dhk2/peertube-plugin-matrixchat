export interface IEncryptedPayload {
    [key: string]: any;
    /** the initialization vector in base64 */
    iv: string;
    /** the ciphertext in base64 */
    ciphertext: string;
    /** the HMAC in base64 */
    mac: string;
}
/**
 * encrypt a string
 *
 * @param data - the plaintext to encrypt
 * @param key - the encryption key to use
 * @param name - the name of the secret
 * @param ivStr - the initialization vector to use
 */
export declare function encryptAES(data: string, key: Uint8Array, name: string, ivStr?: string): Promise<IEncryptedPayload>;
/**
 * decrypt a string
 *
 * @param data - the encrypted data
 * @param key - the encryption key to use
 * @param name - the name of the secret
 */
export declare function decryptAES(data: IEncryptedPayload, key: Uint8Array, name: string): Promise<string>;
/** Calculate the MAC for checking the key.
 *
 * @param key - the key to use
 * @param iv - The initialization vector as a base64-encoded string.
 *     If omitted, a random initialization vector will be created.
 * @returns An object that contains, `mac` and `iv` properties.
 */
export declare function calculateKeyCheck(key: Uint8Array, iv?: string): Promise<IEncryptedPayload>;
//# sourceMappingURL=aes.d.ts.map