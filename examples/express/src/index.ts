import express from "express";
import { UserModel } from "./db/User";
import routes from "./routes";
import { RouteErrors } from "./utils/RouteErrors";

const app = express();

app.use(express.json());

for (const route of routes) {
	app[route.method](route.path, async (req, res, next) => {
		try {
			await route.execute(req, { req, res }, { UserModel });
		} catch (error) {
			if (error instanceof RouteErrors.Exit) return;

			next(error);
		}
	});
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}...`);
});
