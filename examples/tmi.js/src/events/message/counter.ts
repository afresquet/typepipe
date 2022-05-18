import { command } from "../../steps/command";
import { say } from "../../steps/say";
import { skipSelf } from "../../steps/skipSelf";
import { Event } from "../../types/Event";
import EventPipeline from "../../types/EventPipeline";
import { Errors } from "../../utils/Errors";

const counters: { [key: string]: number } = {};

export const counter: Event<"message"> = {
	event: "message",
	execute: new EventPipeline<"message">()
		.tap(skipSelf)
		.tap(command("!counter"))
		.pipe((_, [, , message]) => message.split(" ")[1].toLowerCase())
		.tap(name => {
			if (name === "") {
				throw new Errors.Exit();
			}
		})
		.pipe(name => {
			counters[name] ??= 0;

			return (++counters[name]).toString();
		})
		.tap(say)
		.compose(),
};
