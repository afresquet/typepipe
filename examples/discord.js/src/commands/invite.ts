import { SlashCommandBuilder } from "@discordjs/builders";
import { replyEphemeral } from "../steps/reply";
import { Command } from "../types/Command";
import CommandInteractionPipeline from "../types/CommandInteractionPipeline";

export const invite: Command = {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Invite the bot to your server."),
	execute: new CommandInteractionPipeline()
		.pipe((_, [interaction]) =>
			interaction.client.generateInvite({
				scopes: ["bot", "applications.commands"],
			})
		)
		.pipe(url => `[Click here to add me to your server](${url})`)
		.tap(replyEphemeral)
		.compose(),
};
