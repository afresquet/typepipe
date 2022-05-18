import { reply } from "../../steps/reply";
import { Event } from "../../types/Event";
import EventPipeline from "../../types/EventPipeline";

export const ping: Event<"messageCreate"> = {
	event: "messageCreate",
	execute: new EventPipeline<"messageCreate">()
		.tap((_, [message], { Errors }) => {
			if (message.content !== "!ping") {
				throw new Errors.Exit();
			}
		})
		.pipe(() => "Pong!")
		.pipe(reply)
		.compose(),
};
``;
