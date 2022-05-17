import { User } from "../../db/User";
import { getBodyParams } from "../../steps/getParams";
import { json } from "../../steps/json";
import { Route } from "../../types/Route";
import RoutePipeline, { RouteFunction } from "../../types/RoutePipeline";
import { RouteErrors } from "../../utils/RouteErrors";

type Body = Pick<User, "name" | "email">;

const createUser: RouteFunction<Body, Promise<User>> = (
	userData,
	_,
	{ UserModel }
) => {
	return UserModel.create(userData);
};

export const userCreateRoute: Route<Body> = {
	method: "post",
	path: "/user",
	execute: new RoutePipeline<Body>()
		.catch(json(400))
		.pipe(getBodyParams("name", "email"))
		.assert(RouteErrors.MissingArguments)
		.catch(json(500))
		.pipe(createUser)
		.pipe(json(201))
		.compose(),
};
