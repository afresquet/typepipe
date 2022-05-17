import { EventFunction } from "../types/EventPipeline";
import { Errors } from "../utils/Errors";

export const skipSelf: EventFunction<"message"> = (_, [, , , self]) => {
	if (self) {
		throw new Errors.Exit();
	}
};
