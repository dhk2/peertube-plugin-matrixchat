/// <reference types="node" />
import { EventEmitter } from "events";
import { ListenerMap, TypedEventEmitter } from "./models/typed-event-emitter";
export declare class ReEmitter {
    private readonly target;
    constructor(target: EventEmitter);
    private reEmitters;
    reEmit(source: EventEmitter, eventNames: string[]): void;
    stopReEmitting(source: EventEmitter, eventNames: string[]): void;
}
export declare class TypedReEmitter<Events extends string, Arguments extends ListenerMap<Events>> extends ReEmitter {
    constructor(target: TypedEventEmitter<Events, Arguments>);
    reEmit<ReEmittedEvents extends string, T extends Events & ReEmittedEvents>(source: TypedEventEmitter<ReEmittedEvents, any>, eventNames: T[]): void;
    stopReEmitting<ReEmittedEvents extends string, T extends Events & ReEmittedEvents>(source: TypedEventEmitter<ReEmittedEvents, any>, eventNames: T[]): void;
}
//# sourceMappingURL=ReEmitter.d.ts.map