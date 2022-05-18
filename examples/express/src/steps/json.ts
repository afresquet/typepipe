import { RouteFunction } from "../types/RoutePipeline";
import { RouteErrors } from "../utils/RouteErrors";

export const json: <T>(statusCode: number) => RouteFunction<T, void> =
	(statusCode = 200) =>
	(value, { res }) => {
		if (value instanceof Error) {
			res.status(statusCode).json({
				error: value.message,
			});

			throw new RouteErrors.Exit();
		}

		res.status(statusCode).json(value);
	};
