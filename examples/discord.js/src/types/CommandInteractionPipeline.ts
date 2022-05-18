import { CommandInteraction } from "discord.js";
import { Pipeline, TypePipe } from "typepipe";
import { EventGlobal } from "./EventPipeline";

export type CommandInteractionContext = [CommandInteraction];

export default class CommandInteractionPipeline<
	Input = CommandInteractionContext
> extends Pipeline<Input, CommandInteractionContext, EventGlobal> {}

export interface CommandInteractionFunction<
	Input = CommandInteractionContext,
	Output = any
> extends TypePipe.Function<
		Input,
		Output,
		CommandInteractionContext,
		EventGlobal
	> {}
