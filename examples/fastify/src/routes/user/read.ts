import { findUser } from "../../steps/findUser";
import { respond } from "../../steps/respond";
import { Route } from "../../types/Route";
import RoutePipeline from "../../types/RoutePipeline";

type Params = { id: string };

export const userReadRoute: Route<{}, Params> = {
	method: "get",
	path: "/user/:id",
	options: {
		preHandler: (_, __, next) => {
			console.log("Hello from preHandler!");

			next();
		},
	},
	execute: new RoutePipeline<{}, Params>()
		.pipe(findUser)
		.pipe(respond(200))
		.compose(),
};
