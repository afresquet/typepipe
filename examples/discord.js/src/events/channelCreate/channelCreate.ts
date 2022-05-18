import { Event } from "../../types/Event";
import EventPipeline from "../../types/EventPipeline";

export const channelCreate: Event<"channelCreate"> = {
	event: "channelCreate",
	execute: new EventPipeline<"channelCreate">()
		.pipe((_, [channel]) => (channel.isText() ? channel : null))
		.assert((_, __, { Errors }) => new Errors.Exit())
		.tap(async channel => {
			await channel.setName(`${channel.name}-bot-was-here`);
		})
		.tap(async channel => {
			await channel.send(`Hello, <#${channel.id}>!`);
		})
		.compose(),
};
