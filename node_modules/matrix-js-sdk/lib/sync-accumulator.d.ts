import { IContent, IUnsigned } from "./models/event";
import { IRoomSummary } from "./models/room-summary";
import { EventType } from "./@types/event";
interface IOpts {
    /**
     * The ideal maximum number of timeline entries to keep in the sync response.
     * This is best-effort, as clients do not always have a back-pagination token for each event,
     * so it's possible there may be slightly *less* than this value. There will never be more.
     * This cannot be 0 or else it makes it impossible to scroll back in a room.
     * Default: 50.
     */
    maxTimelineEntries?: number;
}
export interface IMinimalEvent {
    content: IContent;
    type: EventType | string;
    unsigned?: IUnsigned;
}
export interface IEphemeral {
    events: IMinimalEvent[];
}
interface UnreadNotificationCounts {
    highlight_count?: number;
    notification_count?: number;
}
export interface IRoomEvent extends IMinimalEvent {
    event_id: string;
    sender: string;
    origin_server_ts: number;
    /** @deprecated - legacy field */
    age?: number;
}
export interface IStateEvent extends IRoomEvent {
    prev_content?: IContent;
    state_key: string;
}
interface IState {
    events: IStateEvent[];
}
export interface ITimeline {
    events: Array<IRoomEvent | IStateEvent>;
    limited?: boolean;
    prev_batch: string | null;
}
export interface IJoinedRoom {
    "summary": IRoomSummary;
    "state": IState;
    "timeline": ITimeline;
    "ephemeral": IEphemeral;
    "account_data": IAccountData;
    "unread_notifications": UnreadNotificationCounts;
    "unread_thread_notifications"?: Record<string, UnreadNotificationCounts>;
    "org.matrix.msc3773.unread_thread_notifications"?: Record<string, UnreadNotificationCounts>;
}
export interface IStrippedState {
    content: IContent;
    state_key: string;
    type: EventType | string;
    sender: string;
}
export interface IInviteState {
    events: IStrippedState[];
}
export interface IInvitedRoom {
    invite_state: IInviteState;
}
export interface ILeftRoom {
    state: IState;
    timeline: ITimeline;
    account_data: IAccountData;
}
export interface IRooms {
    [Category.Join]: Record<string, IJoinedRoom>;
    [Category.Invite]: Record<string, IInvitedRoom>;
    [Category.Leave]: Record<string, ILeftRoom>;
}
interface IPresence {
    events: IMinimalEvent[];
}
interface IAccountData {
    events: IMinimalEvent[];
}
export interface IToDeviceEvent {
    content: IContent;
    sender: string;
    type: string;
}
interface IToDevice {
    events: IToDeviceEvent[];
}
interface IDeviceLists {
    changed?: string[];
    left?: string[];
}
export interface ISyncResponse {
    "next_batch": string;
    "rooms": IRooms;
    "presence"?: IPresence;
    "account_data": IAccountData;
    "to_device"?: IToDevice;
    "device_lists"?: IDeviceLists;
    "device_one_time_keys_count"?: Record<string, number>;
    "device_unused_fallback_key_types"?: string[];
    "org.matrix.msc2732.device_unused_fallback_key_types"?: string[];
}
export declare enum Category {
    Invite = "invite",
    Leave = "leave",
    Join = "join"
}
export interface ISyncData {
    nextBatch: string;
    accountData: IMinimalEvent[];
    roomsData: IRooms;
}
/**
 * The purpose of this class is to accumulate /sync responses such that a
 * complete "initial" JSON response can be returned which accurately represents
 * the sum total of the /sync responses accumulated to date. It only handles
 * room data: that is, everything under the "rooms" top-level key.
 *
 * This class is used when persisting room data so a complete /sync response can
 * be loaded from disk and incremental syncs can be performed on the server,
 * rather than asking the server to do an initial sync on startup.
 */
export declare class SyncAccumulator {
    private readonly opts;
    private accountData;
    private inviteRooms;
    private joinRooms;
    private nextBatch;
    constructor(opts?: IOpts);
    accumulate(syncResponse: ISyncResponse, fromDatabase?: boolean): void;
    private accumulateAccountData;
    /**
     * Accumulate incremental /sync room data.
     * @param syncResponse - the complete /sync JSON
     * @param fromDatabase - True if the sync response is one saved to the database
     */
    private accumulateRooms;
    private accumulateRoom;
    private accumulateInviteState;
    private accumulateJoinState;
    /**
     * Return everything under the 'rooms' key from a /sync response which
     * represents all room data that should be stored. This should be paired
     * with the sync token which represents the most recent /sync response
     * provided to accumulate().
     * @param forDatabase - True to generate a sync to be saved to storage
     * @returns An object with a "nextBatch", "roomsData" and "accountData"
     * keys.
     * The "nextBatch" key is a string which represents at what point in the
     * /sync stream the accumulator reached. This token should be used when
     * restarting a /sync stream at startup. Failure to do so can lead to missing
     * events. The "roomsData" key is an Object which represents the entire
     * /sync response from the 'rooms' key onwards. The "accountData" key is
     * a list of raw events which represent global account data.
     */
    getJSON(forDatabase?: boolean): ISyncData;
    getNextBatchToken(): string;
}
export {};
//# sourceMappingURL=sync-accumulator.d.ts.map