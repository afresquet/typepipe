import { Events } from "tmi.js";
import { EventFunction } from "./EventPipeline";

export interface Event<EventName extends keyof Events> {
	event: EventName;
	execute: EventFunction<EventName>;
}
