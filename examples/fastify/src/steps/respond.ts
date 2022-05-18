import { RouteFunction } from "../types/RoutePipeline";
import { RouteErrors } from "../utils/RouteErrors";

export const respond: <T>(
	statusCode: number
) => RouteFunction<{}, {}, {}, T, void> =
	(statusCode = 200) =>
	(value, { res }) => {
		res.code(statusCode);

		if (value instanceof Error) {
			throw new RouteErrors.Exit({
				error: value.message,
			});
		}

		return value;
	};
