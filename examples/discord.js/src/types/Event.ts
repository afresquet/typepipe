import { ClientEvents } from "discord.js";
import { EventFunction } from "./EventPipeline";

export interface Event<EventName extends keyof ClientEvents> {
	event: EventName;
	execute: EventFunction<EventName>;
}
