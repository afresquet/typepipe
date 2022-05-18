import { ClientEvents } from "discord.js";
import { Pipeline, TypePipe } from "typepipe";
import { Errors } from "../utils/Errors";

export type EventContext<Event extends keyof ClientEvents> =
	ClientEvents[Event];

export interface EventGlobal {
	Errors: typeof Errors;
}

export default class EventPipeline<
	Event extends keyof ClientEvents,
	Input = EventContext<Event>
> extends Pipeline<Input, EventContext<Event>, EventGlobal> {}

export interface EventFunction<
	Event extends keyof ClientEvents,
	Input = EventContext<Event>,
	Output = any
> extends TypePipe.Function<Input, Output, EventContext<Event>, EventGlobal> {}
