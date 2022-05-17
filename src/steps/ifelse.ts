import type { TypePipe } from "../types/TypePipe";
import { Infer } from "../types/types";
import { isPromise } from "../utils/isPromise";

export function ifelse<
	Value,
	Condition extends boolean | Promise<boolean>,
	Then,
	Otherwise extends Infer<Then>,
	Context,
	Global
>(
	condition: TypePipe.Function<Value, Condition, Context, Global>,
	then: TypePipe.Function<Value, Then, Context, Global>,
	otherwise: TypePipe.Function<Value, Otherwise, Context, Global>
) {
	return ((...args) => {
		const result = condition(...args);

		if (isPromise(result)) {
			return result.then(b => (b ? then(...args) : otherwise(...args)));
		}

		return result ? then(...args) : otherwise(...args);
	}) as TypePipe.Function<Value, Awaited<Then>, Context, Global>;
}
