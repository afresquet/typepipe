import { FastifyRequest, RouteShorthandOptions } from "fastify";
import { RouteFunction } from "./RoutePipeline";

export interface Route<Body = {}, Params = {}, Query = {}> {
	method: "get" | "post" | "put" | "delete";
	path: string;
	options?: RouteShorthandOptions;
	execute: RouteFunction<
		FastifyRequest<{ Body: Body; Params: Params; Query: Query }>,
		void | Promise<void>,
		Body,
		Params,
		Query
	>;
}
