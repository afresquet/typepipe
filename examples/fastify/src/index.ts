import fastify from "fastify";
import { UserModel } from "./db/User";
import routes from "./routes";
import { RouteErrors } from "./utils/RouteErrors";

const app = fastify();

for (const route of routes) {
	app[route.method](route.path, route.options || {}, async (req: any, res) => {
		try {
			const response = await route.execute(req, { req, res }, { UserModel });

			return response;
		} catch (error) {
			if (error instanceof RouteErrors.Exit) {
				return error.response;
			}

			throw error;
		}
	});
}

app.setErrorHandler(error => {
	console.error(error);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}...`);
});
