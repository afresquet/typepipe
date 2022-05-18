import { findUser } from "../../steps/findUser";
import { respond } from "../../steps/json";
import { Route } from "../../types/Route";
import RoutePipeline from "../../types/RoutePipeline";

type Params = { id: string };

export const userReadRoute: Route<{}, Params> = {
	method: "get",
	path: "/user/:id",
	execute: new RoutePipeline<{}, Params>()
		.pipe(findUser)
		.pipe(respond(200))
		.compose(),
};
