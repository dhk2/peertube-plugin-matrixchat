/**
 * This is an internal module.
 */
import { EventType } from "../@types/event";
import { Room } from "../models/room";
import { User } from "../models/user";
import { IEvent, MatrixEvent } from "../models/event";
import { Filter } from "../filter";
import { ISavedSync, IStore } from "./index";
import { RoomSummary } from "../models/room-summary";
import { ISyncResponse } from "../sync-accumulator";
import { IStateEventWithRoomId } from "../@types/search";
import { IndexedToDeviceBatch, ToDeviceBatch } from "../models/ToDeviceMessage";
import { IStoredClientOpts } from "../client";
/**
 * Construct a stub store. This does no-ops on most store methods.
 */
export declare class StubStore implements IStore {
    readonly accountData: {};
    private fromToken;
    /** @returns whether or not the database was newly created in this session. */
    isNewlyCreated(): Promise<boolean>;
    /**
     * Get the sync token.
     */
    getSyncToken(): string | null;
    /**
     * Set the sync token.
     */
    setSyncToken(token: string): void;
    /**
     * No-op.
     */
    storeRoom(room: Room): void;
    /**
     * No-op.
     */
    getRoom(roomId: string): Room | null;
    /**
     * No-op.
     * @returns An empty array.
     */
    getRooms(): Room[];
    /**
     * Permanently delete a room.
     */
    removeRoom(roomId: string): void;
    /**
     * No-op.
     * @returns An empty array.
     */
    getRoomSummaries(): RoomSummary[];
    /**
     * No-op.
     */
    storeUser(user: User): void;
    /**
     * No-op.
     */
    getUser(userId: string): User | null;
    /**
     * No-op.
     */
    getUsers(): User[];
    /**
     * No-op.
     */
    scrollback(room: Room, limit: number): MatrixEvent[];
    /**
     * Store events for a room.
     * @param room - The room to store events for.
     * @param events - The events to store.
     * @param token - The token associated with these events.
     * @param toStart - True if these are paginated results.
     */
    storeEvents(room: Room, events: MatrixEvent[], token: string | null, toStart: boolean): void;
    /**
     * Store a filter.
     */
    storeFilter(filter: Filter): void;
    /**
     * Retrieve a filter.
     * @returns A filter or null.
     */
    getFilter(userId: string, filterId: string): Filter | null;
    /**
     * Retrieve a filter ID with the given name.
     * @param filterName - The filter name.
     * @returns The filter ID or null.
     */
    getFilterIdByName(filterName: string): string | null;
    /**
     * Set a filter name to ID mapping.
     */
    setFilterIdByName(filterName: string, filterId?: string): void;
    /**
     * Store user-scoped account data events
     * @param events - The events to store.
     */
    storeAccountDataEvents(events: MatrixEvent[]): void;
    /**
     * Get account data event by event type
     * @param eventType - The event type being queried
     */
    getAccountData(eventType: EventType | string): MatrixEvent | undefined;
    /**
     * setSyncData does nothing as there is no backing data store.
     *
     * @param syncData - The sync data
     * @returns An immediately resolved promise.
     */
    setSyncData(syncData: ISyncResponse): Promise<void>;
    /**
     * We never want to save because we have nothing to save to.
     *
     * @returns If the store wants to save
     */
    wantsSave(): boolean;
    /**
     * Save does nothing as there is no backing data store.
     */
    save(): void;
    /**
     * Startup does nothing.
     * @returns An immediately resolved promise.
     */
    startup(): Promise<void>;
    /**
     * @returns Promise which resolves with a sync response to restore the
     * client state to where it was at the last save, or null if there
     * is no saved sync data.
     */
    getSavedSync(): Promise<ISavedSync | null>;
    /**
     * @returns If there is a saved sync, the nextBatch token
     * for this sync, otherwise null.
     */
    getSavedSyncToken(): Promise<string | null>;
    /**
     * Delete all data from this store. Does nothing since this store
     * doesn't store anything.
     * @returns An immediately resolved promise.
     */
    deleteAllData(): Promise<void>;
    getOutOfBandMembers(): Promise<IStateEventWithRoomId[] | null>;
    setOutOfBandMembers(roomId: string, membershipEvents: IStateEventWithRoomId[]): Promise<void>;
    clearOutOfBandMembers(): Promise<void>;
    getClientOptions(): Promise<IStoredClientOpts | undefined>;
    storeClientOptions(options: IStoredClientOpts): Promise<void>;
    getPendingEvents(roomId: string): Promise<Partial<IEvent>[]>;
    setPendingEvents(roomId: string, events: Partial<IEvent>[]): Promise<void>;
    saveToDeviceBatches(batch: ToDeviceBatch[]): Promise<void>;
    getOldestToDeviceBatch(): Promise<IndexedToDeviceBatch | null>;
    removeToDeviceBatch(id: number): Promise<void>;
}
//# sourceMappingURL=stub.d.ts.map