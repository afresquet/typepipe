import express from "express";
import { UserModel } from "./db/User";
import routes from "./routes";

const app = express();

app.use(express.json());

for (const route of routes) {
	app[route.method](route.path, async (req, res) => {
		await route.execute(req, { req, res }, { UserModel });
	});
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}...`);
});
