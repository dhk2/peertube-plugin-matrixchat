/// <reference types="node" />
import { EventEmitter } from "events";
export declare enum EventEmitterEvents {
    NewListener = "newListener",
    RemoveListener = "removeListener",
    Error = "error"
}
type AnyListener = (...args: any) => any;
export type ListenerMap<E extends string> = {
    [eventName in E]: AnyListener;
};
type EventEmitterEventListener = (eventName: string, listener: AnyListener) => void;
type EventEmitterErrorListener = (error: Error) => void;
export type Listener<E extends string, A extends ListenerMap<E>, T extends E | EventEmitterEvents> = T extends E ? A[T] : T extends EventEmitterEvents ? EventEmitterErrorListener : EventEmitterEventListener;
/**
 * Typed Event Emitter class which can act as a Base Model for all our model
 * and communication events.
 * This makes it much easier for us to distinguish between events, as we now need
 * to properly type this, so that our events are not stringly-based and prone
 * to silly typos.
 */
export declare class TypedEventEmitter<Events extends string, Arguments extends ListenerMap<Events>, SuperclassArguments extends ListenerMap<any> = Arguments> extends EventEmitter {
    addListener<T extends Events | EventEmitterEvents>(event: T, listener: Listener<Events, Arguments, T>): this;
    emit<T extends Events>(event: T, ...args: Parameters<SuperclassArguments[T]>): boolean;
    emit<T extends Events>(event: T, ...args: Parameters<Arguments[T]>): boolean;
    eventNames(): (Events | EventEmitterEvents)[];
    listenerCount(event: Events | EventEmitterEvents): number;
    listeners(event: Events | EventEmitterEvents): ReturnType<EventEmitter["listeners"]>;
    off<T extends Events | EventEmitterEvents>(event: T, listener: Listener<Events, Arguments, T>): this;
    on<T extends Events | EventEmitterEvents>(event: T, listener: Listener<Events, Arguments, T>): this;
    once<T extends Events | EventEmitterEvents>(event: T, listener: Listener<Events, Arguments, T>): this;
    prependListener<T extends Events | EventEmitterEvents>(event: T, listener: Listener<Events, Arguments, T>): this;
    prependOnceListener<T extends Events | EventEmitterEvents>(event: T, listener: Listener<Events, Arguments, T>): this;
    removeAllListeners(event?: Events | EventEmitterEvents): this;
    removeListener<T extends Events | EventEmitterEvents>(event: T, listener: Listener<Events, Arguments, T>): this;
    rawListeners(event: Events | EventEmitterEvents): ReturnType<EventEmitter["rawListeners"]>;
}
export {};
//# sourceMappingURL=typed-event-emitter.d.ts.map