import { RouteFunction } from "../types/RoutePipeline";

const createParamGetter =
	<X extends "body" | "params" | "query">(type: X) =>
	<Input, U extends string[]>(
		...keys: U
	): RouteFunction<
		X extends "body" ? { [K in typeof keys[number]]: string } : {},
		X extends "params" ? { [K in typeof keys[number]]: string } : {},
		X extends "query" ? { [K in typeof keys[number]]: string } : {},
		Input,
		{ [K in typeof keys[number]]: string } | null
	> =>
	(_, { req }) => {
		const data: { [K in X]?: string } = {};

		for (const key of keys) {
			const value = (req[type] as { [K in typeof keys[number]]?: string })[
				key as typeof keys[number]
			];

			if (!value) {
				return null;
			}

			data[key as keyof typeof data] = value;
		}

		return data as { [K in typeof keys[number]]: string };
	};

export const getParams = createParamGetter("params");
export const getBodyParams = createParamGetter("body");
export const getQueryParams = createParamGetter("query");
