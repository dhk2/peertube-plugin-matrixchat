export interface IRoomSummary {
    "m.heroes": string[];
    "m.joined_member_count"?: number;
    "m.invited_member_count"?: number;
}
interface IInfo {
    /** The title of the room (e.g. `m.room.name`) */
    title: string;
    /** The description of the room (e.g. `m.room.topic`) */
    desc?: string;
    /** The number of joined users. */
    numMembers?: number;
    /** The list of aliases for this room. */
    aliases?: string[];
    /** The timestamp for this room. */
    timestamp?: number;
}
/**
 * Construct a new Room Summary. A summary can be used for display on a recent
 * list, without having to load the entire room list into memory.
 * @param roomId - Required. The ID of this room.
 * @param info - Optional. The summary info. Additional keys are supported.
 */
export declare class RoomSummary {
    readonly roomId: string;
    constructor(roomId: string, info?: IInfo);
}
export {};
//# sourceMappingURL=room-summary.d.ts.map