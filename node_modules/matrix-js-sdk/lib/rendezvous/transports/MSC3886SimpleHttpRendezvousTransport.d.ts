import { RendezvousFailureListener, RendezvousFailureReason, RendezvousTransport, RendezvousTransportDetails } from "..";
import { MatrixClient } from "../../matrix";
export interface MSC3886SimpleHttpRendezvousTransportDetails extends RendezvousTransportDetails {
    uri: string;
}
/**
 * Implementation of the unstable [MSC3886](https://github.com/matrix-org/matrix-spec-proposals/pull/3886)
 * simple HTTP rendezvous protocol.
 * Note that this is UNSTABLE and may have breaking changes without notice.
 */
export declare class MSC3886SimpleHttpRendezvousTransport<T extends {}> implements RendezvousTransport<T> {
    private uri?;
    private etag?;
    private expiresAt?;
    private client;
    private fallbackRzServer?;
    private fetchFn?;
    private cancelled;
    private _ready;
    onFailure?: RendezvousFailureListener;
    constructor({ onFailure, client, fallbackRzServer, fetchFn, }: {
        fetchFn?: typeof global.fetch;
        onFailure?: RendezvousFailureListener;
        client: MatrixClient;
        fallbackRzServer?: string;
    });
    get ready(): boolean;
    details(): Promise<MSC3886SimpleHttpRendezvousTransportDetails>;
    private fetch;
    private getPostEndpoint;
    send(data: T): Promise<void>;
    receive(): Promise<Partial<T> | undefined>;
    cancel(reason: RendezvousFailureReason): Promise<void>;
}
//# sourceMappingURL=MSC3886SimpleHttpRendezvousTransport.d.ts.map