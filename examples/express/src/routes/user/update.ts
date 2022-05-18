import { User } from "../../db/User";
import { findUser } from "../../steps/findUser";
import { json } from "../../steps/json";
import { Route } from "../../types/Route";
import RoutePipeline, { RouteFunction } from "../../types/RoutePipeline";
import { RouteErrors } from "../../utils/RouteErrors";

type Body = Partial<Omit<User, "id">>;
type Params = { id: string };

const updateUser: RouteFunction<User, Promise<User | null>, Body> = (
	user,
	{ req },
	{ UserModel }
) => {
	return UserModel.update(user.id, req.body);
};

export const userUpdateRoute: Route<Body, Params> = {
	method: "put",
	path: "/user/:id/update",
	execute: new RoutePipeline<Body, Params>()
		.pipe(findUser)
		.catch(json(500))
		.pipe(updateUser)
		.assert(() => new RouteErrors.InternalError())
		.pipe(json(200))
		.compose(),
};
