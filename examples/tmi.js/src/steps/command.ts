import { EventFunction } from "../types/EventPipeline";
import { Errors } from "../utils/Errors";

export const command: (cmd: string) => EventFunction<"message"> =
	cmd =>
	(_, [, , message]) => {
		if (!message.toLowerCase().startsWith(cmd.toLowerCase())) {
			throw new Errors.Exit();
		}
	};
