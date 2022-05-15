import Match from "../classes/Match";
import type { TypePipe } from "../types/TypePipe";
import type { IsAsync } from "../types/types";

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
