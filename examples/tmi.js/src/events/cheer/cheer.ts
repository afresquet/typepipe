import { say } from "../../steps/say";
import { Event } from "../../types/Event";
import EventPipeline from "../../types/EventPipeline";

export const cheer: Event<"cheer"> = {
	event: "cheer",
	execute: new EventPipeline<"cheer">()
		.pipe((_, [, userstate]) => `Thank you ${userstate.username} for cheering!`)
		.tap(say)
		.compose(),
};
