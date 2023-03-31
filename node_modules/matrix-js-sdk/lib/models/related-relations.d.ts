import { Relations, RelationsEvent, EventHandlerMap } from "./relations";
import { MatrixEvent } from "./event";
import { Listener } from "./typed-event-emitter";
export declare class RelatedRelations {
    private relations;
    constructor(relations: Relations[]);
    getRelations(): MatrixEvent[];
    on<T extends RelationsEvent>(ev: T, fn: Listener<RelationsEvent, EventHandlerMap, T>): void;
    off<T extends RelationsEvent>(ev: T, fn: Listener<RelationsEvent, EventHandlerMap, T>): void;
}
//# sourceMappingURL=related-relations.d.ts.map