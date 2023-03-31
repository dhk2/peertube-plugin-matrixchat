export type RendezvousFailureListener = (reason: RendezvousFailureReason) => void;
export declare enum RendezvousFailureReason {
    UserDeclined = "user_declined",
    OtherDeviceNotSignedIn = "other_device_not_signed_in",
    OtherDeviceAlreadySignedIn = "other_device_already_signed_in",
    Unknown = "unknown",
    Expired = "expired",
    UserCancelled = "user_cancelled",
    InvalidCode = "invalid_code",
    UnsupportedAlgorithm = "unsupported_algorithm",
    DataMismatch = "data_mismatch",
    UnsupportedTransport = "unsupported_transport",
    HomeserverLacksSupport = "homeserver_lacks_support"
}
//# sourceMappingURL=RendezvousFailureReason.d.ts.map