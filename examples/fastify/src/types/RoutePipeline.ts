import type { FastifyReply, FastifyRequest } from "fastify";
import { Pipeline, TypePipe } from "typepipe";
import { UserModel } from "../db/User";

export interface RouteContext<Body = {}, Params = {}, Query = {}> {
	req: FastifyRequest<{ Body: Body; Params: Params; Querystring: Query }>;
	res: FastifyReply;
}

export interface RouteGlobal {
	UserModel: typeof UserModel;
}

export default class RoutePipeline<
	Body = {},
	Params = {},
	Query = {}
> extends Pipeline<
	FastifyRequest<{ Body: Body; Params: Params; Querystring: Query }>,
	RouteContext<Body, Params, Query>,
	RouteGlobal
> {}

export interface RouteFunction<
	Body = {},
	Params = {},
	Query = {},
	Input = FastifyRequest<{ Body: Body; Params: Params; Querystring: Query }>,
	Output = void | Promise<void>
> extends TypePipe.Function<
		Input,
		Output,
		RouteContext<Body, Params, Query>,
		RouteGlobal
	> {}
