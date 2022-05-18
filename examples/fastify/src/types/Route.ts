import { FastifyRequest, RouteShorthandOptions } from "fastify";
import { RouteFunction } from "./RoutePipeline";

export interface Route<Body = {}, Params = {}, Query = {}> {
	method: "get" | "post" | "put" | "delete";
	path: string;
	options?: RouteShorthandOptions;
	execute: RouteFunction<
		Body,
		Params,
		Query,
		FastifyRequest<{ Body: Body; Params: Params; Querystring: Query }>,
		void | Promise<void>
	>;
}
