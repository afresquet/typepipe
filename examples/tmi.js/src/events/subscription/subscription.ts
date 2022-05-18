import { say } from "../../steps/say";
import { Event } from "../../types/Event";
import EventPipeline from "../../types/EventPipeline";

export const subscription: Event<"subscription"> = {
	event: "subscription",
	execute: new EventPipeline<"subscription">()
		.match(match =>
			match
				.on(
					(_, [, , methods]) => methods.plan === "Prime",
					() => "with Twitch Prime"
				)
				.on(
					(_, [, , methods]) => methods.plan === "2000",
					() => "with a Tier 2 sub"
				)
				.on(
					(_, [, , methods]) => methods.plan === "3000",
					() => "with a Tier 3 sub"
				)
		)
		.pipe((tier, [, username]) => `Thanks for subscribing ${tier} ${username}!`)
		.tap(say)
		.compose(),
};
