import { WidgetApi } from "matrix-widget-api";
import { ISendEventResponse } from "./@types/requests";
import { MatrixClient, IMatrixClientCreateOpts, IStartClientOpts } from "./client";
import { SyncState } from "./sync";
import { MatrixEvent } from "./models/event";
import { Room } from "./models/room";
import { ToDeviceBatch } from "./models/ToDeviceMessage";
import { DeviceInfo } from "./crypto/deviceinfo";
import { IOlmDevice } from "./crypto/algorithms/megolm";
interface IStateEventRequest {
    eventType: string;
    stateKey?: string;
}
export interface ICapabilities {
    /**
     * Event types that this client expects to send.
     */
    sendEvent?: string[];
    /**
     * Event types that this client expects to receive.
     */
    receiveEvent?: string[];
    /**
     * Message types that this client expects to send, or true for all message
     * types.
     */
    sendMessage?: string[] | true;
    /**
     * Message types that this client expects to receive, or true for all
     * message types.
     */
    receiveMessage?: string[] | true;
    /**
     * Types of state events that this client expects to send.
     */
    sendState?: IStateEventRequest[];
    /**
     * Types of state events that this client expects to receive.
     */
    receiveState?: IStateEventRequest[];
    /**
     * To-device event types that this client expects to send.
     */
    sendToDevice?: string[];
    /**
     * To-device event types that this client expects to receive.
     */
    receiveToDevice?: string[];
    /**
     * Whether this client needs access to TURN servers.
     * @defaultValue false
     */
    turnServers?: boolean;
}
/**
 * A MatrixClient that routes its requests through the widget API instead of the
 * real CS API.
 * @experimental This class is considered unstable!
 */
export declare class RoomWidgetClient extends MatrixClient {
    private readonly widgetApi;
    private readonly capabilities;
    private readonly roomId;
    private room?;
    private widgetApiReady;
    private lifecycle?;
    private syncState;
    constructor(widgetApi: WidgetApi, capabilities: ICapabilities, roomId: string, opts: IMatrixClientCreateOpts);
    startClient(opts?: IStartClientOpts): Promise<void>;
    stopClient(): void;
    joinRoom(roomIdOrAlias: string): Promise<Room>;
    protected encryptAndSendEvent(room: Room, event: MatrixEvent): Promise<ISendEventResponse>;
    sendStateEvent(roomId: string, eventType: string, content: any, stateKey?: string): Promise<ISendEventResponse>;
    sendToDevice(eventType: string, contentMap: {
        [userId: string]: {
            [deviceId: string]: Record<string, any>;
        };
    }): Promise<{}>;
    queueToDevice({ eventType, batch }: ToDeviceBatch): Promise<void>;
    encryptAndSendToDevices(userDeviceInfoArr: IOlmDevice<DeviceInfo>[], payload: object): Promise<void>;
    checkTurnServers(): Promise<boolean>;
    getSyncState(): SyncState | null;
    private setSyncState;
    private ack;
    private onEvent;
    private onToDevice;
    private watchTurnServers;
}
export {};
//# sourceMappingURL=embedded.d.ts.map