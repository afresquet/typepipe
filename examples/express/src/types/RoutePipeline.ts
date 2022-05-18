import type { Request, Response } from "express";
import { Pipeline, TypePipe } from "typepipe";
import { UserModel } from "../db/User";

export interface RouteContext<Body = {}, Params = {}, Query = {}> {
	req: Request<Params, any, Body, Query>;
	res: Response;
}

export interface RouteGlobal {
	UserModel: typeof UserModel;
}

export default class RoutePipeline<
	Body = {},
	Params = {},
	Query = {}
> extends Pipeline<Request, RouteContext<Body, Params, Query>, RouteGlobal> {}

export interface RouteFunction<
	Input = Request,
	Output = void | Promise<void>,
	Body = {},
	Params = {},
	Query = {}
> extends TypePipe.Function<
		Input,
		Output,
		RouteContext<Body, Params, Query>,
		RouteGlobal
	> {}
