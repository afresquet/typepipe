import { CommandInteractionContext } from "../../types/CommandInteractionPipeline";
import { Event } from "../../types/Event";
import EventPipeline from "../../types/EventPipeline";

export const commands: Event<"interactionCreate"> = {
	event: "interactionCreate",
	execute: new EventPipeline<"interactionCreate">()
		.pipe((_, [interaction]) => (interaction.isCommand() ? interaction : null))
		.assert((_, __, { Errors }) => new Errors.Exit())
		.context<CommandInteractionContext>(interaction => [interaction])
		.pipe(interaction =>
			interaction.client.commands.get(interaction.commandName)
		)
		.assert((_, __, { Errors }) => new Errors.Exit())
		.tap(async (command, context, global) => {
			await command.execute(context, context, global);
		})
		.compose(),
};
