import { CommandInteractionFunction } from "../types/CommandInteractionPipeline";

export const commandStringOptions: (
	...options: string[]
) => CommandInteractionFunction<unknown, string[]> =
	(...options) =>
	(_, [interaction]) => {
		return options.reduce<string[]>((acc, option) => {
			return [...acc, interaction.options.getString(option, true)];
		}, []);
	};
