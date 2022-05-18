import { EventFunction } from "../types/EventPipeline";

export const say: EventFunction<
	"message" | "subscription" | "cheer",
	string,
	Promise<void>
> = async (message, [channel], { client }) => {
	await client.say(channel, message);
};
