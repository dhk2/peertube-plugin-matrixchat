import { RendezvousTransportDetails, RendezvousIntent } from ".";
export interface RendezvousCode {
    intent: RendezvousIntent;
    rendezvous?: {
        transport: RendezvousTransportDetails;
        algorithm: string;
    };
}
//# sourceMappingURL=RendezvousCode.d.ts.map