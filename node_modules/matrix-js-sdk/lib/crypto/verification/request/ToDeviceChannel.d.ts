import { VerificationRequest } from "./VerificationRequest";
import { MatrixEvent } from "../../../models/event";
import { IVerificationChannel } from "./Channel";
import { MatrixClient } from "../../../client";
import { IRequestsMap } from "../..";
export type Request = VerificationRequest<ToDeviceChannel>;
/**
 * A key verification channel that sends verification events over to_device messages.
 * Generates its own transaction ids.
 */
export declare class ToDeviceChannel implements IVerificationChannel {
    private readonly client;
    readonly userId: string;
    private readonly devices;
    transactionId?: string | undefined;
    deviceId?: string | undefined;
    request?: VerificationRequest;
    constructor(client: MatrixClient, userId: string, devices: string[], transactionId?: string | undefined, deviceId?: string | undefined);
    isToDevices(devices: string[]): boolean;
    static getEventType(event: MatrixEvent): string;
    /**
     * Extract the transaction id used by a given key verification event, if any
     * @param event - the event
     * @returns the transaction id
     */
    static getTransactionId(event: MatrixEvent): string;
    /**
     * Checks whether the given event type should be allowed to initiate a new VerificationRequest over this channel
     * @param type - the event type to check
     * @returns boolean flag
     */
    static canCreateRequest(type: string): boolean;
    canCreateRequest(type: string): boolean;
    /**
     * Checks whether this event is a well-formed key verification event.
     * This only does checks that don't rely on the current state of a potentially already channel
     * so we can prevent channels being created by invalid events.
     * `handleEvent` can do more checks and choose to ignore invalid events.
     * @param event - the event to validate
     * @param client - the client to get the current user and device id from
     * @returns whether the event is valid and should be passed to handleEvent
     */
    static validateEvent(event: MatrixEvent, client: MatrixClient): boolean;
    /**
     * @param event - the event to get the timestamp of
     * @returns the timestamp when the event was sent
     */
    getTimestamp(event: MatrixEvent): number;
    /**
     * Changes the state of the channel, request, and verifier in response to a key verification event.
     * @param event - to handle
     * @param request - the request to forward handling to
     * @param isLiveEvent - whether this is an even received through sync or not
     * @returns a promise that resolves when any requests as an answer to the passed-in event are sent.
     */
    handleEvent(event: MatrixEvent, request: Request, isLiveEvent?: boolean): Promise<void>;
    /**
     * See {@link InRoomChannel#completedContentFromEvent} for why this is needed.
     * @param event - the received event
     * @returns the content object
     */
    completedContentFromEvent(event: MatrixEvent): Record<string, any>;
    /**
     * Add all the fields to content needed for sending it over this channel.
     * This is public so verification methods (SAS uses this) can get the exact
     * content that will be sent independent of the used channel,
     * as they need to calculate the hash of it.
     * @param type - the event type
     * @param content - the (incomplete) content
     * @returns the complete content, as it will be sent.
     */
    completeContent(type: string, content: Record<string, any>): Record<string, any>;
    /**
     * Send an event over the channel with the content not having gone through `completeContent`.
     * @param type - the event type
     * @param uncompletedContent - the (incomplete) content
     * @returns the promise of the request
     */
    send(type: string, uncompletedContent?: Record<string, any>): Promise<void>;
    /**
     * Send an event over the channel with the content having gone through `completeContent` already.
     * @param type - the event type
     * @returns the promise of the request
     */
    sendCompleted(type: string, content: Record<string, any>): Promise<void>;
    private sendToDevices;
    /**
     * Allow Crypto module to create and know the transaction id before the .start event gets sent.
     * @returns the transaction id
     */
    static makeTransactionId(): string;
}
export declare class ToDeviceRequests implements IRequestsMap {
    private requestsByUserId;
    getRequest(event: MatrixEvent): Request | undefined;
    getRequestByChannel(channel: ToDeviceChannel): Request | undefined;
    getRequestBySenderAndTxnId(sender: string, txnId: string): Request | undefined;
    setRequest(event: MatrixEvent, request: Request): void;
    setRequestByChannel(channel: ToDeviceChannel, request: Request): void;
    setRequestBySenderAndTxnId(sender: string, txnId: string, request: Request): void;
    removeRequest(event: MatrixEvent): void;
    findRequestInProgress(userId: string, devices: string[]): Request | undefined;
    getRequestsInProgress(userId: string): Request[];
}
//# sourceMappingURL=ToDeviceChannel.d.ts.map