import { CommandInteractionFunction } from "../types/CommandInteractionPipeline";
import { EventFunction } from "../types/EventPipeline";

export const reply: EventFunction<
	"messageCreate",
	string,
	Promise<void>
> = async (content, [message]) => {
	await message.reply(content);
};

export const replyEphemeral: CommandInteractionFunction<
	string,
	Promise<void>
> = async (content, [msg]) => {
	await msg.reply({
		content,
		ephemeral: true,
	});
};
