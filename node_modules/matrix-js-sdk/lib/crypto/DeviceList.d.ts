import { DeviceInfo, IDevice } from "./deviceinfo";
import { CrossSigningInfo, ICrossSigningInfo } from "./CrossSigning";
import { MatrixClient } from "../client";
import { OlmDevice } from "./OlmDevice";
import { CryptoStore } from "./store/base";
import { TypedEventEmitter } from "../models/typed-event-emitter";
import { CryptoEvent, CryptoEventHandlerMap } from "./index";
export declare enum TrackingStatus {
    NotTracked = 0,
    PendingDownload = 1,
    DownloadInProgress = 2,
    UpToDate = 3
}
export type DeviceInfoMap = Record<string, Record<string, DeviceInfo>>;
type EmittedEvents = CryptoEvent.WillUpdateDevices | CryptoEvent.DevicesUpdated | CryptoEvent.UserCrossSigningUpdated;
export declare class DeviceList extends TypedEventEmitter<EmittedEvents, CryptoEventHandlerMap> {
    private readonly cryptoStore;
    readonly keyDownloadChunkSize: number;
    private devices;
    crossSigningInfo: {
        [userId: string]: ICrossSigningInfo;
    };
    private userByIdentityKey;
    private deviceTrackingStatus;
    private syncToken;
    private keyDownloadsInProgressByUser;
    private dirty;
    private savePromise;
    private resolveSavePromise;
    private savePromiseTime;
    private saveTimer;
    private hasFetched;
    private readonly serialiser;
    constructor(baseApis: MatrixClient, cryptoStore: CryptoStore, olmDevice: OlmDevice, keyDownloadChunkSize?: number);
    /**
     * Load the device tracking state from storage
     */
    load(): Promise<void>;
    stop(): void;
    /**
     * Save the device tracking state to storage, if any changes are
     * pending other than updating the sync token
     *
     * The actual save will be delayed by a short amount of time to
     * aggregate multiple writes to the database.
     *
     * @param delay - Time in ms before which the save actually happens.
     *     By default, the save is delayed for a short period in order to batch
     *     multiple writes, but this behaviour can be disabled by passing 0.
     *
     * @returns true if the data was saved, false if
     *     it was not (eg. because no changes were pending). The promise
     *     will only resolve once the data is saved, so may take some time
     *     to resolve.
     */
    saveIfDirty(delay?: number): Promise<boolean>;
    /**
     * Gets the sync token last set with setSyncToken
     *
     * @returns The sync token
     */
    getSyncToken(): string | null;
    /**
     * Sets the sync token that the app will pass as the 'since' to the /sync
     * endpoint next time it syncs.
     * The sync token must always be set after any changes made as a result of
     * data in that sync since setting the sync token to a newer one will mean
     * those changed will not be synced from the server if a new client starts
     * up with that data.
     *
     * @param st - The sync token
     */
    setSyncToken(st: string | null): void;
    /**
     * Ensures up to date keys for a list of users are stored in the session store,
     * downloading and storing them if they're not (or if forceDownload is
     * true).
     * @param userIds - The users to fetch.
     * @param forceDownload - Always download the keys even if cached.
     *
     * @returns A promise which resolves to a map userId-\>deviceId-\>{@link DeviceInfo}.
     */
    downloadKeys(userIds: string[], forceDownload: boolean): Promise<DeviceInfoMap>;
    /**
     * Get the stored device keys for a list of user ids
     *
     * @param userIds - the list of users to list keys for.
     *
     * @returns userId-\>deviceId-\>{@link DeviceInfo}.
     */
    private getDevicesFromStore;
    /**
     * Returns a list of all user IDs the DeviceList knows about
     *
     * @returns All known user IDs
     */
    getKnownUserIds(): string[];
    /**
     * Get the stored device keys for a user id
     *
     * @param userId - the user to list keys for.
     *
     * @returns list of devices, or null if we haven't
     * managed to get a list of devices for this user yet.
     */
    getStoredDevicesForUser(userId: string): DeviceInfo[] | null;
    /**
     * Get the stored device data for a user, in raw object form
     *
     * @param userId - the user to get data for
     *
     * @returns `deviceId->{object}` devices, or undefined if
     * there is no data for this user.
     */
    getRawStoredDevicesForUser(userId: string): Record<string, IDevice>;
    getStoredCrossSigningForUser(userId: string): CrossSigningInfo | null;
    storeCrossSigningForUser(userId: string, info: ICrossSigningInfo): void;
    /**
     * Get the stored keys for a single device
     *
     *
     * @returns device, or undefined
     * if we don't know about this device
     */
    getStoredDevice(userId: string, deviceId: string): DeviceInfo | undefined;
    /**
     * Get a user ID by one of their device's curve25519 identity key
     *
     * @param algorithm -  encryption algorithm
     * @param senderKey -  curve25519 key to match
     *
     * @returns user ID
     */
    getUserByIdentityKey(algorithm: string, senderKey: string): string | null;
    /**
     * Find a device by curve25519 identity key
     *
     * @param algorithm -  encryption algorithm
     * @param senderKey -  curve25519 key to match
     */
    getDeviceByIdentityKey(algorithm: string, senderKey: string): DeviceInfo | null;
    /**
     * Replaces the list of devices for a user with the given device list
     *
     * @param userId - The user ID
     * @param devices - New device info for user
     */
    storeDevicesForUser(userId: string, devices: Record<string, IDevice>): void;
    /**
     * flag the given user for device-list tracking, if they are not already.
     *
     * This will mean that a subsequent call to refreshOutdatedDeviceLists()
     * will download the device list for the user, and that subsequent calls to
     * invalidateUserDeviceList will trigger more updates.
     *
     */
    startTrackingDeviceList(userId: string): void;
    /**
     * Mark the given user as no longer being tracked for device-list updates.
     *
     * This won't affect any in-progress downloads, which will still go on to
     * complete; it will just mean that we don't think that we have an up-to-date
     * list for future calls to downloadKeys.
     *
     */
    stopTrackingDeviceList(userId: string): void;
    /**
     * Set all users we're currently tracking to untracked
     *
     * This will flag each user whose devices we are tracking as in need of an
     * update.
     */
    stopTrackingAllDeviceLists(): void;
    /**
     * Mark the cached device list for the given user outdated.
     *
     * If we are not tracking this user's devices, we'll do nothing. Otherwise
     * we flag the user as needing an update.
     *
     * This doesn't actually set off an update, so that several users can be
     * batched together. Call refreshOutdatedDeviceLists() for that.
     *
     */
    invalidateUserDeviceList(userId: string): void;
    /**
     * If we have users who have outdated device lists, start key downloads for them
     *
     * @returns which completes when the download completes; normally there
     *    is no need to wait for this (it's mostly for the unit tests).
     */
    refreshOutdatedDeviceLists(): Promise<void>;
    /**
     * Set the stored device data for a user, in raw object form
     * Used only by internal class DeviceListUpdateSerialiser
     *
     * @param userId - the user to get data for
     *
     * @param devices - `deviceId->{object}` the new devices
     */
    setRawStoredDevicesForUser(userId: string, devices: Record<string, IDevice>): void;
    setRawStoredCrossSigningForUser(userId: string, info: ICrossSigningInfo): void;
    /**
     * Fire off download update requests for the given users, and update the
     * device list tracking status for them, and the
     * keyDownloadsInProgressByUser map for them.
     *
     * @param users -  list of userIds
     *
     * @returns resolves when all the users listed have
     *     been updated. rejects if there was a problem updating any of the
     *     users.
     */
    private doKeyDownload;
}
export {};
//# sourceMappingURL=DeviceList.d.ts.map