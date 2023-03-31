import { IServerVersions } from "./client";
export declare enum ServerSupport {
    Stable = 0,
    Unstable = 1,
    Unsupported = 2
}
export declare enum Feature {
    Thread = "Thread",
    ThreadUnreadNotifications = "ThreadUnreadNotifications",
    LoginTokenRequest = "LoginTokenRequest",
    RelationBasedRedactions = "RelationBasedRedactions",
    AccountDataDeletion = "AccountDataDeletion"
}
export declare function buildFeatureSupportMap(versions: IServerVersions): Promise<Map<Feature, ServerSupport>>;
//# sourceMappingURL=feature.d.ts.map