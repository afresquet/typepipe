import Discord from "discord.js";
import "dotenv/config";
import { commands } from "./commands";
import { events } from "./events";
import { Command } from "./types/Command";
import { Errors } from "./utils/Errors";

async function main() {
	const client = new Discord.Client({
		restTimeOffset: 0,
		partials: ["MESSAGE", "CHANNEL", "REACTION"],
		intents: [
			Discord.Intents.FLAGS.GUILDS,
			Discord.Intents.FLAGS.GUILD_MEMBERS,
			Discord.Intents.FLAGS.GUILD_MESSAGES,
			Discord.Intents.FLAGS.GUILD_VOICE_STATES,
			Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
			Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		],
	});

	client.commands = new Discord.Collection<string, Command>();
	for (const command of commands) {
		client.commands.set(command.data.name, command);
	}

	for (const event of events) {
		client.on(event.event, async (...args) => {
			try {
				await event.execute(args, args, { Errors });
			} catch (error) {
				if (error instanceof Errors.Exit) return;

				console.error(error);
			}
		});
	}

	await client.login(process.env.BOT_TOKEN);
}

main().catch(console.error);
