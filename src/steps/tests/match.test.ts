import type { Context, Global } from "../../types/tests";
import type { TypePipe } from "../../types/TypePipe";
import { match } from "../match";

describe("match step", () => {
	const matchFn: (
		m: TypePipe.Match<number, Context, Global>
	) => TypePipe.Match<number, Context, Global, boolean> = jest.fn(m =>
		m.on(
			x => x >= 5,
			() => true
		)
	);

	test("passes a Match to the given function", () => {
		match(matchFn);

		expect(matchFn).toHaveBeenCalled();
	});

	test("returns a pipeline function that executes the Match configured with the given function", () => {
		const result = match(matchFn)(10, { foo: "bar" }, { bar: "foo" });

		expect(result).toBe(true);
	});
});
