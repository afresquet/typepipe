import { command } from "../../steps/command";
import { say } from "../../steps/say";
import { skipSelf } from "../../steps/skipSelf";
import { Event } from "../../types/Event";
import EventPipeline from "../../types/EventPipeline";

export const ping: Event<"message"> = {
	event: "message",
	execute: new EventPipeline<"message">()
		.tap(skipSelf)
		.tap(command("!ping"))
		.pipe(() => "Pong!")
		.tap(say)
		.compose(),
};
