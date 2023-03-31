export interface IImageInfo {
    size?: number;
    mimetype?: string;
    thumbnail_info?: {
        w?: number;
        h?: number;
        size?: number;
        mimetype?: string;
    };
    w?: number;
    h?: number;
}
export declare enum Visibility {
    Public = "public",
    Private = "private"
}
export declare enum Preset {
    PrivateChat = "private_chat",
    TrustedPrivateChat = "trusted_private_chat",
    PublicChat = "public_chat"
}
export type ResizeMethod = "crop" | "scale";
export type IdServerUnbindResult = "no-support" | "success";
export declare enum JoinRule {
    Public = "public",
    Invite = "invite",
    /**
     * @deprecated Reserved keyword. Should not be used. Not yet implemented.
     */
    Private = "private",
    Knock = "knock",
    Restricted = "restricted"
}
export declare enum RestrictedAllowType {
    RoomMembership = "m.room_membership"
}
export interface IJoinRuleEventContent {
    join_rule: JoinRule;
    allow?: {
        type: RestrictedAllowType;
        room_id: string;
    }[];
}
export declare enum GuestAccess {
    CanJoin = "can_join",
    Forbidden = "forbidden"
}
export declare enum HistoryVisibility {
    Invited = "invited",
    Joined = "joined",
    Shared = "shared",
    WorldReadable = "world_readable"
}
export interface IUsageLimit {
    limit_type: "monthly_active_user" | "hs_disabled" | string;
    admin_contact?: string;
}
//# sourceMappingURL=partials.d.ts.map