import { IContent, IEvent } from "../models/event";
import { Preset, Visibility } from "./partials";
import { IEventWithRoomId, SearchKey } from "./search";
import { IRoomEventFilter } from "../filter";
import { Direction } from "../models/event-timeline";
import { PushRuleAction } from "./PushRules";
import { IRoomEvent } from "../sync-accumulator";
import { EventType, RelationType, RoomType } from "./event";
export interface IJoinRoomOpts {
    /**
     * True to do a room initial sync on the resulting
     * room. If false, the <strong>returned Room object will have no current state.
     * </strong> Default: true.
     */
    syncRoom?: boolean;
    /**
     * If the caller has a keypair 3pid invite, the signing URL is passed in this parameter.
     */
    inviteSignUrl?: string;
    /**
     * The server names to try and join through in addition to those that are automatically chosen.
     */
    viaServers?: string[];
}
export interface IRedactOpts {
    reason?: string;
    /**
     * Whether events related to the redacted event should be redacted.
     *
     * If specified, then any events which relate to the event being redacted with
     * any of the relationship types listed will also be redacted.
     *
     * <b>Raises an Error if the server does not support it.</b>
     * Check for server-side support before using this param with
     * <code>client.canSupport.get(Feature.RelationBasedRedactions)</code>.
     * {@link https://github.com/matrix-org/matrix-spec-proposals/pull/3912}
     */
    with_relations?: Array<RelationType | string>;
}
export interface ISendEventResponse {
    event_id: string;
}
export interface IPresenceOpts {
    presence: "online" | "offline" | "unavailable";
    status_msg?: string;
}
export interface IPaginateOpts {
    backwards?: boolean;
    limit?: number;
}
export interface IGuestAccessOpts {
    /**
     * True to allow guests to join this room. This
     * implicitly gives guests write access. If false or not given, guests are
     * explicitly forbidden from joining the room.
     */
    allowJoin: boolean;
    /**
     * True to set history visibility to
     * be world_readable. This gives guests read access *from this point forward*.
     * If false or not given, history visibility is not modified.
     */
    allowRead: boolean;
}
export interface ISearchOpts {
    keys?: SearchKey[];
    query: string;
}
export interface IEventSearchOpts {
    filter?: IRoomEventFilter;
    term: string;
}
export interface IInvite3PID {
    id_server: string;
    id_access_token?: string;
    medium: string;
    address: string;
}
export interface ICreateRoomStateEvent {
    type: string;
    state_key?: string;
    content: IContent;
}
export interface ICreateRoomOpts {
    room_alias_name?: string;
    visibility?: Visibility;
    name?: string;
    topic?: string;
    preset?: Preset;
    power_level_content_override?: {
        ban?: number;
        events?: Record<EventType | string, number>;
        events_default?: number;
        invite?: number;
        kick?: number;
        notifications?: Record<string, number>;
        redact?: number;
        state_default?: number;
        users?: Record<string, number>;
        users_default?: number;
    };
    creation_content?: object;
    initial_state?: ICreateRoomStateEvent[];
    invite?: string[];
    invite_3pid?: IInvite3PID[];
    is_direct?: boolean;
    room_version?: string;
}
export interface IRoomDirectoryOptions {
    server?: string;
    limit?: number;
    since?: string;
    filter?: {
        generic_search_term?: string;
        room_types?: Array<RoomType | null>;
    };
    include_all_networks?: boolean;
    third_party_instance_id?: string;
}
export interface IAddThreePidOnlyBody {
    auth?: {
        type: string;
        session?: string;
    };
    client_secret: string;
    sid: string;
}
export interface IBindThreePidBody {
    client_secret: string;
    id_server: string;
    id_access_token: string;
    sid: string;
}
export interface IRelationsRequestOpts {
    from?: string;
    to?: string;
    limit?: number;
    dir?: Direction;
}
export interface IRelationsResponse {
    chunk: IEvent[];
    next_batch?: string;
    prev_batch?: string;
}
export interface IContextResponse {
    end: string;
    start: string;
    state: IEventWithRoomId[];
    events_before: IEventWithRoomId[];
    events_after: IEventWithRoomId[];
    event: IEventWithRoomId;
}
export interface IEventsResponse {
    chunk: IEventWithRoomId[];
    end: string;
    start: string;
}
export interface INotification {
    actions: PushRuleAction[];
    event: IRoomEvent;
    profile_tag?: string;
    read: boolean;
    room_id: string;
    ts: number;
}
export interface INotificationsResponse {
    next_token: string;
    notifications: INotification[];
}
export interface IFilterResponse {
    filter_id: string;
}
export interface ITagsResponse {
    tags: {
        [tagId: string]: {
            order: number;
        };
    };
}
export interface IStatusResponse extends IPresenceOpts {
    currently_active?: boolean;
    last_active_ago?: number;
}
//# sourceMappingURL=requests.d.ts.map