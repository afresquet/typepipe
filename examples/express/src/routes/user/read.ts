import { findUser } from "../../steps/findUser";
import { json } from "../../steps/json";
import { Route } from "../../types/Route";
import RoutePipeline from "../../types/RoutePipeline";

type Params = { id: string };

export const userReadRoute: Route<{}, Params> = {
	method: "get",
	path: "/user/:id",
	execute: new RoutePipeline<{}, Params>()
		.pipe(findUser)
		.pipe(json(200))
		.compose(),
};
