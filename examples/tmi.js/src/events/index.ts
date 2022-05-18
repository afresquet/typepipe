import { Event } from "../types/Event";
import { cheer } from "./cheer/cheer";
import { connected } from "./connected/connected";
import { counter } from "./message/counter";
import { ping } from "./message/ping";
import { subscription } from "./subscription/subscription";

export const events: Event<any>[] = [
	connected,
	ping,
	counter,
	subscription,
	cheer,
];
