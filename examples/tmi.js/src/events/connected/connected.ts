import { Event } from "../../types/Event";
import EventPipeline from "../../types/EventPipeline";

export const connected: Event<"connected"> = {
	event: "connected",
	execute: new EventPipeline<"connected">()
		.tap((_, __, { client }) => {
			console.log(`Connected as ${client.getUsername()}`);
		})
		.compose(),
};
