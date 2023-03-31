/**
 * Verification method that is illegal to have (cannot possibly
 * do verification with this method).
 */
import { VerificationBase as Base, VerificationEvent, VerificationEventHandlerMap } from "./Base";
import { IVerificationChannel } from "./request/Channel";
import { MatrixClient } from "../../client";
import { MatrixEvent } from "../../models/event";
import { VerificationRequest } from "./request/VerificationRequest";
export declare class IllegalMethod extends Base<VerificationEvent, VerificationEventHandlerMap> {
    static factory(channel: IVerificationChannel, baseApis: MatrixClient, userId: string, deviceId: string, startEvent: MatrixEvent, request: VerificationRequest): IllegalMethod;
    static get NAME(): string;
    protected doVerification: () => Promise<void>;
}
//# sourceMappingURL=IllegalMethod.d.ts.map