import { FastifyRequest } from "fastify";
import { User } from "../db/User";
import RoutePipeline, { RouteFunction } from "../types/RoutePipeline";
import { RouteErrors } from "../utils/RouteErrors";
import { getParams } from "./getParams";
import { respond } from "./respond";

type Params = { id: string };

const readUser: RouteFunction<{}, {}, {}, Params, Promise<User | undefined>> = (
	data,
	_,
	{ UserModel }
) => {
	return UserModel.read(parseInt(data.id, 10));
};

export const findUser: RouteFunction<
	{},
	Params,
	{},
	FastifyRequest<{ Params: Params; Body: {}; Querystring: {} }>,
	Promise<User>
> = new RoutePipeline<{}, Params>()
	.catch(respond(400))
	.pipe(getParams("id"))
	.assert(() => new RouteErrors.MissingArguments())
	.catch(respond(404))
	.pipe(readUser)
	.assert(() => new RouteErrors.NotFound())
	.compose();
