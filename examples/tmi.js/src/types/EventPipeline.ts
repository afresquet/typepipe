import { Client, Events } from "tmi.js";
import { Pipeline, TypePipe } from "typepipe";

export type EventContext<Event extends keyof Events> = Parameters<
	Events[Event]
>;

export interface EventGlobal {
	client: Client;
}

export default class EventPipeline<
	Event extends keyof Events,
	Value = EventContext<Event>
> extends Pipeline<Value, EventContext<Event>, EventGlobal> {}

export interface EventFunction<
	Event extends keyof Events,
	Input = EventContext<Event>,
	Output = any
> extends TypePipe.Function<Input, Output, EventContext<Event>, EventGlobal> {}
