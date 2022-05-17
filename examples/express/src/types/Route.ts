import { Request } from "express";
import { RouteFunction } from "./RoutePipeline";

export interface Route<Body = {}, Params = {}, Query = {}> {
	method: "get" | "post" | "put" | "delete";
	path: string;
	execute: RouteFunction<
		Request<Params, any, Body, Query>,
		void | Promise<void>,
		Body,
		Params,
		Query
	>;
}
