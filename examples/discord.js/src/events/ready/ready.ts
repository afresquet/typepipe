import { Event } from "../../types/Event";
import EventPipeline from "../../types/EventPipeline";

export const ready: Event<"ready"> = {
	event: "ready",
	execute: new EventPipeline<"ready">()
		.tap((_, [client]) => {
			console.log(`Logged in as ${client.user.tag}!`);
		})
		.compose(),
};
