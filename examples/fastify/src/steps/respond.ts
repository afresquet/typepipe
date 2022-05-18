import { RouteFunction } from "../types/RoutePipeline";

export const respond: <T>(statusCode: number) => RouteFunction<T, void> =
	(statusCode = 200) =>
	(value, { res }) => {
		res.code(statusCode);

		if (value instanceof Error) {
			return {
				error: value.message,
			};
		}

		return value;
	};
