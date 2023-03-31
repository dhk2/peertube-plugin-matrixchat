import { VerificationRequest } from "./VerificationRequest";
import { IVerificationChannel } from "./Channel";
import { MatrixClient } from "../../../client";
import { MatrixEvent } from "../../../models/event";
import { IRequestsMap } from "../..";
/**
 * A key verification channel that sends verification events in the timeline of a room.
 * Uses the event id of the initial m.key.verification.request event as a transaction id.
 */
export declare class InRoomChannel implements IVerificationChannel {
    private readonly client;
    readonly roomId: string;
    userId?: string | undefined;
    private requestEventId?;
    /**
     * @param client - the matrix client, to send messages with and get current user & device from.
     * @param roomId - id of the room where verification events should be posted in, should be a DM with the given user.
     * @param userId - id of user that the verification request is directed at, should be present in the room.
     */
    constructor(client: MatrixClient, roomId: string, userId?: string | undefined);
    get receiveStartFromOtherDevices(): boolean;
    /** The transaction id generated/used by this verification channel */
    get transactionId(): string | undefined;
    static getOtherPartyUserId(event: MatrixEvent, client: MatrixClient): string | undefined;
    /**
     * @param event - the event to get the timestamp of
     * @returns the timestamp when the event was sent
     */
    getTimestamp(event: MatrixEvent): number;
    /**
     * Checks whether the given event type should be allowed to initiate a new VerificationRequest over this channel
     * @param type - the event type to check
     * @returns boolean flag
     */
    static canCreateRequest(type: string): boolean;
    canCreateRequest(type: string): boolean;
    /**
     * Extract the transaction id used by a given key verification event, if any
     * @param event - the event
     * @returns the transaction id
     */
    static getTransactionId(event: MatrixEvent): string | undefined;
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
     * As m.key.verification.request events are as m.room.message events with the InRoomChannel
     * to have a fallback message in non-supporting clients, we map the real event type
     * to the symbolic one to keep things in unison with ToDeviceChannel
     * @param event - the event to get the type of
     * @returns the "symbolic" event type
     */
    static getEventType(event: MatrixEvent): string;
    /**
     * Changes the state of the channel, request, and verifier in response to a key verification event.
     * @param event - to handle
     * @param request - the request to forward handling to
     * @param isLiveEvent - whether this is an even received through sync or not
     * @returns a promise that resolves when any requests as an answer to the passed-in event are sent.
     */
    handleEvent(event: MatrixEvent, request: VerificationRequest, isLiveEvent?: boolean): Promise<void>;
    /**
     * Adds the transaction id (relation) back to a received event
     * so it has the same format as returned by `completeContent` before sending.
     * The relation can not appear on the event content because of encryption,
     * relations are excluded from encryption.
     * @param event - the received event
     * @returns the content object with the relation added again
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
    send(type: string, uncompletedContent: Record<string, any>): Promise<void>;
    /**
     * Send an event over the channel with the content having gone through `completeContent` already.
     * @param type - the event type
     * @returns the promise of the request
     */
    sendCompleted(type: string, content: Record<string, any>): Promise<void>;
}
export declare class InRoomRequests implements IRequestsMap {
    private requestsByRoomId;
    getRequest(event: MatrixEvent): VerificationRequest | undefined;
    getRequestByChannel(channel: InRoomChannel): VerificationRequest | undefined;
    private getRequestByTxnId;
    setRequest(event: MatrixEvent, request: VerificationRequest): void;
    setRequestByChannel(channel: IVerificationChannel, request: VerificationRequest): void;
    private doSetRequest;
    removeRequest(event: MatrixEvent): void;
    findRequestInProgress(roomId: string): VerificationRequest | undefined;
}
//# sourceMappingURL=InRoomChannel.d.ts.map