import "dotenv/config";
import tmi from "tmi.js";
import { events } from "./events";
import { Errors } from "./utils/Errors";

async function main() {
	const client = tmi.client({
		options: { debug: false },
		connection: {
			secure: true,
			reconnect: true,
		},
		identity: {
			username: process.env.BOT_USERNAME,
			password: process.env.BOT_PASSWORD,
		},
		channels: [process.env.CHANNEL],
	});

	for (const event of events) {
		client.on(event.event, async (...args) => {
			try {
				await event.execute(args, args, { client });
			} catch (error) {
				if (error instanceof Errors.Exit) return;

				console.error(error);
			}
		});
	}

	await client.connect();
}

main().catch(console.error);
