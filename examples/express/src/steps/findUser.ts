import { Request } from "express";
import { User } from "../db/User";
import RoutePipeline, { RouteFunction } from "../types/RoutePipeline";
import { RouteErrors } from "../utils/RouteErrors";
import { getParams } from "./getParams";
import { json } from "./json";

type Params = { id: string };

const readUser: RouteFunction<Params, Promise<User | undefined>> = (
	data,
	_,
	{ UserModel }
) => {
	return UserModel.read(parseInt(data.id, 10));
};

export const findUser: RouteFunction<
	Request,
	Promise<User>,
	{},
	Params
> = new RoutePipeline<{}, Params>()
	.catch(json(400))
	.pipe(getParams("id"))
	.assert(() => new RouteErrors.MissingArguments())
	.catch(json(404))
	.pipe(readUser)
	.assert(() => new RouteErrors.NotFound())
	.compose();
