import { MatrixClient } from "./client";
import { IEvent, MatrixEvent } from "./models/event";
export type EventMapper = (obj: Partial<IEvent>) => MatrixEvent;
export interface MapperOpts {
    preventReEmit?: boolean;
    decrypt?: boolean;
    toDevice?: boolean;
}
export declare function eventMapperFor(client: MatrixClient, options: MapperOpts): EventMapper;
//# sourceMappingURL=event-mapper.d.ts.map