import Match from "../classes/Match";
import { TypePipe } from "../types/TypePipe";
import { IsAsync } from "../types/types";

export function match<
	Value,
	Result,
	Context,
	Global,
	Async,
	Expected = Awaited<Result>
>(
	matchFn: (
		m: TypePipe.Match<Value, Context, Global, Expected>
	) => TypePipe.Match<Value, Context, Global, Result, Async>
): TypePipe.Function<Value, IsAsync<Result, Async, true>, Context, Global> {
	const composition = matchFn(new Match<Value, Context, Global, Expected>());

	return composition.compose();
}
