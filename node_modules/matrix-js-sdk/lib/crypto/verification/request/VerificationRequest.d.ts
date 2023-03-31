import { QRCodeData } from "../QRCode";
import { IVerificationChannel } from "./Channel";
import { MatrixClient } from "../../../client";
import { MatrixEvent } from "../../../models/event";
import { VerificationBase } from "../Base";
import { VerificationMethod } from "../../index";
import { TypedEventEmitter } from "../../../models/typed-event-emitter";
export declare const EVENT_PREFIX = "m.key.verification.";
export declare const REQUEST_TYPE: string;
export declare const START_TYPE: string;
export declare const CANCEL_TYPE: string;
export declare const DONE_TYPE: string;
export declare const READY_TYPE: string;
export declare enum Phase {
    Unsent = 1,
    Requested = 2,
    Ready = 3,
    Started = 4,
    Cancelled = 5,
    Done = 6
}
export declare const PHASE_UNSENT = Phase.Unsent;
export declare const PHASE_REQUESTED = Phase.Requested;
export declare const PHASE_READY = Phase.Ready;
export declare const PHASE_STARTED = Phase.Started;
export declare const PHASE_CANCELLED = Phase.Cancelled;
export declare const PHASE_DONE = Phase.Done;
interface ITargetDevice {
    userId?: string;
    deviceId?: string;
}
export declare enum VerificationRequestEvent {
    Change = "change"
}
type EventHandlerMap = {
    /**
     * Fires whenever the state of the request object has changed.
     */
    [VerificationRequestEvent.Change]: () => void;
};
/**
 * State machine for verification requests.
 * Things that differ based on what channel is used to
 * send and receive verification events are put in `InRoomChannel` or `ToDeviceChannel`.
 */
