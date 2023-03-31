/**
 * Base class for verification methods.
 */
import { MatrixEvent } from "../../models/event";
import { DeviceInfo } from "../deviceinfo";
import { KeysDuringVerification } from "../CrossSigning";
import { IVerificationChannel } from "./request/Channel";
import { MatrixClient } from "../../client";
import { VerificationRequest } from "./request/VerificationRequest";
import { ListenerMap, TypedEventEmitter } from "../../models/typed-event-emitter";
export declare class SwitchStartEventError extends Error {
    readonly startEvent: MatrixEvent | null;
    constructor(startEvent: MatrixEvent | null);
}
export type KeyVerifier = (keyId: string, device: DeviceInfo, keyInfo: string) => void;
export declare enum VerificationEvent {
    Cancel = "cancel"
}
export type VerificationEventHandlerMap = {
    [VerificationEvent.Cancel]: (e: Error | MatrixEvent) => void;
};
export declare class VerificationBase<Events extends string, Arguments extends ListenerMap<Events | VerificationEvent>> extends TypedEventEmitter<Events | VerificationEvent, Arguments, VerificationEventHandlerMap> {
    readonly channel: IVerificationChannel;
    readonly baseApis: MatrixClient;
    readonly userId: string;
    readonly deviceId: string;
    startEvent: MatrixEvent | null;
    readonly request: VerificationRequest;
    private cancelled;
    private _done;
    private promise;
    private transactionTimeoutTimer;
    protected expectedEvent?: string;
    private resolve?;
    private reject?;
    private resolveEvent?;
    private rejectEvent?;
    private started?;
    /**
     * Base class for verification methods.
     *
     * <p>Once a verifier object is created, the verification can be started by
     * calling the verify() method, which will return a promise that will
     * resolve when the verification is completed, or reject if it could not
     * complete.</p>
     *
     * <p>Subclasses must have a NAME class property.</p>
     *
     * @param channel - the verification channel to send verification messages over.
     * TODO: Channel types
     *
     * @param baseApis - base matrix api interface
     *
     * @param userId - the user ID that is being verified
     *
     * @param deviceId - the device ID that is being verified
     *
     * @param startEvent - the m.key.verification.start event that
     * initiated this verification, if any
     *
     * @param request - the key verification request object related to
     * this verification, if any
     */
    constructor(channel: IVerificationChannel, baseApis: MatrixClient, userId: string, deviceId: string, startEvent: MatrixEvent | null, request: VerificationRequest);
    get initiatedByMe(): boolean;
    get hasBeenCancelled(): boolean;
    private resetTimer;
    private endTimer;
    protected send(type: string, uncompletedContent: Record<string, any>): Promise<void>;
    protected waitForEvent(type: string): Promise<MatrixEvent>;
    canSwitchStartEvent(event: MatrixEvent): boolean;
    switchStartEvent(event: MatrixEvent): void;
    handleEvent(e: MatrixEvent): void;
    done(): Promise<KeysDuringVerification | void>;
    cancel(e: Error | MatrixEvent): void;
    /**
     * Begin the key verification
     *
     * @returns Promise which resolves when the verification has
     *     completed.
     */
    verify(): Promise<void>;
    protected doVerification?: () => Promise<void>;
    protected verifyKeys(userId: string, keys: Record<string, string>, verifier: KeyVerifier): Promise<void>;
    get events(): string[] | undefined;
}
//# sourceMappingURL=Base.d.ts.map