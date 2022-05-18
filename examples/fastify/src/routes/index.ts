import { Route } from "../types/Route";
import { userCreateRoute } from "./user/create";
import { userDeleteRoute } from "./user/delete";
import { userReadRoute } from "./user/read";
import { userUpdateRoute } from "./user/update";

const routes: Route<any, any, any>[] = [
	userCreateRoute,
	userReadRoute,
	userUpdateRoute,
	userDeleteRoute,
];

export default routes;
