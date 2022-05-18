import { SlashCommandBuilder } from "@discordjs/builders";
import { commandStringOptions } from "../steps/commandStringOptions";
import { replyEphemeral } from "../steps/reply";
import { Command } from "../types/Command";
import CommandInteractionPipeline from "../types/CommandInteractionPipeline";

const counters: { [key: string]: number } = {};

export const counter: Command = {
	data: new SlashCommandBuilder()
		.setName("counter")
		.setDescription("Keep count of things.")
		.addStringOption(option =>
			option
				.setName("counter")
				.setDescription("Name of the counter to increase")
				.setRequired(true)
		),
	execute: new CommandInteractionPipeline()
		.pipe(commandStringOptions("counter"))
		.pipe(([name]) => {
			counters[name] ??= 0;

			return (++counters[name]).toString();
		})
		.tap(replyEphemeral)
		.compose(),
};