export declare class VerificationRequest<C extends IVerificationChannel = IVerificationChannel> extends TypedEventEmitter<VerificationRequestEvent, EventHandlerMap> {
    readonly channel: C;
    private readonly verificationMethods;
    private readonly client;
    private eventsByUs;
    private eventsByThem;
    private _observeOnly;
    private timeoutTimer;
    private _accepting;
    private _declining;
    private verifierHasFinished;
    private _cancelled;
    private _chosenMethod;
    private _qrCodeData;
    private requestReceivedAt;
    private commonMethods;
    private _phase;
    _cancellingUserId?: string;
    private _verifier?;
    constructor(channel: C, verificationMethods: Map<VerificationMethod, typeof VerificationBase>, client: MatrixClient);
    /**
     * Stateless validation logic not specific to the channel.
     * Invoked by the same static method in either channel.
     * @param type - the "symbolic" event type, as returned by the `getEventType` function on the channel.
     * @param event - the event to validate. Don't call getType() on it but use the `type` parameter instead.
     * @param client - the client to get the current user and device id from
     * @returns whether the event is valid and should be passed to handleEvent
     */
    static validateEvent(type: string, event: MatrixEvent, client: MatrixClient): boolean;
    get invalid(): boolean;
    /** returns whether the phase is PHASE_REQUESTED */
    get requested(): boolean;
    /** returns whether the phase is PHASE_CANCELLED */
    get cancelled(): boolean;
    /** returns whether the phase is PHASE_READY */
    get ready(): boolean;
    /** returns whether the phase is PHASE_STARTED */
    get started(): boolean;
    /** returns whether the phase is PHASE_DONE */
    get done(): boolean;
    /** once the phase is PHASE_STARTED (and !initiatedByMe) or PHASE_READY: common methods supported by both sides */
    get methods(): VerificationMethod[];
    /** the method picked in the .start event */
    get chosenMethod(): VerificationMethod | null;
    calculateEventTimeout(event: MatrixEvent): number;
    /** The current remaining amount of ms before the request should be automatically cancelled */
    get timeout(): number;
    /**
     * The key verification request event.
     * @returns The request event, or falsey if not found.
     */
    get requestEvent(): MatrixEvent | undefined;
    /** current phase of the request. Some properties might only be defined in a current phase. */
    get phase(): Phase;
    /** The verifier to do the actual verification, once the method has been established. Only defined when the `phase` is PHASE_STARTED. */
    get verifier(): VerificationBase<any, any> | undefined;
    get canAccept(): boolean;
    get accepting(): boolean;
    get declining(): boolean;
    /** whether this request has sent it's initial event and needs more events to complete */
    get pending(): boolean;
    /** Only set after a .ready if the other party can scan a QR code */
    get qrCodeData(): QRCodeData | null;
    /** Checks whether the other party supports a given verification method.
     *  This is useful when setting up the QR code UI, as it is somewhat asymmetrical:
     *  if the other party supports SCAN_QR, we should show a QR code in the UI, and vice versa.
     *  For methods that need to be supported by both ends, use the `methods` property.
     *  @param method - the method to check
     *  @param force - to check even if the phase is not ready or started yet, internal usage
     *  @returns whether or not the other party said the supported the method */
    otherPartySupportsMethod(method: string, force?: boolean): boolean;
    /** Whether this request was initiated by the syncing user.
     * For InRoomChannel, this is who sent the .request event.
     * For ToDeviceChannel, this is who sent the .start event
     */
    get initiatedByMe(): boolean;
    /** The id of the user that initiated the request */
    get requestingUserId(): string;
    /** The id of the user that (will) receive(d) the request */
    get receivingUserId(): string;
    /** The user id of the other party in this request */
    get otherUserId(): string;
    get isSelfVerification(): boolean;
    /**
     * The id of the user that cancelled the request,
     * only defined when phase is PHASE_CANCELLED
     */
    get cancellingUserId(): string | undefined;
    /**
     * The cancellation code e.g m.user which is responsible for cancelling this verification
     */
    get cancellationCode(): string;
    get observeOnly(): boolean;
    /**
     * Gets which device the verification should be started with
     * given the events sent so far in the verification. This is the
     * same algorithm used to determine which device to send the
     * verification to when no specific device is specified.
     * @returns The device information
     */
    get targetDevice(): ITargetDevice;
    beginKeyVerification(method: VerificationMethod, targetDevice?: ITargetDevice | null): VerificationBase<any, any>;
    /**
     * sends the initial .request event.
     * @returns resolves when the event has been sent.
     */
    sendRequest(): Promise<void>;
    /**
     * Cancels the request, sending a cancellation to the other party
     * @param reason - the error reason to send the cancellation with
     * @param code - the error code to send the cancellation with
     * @returns resolves when the event has been sent.
     */
    cancel({ reason, code }?: {
        reason?: string | undefined;
        code?: string | undefined;
    }): Promise<void>;
    /**
     * Accepts the request, sending a .ready event to the other party
     * @returns resolves when the event has been sent.
     */
    accept(): Promise<void>;
    /**
     * Can be used to listen for state changes until the callback returns true.
     * @param fn - callback to evaluate whether the request is in the desired state.
     *                      Takes the request as an argument.
     * @returns that resolves once the callback returns true
     * @throws Error when the request is cancelled
     */
    waitFor(fn: (request: VerificationRequest) => boolean): Promise<VerificationRequest>;
    private setPhase;
    private getEventByEither;
    private getEventBy;
    private calculatePhaseTransitions;
    private transitionToPhase;
    private applyPhaseTransitions;
    private isWinningStartRace;
    hasEventId(eventId: string): boolean;
    /**
     * Changes the state of the request and verifier in response to a key verification event.
     * @param type - the "symbolic" event type, as returned by the `getEventType` function on the channel.
     * @param event - the event to handle. Don't call getType() on it but use the `type` parameter instead.
     * @param isLiveEvent - whether this is an even received through sync or not
     * @param isRemoteEcho - whether this is the remote echo of an event sent by the same device
     * @param isSentByUs - whether this event is sent by a party that can accept and/or observe the request like one of our peers.
     *   For InRoomChannel this means any device for the syncing user. For ToDeviceChannel, just the syncing device.
     * @returns a promise that resolves when any requests as an answer to the passed-in event are sent.
     */
    handleEvent(type: string, event: MatrixEvent, isLiveEvent: boolean, isRemoteEcho: boolean, isSentByUs: boolean): Promise<void>;
    private setupTimeout;
    private cancelOnTimeout;
    private cancelOnError;
    private adjustObserveOnly;
    private addEvent;
    private createVerifier;
    private wasSentByOwnUser;
    private wasSentByOwnDevice;
    onVerifierCancelled(): void;
    onVerifierFinished(): void;
    getEventFromOtherParty(type: string): MatrixEvent | undefined;
}
export {};
//# sourceMappingURL=VerificationRequest.d.ts.map