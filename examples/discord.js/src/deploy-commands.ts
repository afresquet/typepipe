import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import "dotenv/config";
import { commands } from "./commands";

const commandData = commands.map(command => command.data.toJSON());

const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN!);

(async () => {
	try {
		console.log("Started deploying application (/) commands...");

		await rest.put(
			Routes.applicationGuildCommands(
				process.env.CLIENT_ID!,
				process.env.GUILD_ID!
			),
			{
				body: commandData,
			}
		);

		console.log("Successfully deployed application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();
