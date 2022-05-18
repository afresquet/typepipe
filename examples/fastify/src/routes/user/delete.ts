import { User } from "../../db/User";
import { findUser } from "../../steps/findUser";
import { respond } from "../../steps/json";
import { Route } from "../../types/Route";
import RoutePipeline, { RouteFunction } from "../../types/RoutePipeline";
import { RouteErrors } from "../../utils/RouteErrors";

type Params = { id: string };

const deleteUser: RouteFunction<User, Promise<User | null>, {}, Params> = (
	user,
	_,
	{ UserModel }
) => {
	return UserModel.delete(user.id);
};

export const userDeleteRoute: Route<{}, Params> = {
	method: "delete",
	path: "/user/:id",
	execute: new RoutePipeline<{}, Params>()
		.pipe(findUser)
		.catch(respond(500))
		.pipe(deleteUser)
		.assert(() => new RouteErrors.InternalError())
		.pipe(respond(200))
		.compose(),
};
