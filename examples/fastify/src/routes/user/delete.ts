import { User } from "../../db/User";
import { findUser } from "../../steps/findUser";
import { respond } from "../../steps/respond";
import { Route } from "../../types/Route";
import RoutePipeline, { RouteFunction } from "../../types/RoutePipeline";
import { RouteErrors } from "../../utils/RouteErrors";

type Params = { id: string };

const deleteUser: RouteFunction<{}, Params, {}, User, Promise<User | null>> = (
	user,
	_,
	{ UserModel }
) => {
	return UserModel.delete(user.id);
};

export const userDeleteRoute: Route<{}, Params> = {
	method: "delete",
	path: "/user/:id",
	options: {
		schema: {
			params: {
				id: { type: "string" },
			},
		},
	},
	execute: new RoutePipeline<{}, Params>()
		.pipe(findUser)
		.catch(respond(500))
		.pipe(deleteUser)
		.assert(() => new RouteErrors.InternalError())
		.pipe(respond(200))
		.compose(),
};
