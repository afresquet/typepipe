import { Event } from "../types/Event";
import { channelCreate } from "./channelCreate/channelCreate";
import { commands } from "./interactionCreate/commands";
import { ping } from "./messageCreate/ping";
import { ready } from "./ready/ready";

export const events: Event<any>[] = [ready, ping, commands, channelCreate];
