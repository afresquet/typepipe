import { RouteFunction } from "../types/RoutePipeline";

export const json: <T>(statusCode: number) => RouteFunction<T, void> =
	(statusCode = 200) =>
	(value, { res }) => {
		if (value instanceof Error) {
			res.status(statusCode).json({
				error: value.message,
			});

			return;
		}

		res.status(statusCode).json(value);
	};
