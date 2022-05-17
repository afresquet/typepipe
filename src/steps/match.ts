import Match from "../classes/Match";
import type { TypePipe } from "../types/TypePipe";
import type { IsAsync } from "../types/types";

/**
 * Creates a function that will run the given callback
 * with a `Match` object passed as the argument,
 * that will have it's method `run` be called with the received arguments.
 *
 * It will return the value that the `Match` object returns,
 * if it's a `Promise` TypeScript will infer it.
 *
 * @example
 * ```ts
 * const fn = match(m =>
 * 	m
 * 		.on(
 * 			(value, context, global) => value > 5,
 * 			(value, context, global) => value / 2
 * 		)
 * 		.on(
 * 			(value, context, global) => value < 5,
 * 			(value, context, global) => value * 2
 * 		)
 * );
 *
 * fn(20, context, global); // 10
 * fn(2, context, global); // 4
 *
 * const asyncFn = match(m =>
 * 	m
 * 		.on(
 * 			(value, context, global) => value > 5,
 * 			async (value, context, global) => value / 2
 * 		)
 * 		.on(
 * 			(value, context, global) => value < 5,
 * 			(value, context, global) => value * 2
 * 		)
 * );
 *
 * asyncFn(20, context, global); // Promise => 10
 * asyncFn(2, context, global); // Promise => 4
 * ```
 */
export function match<
	Value,
	Result,
	Context,
	Global,
	Async,
	Expected = Awaited<Result>
>(
	matchFn: TypePipe.MatchFunction<
		Value,
		Result,
		Context,
		Global,
		Async,
		Expected
	>
): TypePipe.Function<Value, IsAsync<Result, Async, true>, Context, Global> {
	const composition = matchFn(new Match<Value, Context, Global, Expected>());

	return composition.compose();
}
