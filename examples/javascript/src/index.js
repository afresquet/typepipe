//@ts-check

const { Pipeline } = require("typepipe");
const assert = require("node:assert");

/** @type { import("typepipe").Pipeline<number, { foo: number }, { bar: number }> } */
const pipeline = new Pipeline();

/** @type { import("./types/TypedFunction").TypedFunction<number, number> } */
const add = (a, b, c) => a + b.foo + c.bar;

const result = pipeline
	.pipe(add)
	.context(value => [value])
	.pipe((value, context) => value + context[0])
	.ifelse(
		(value, context) => value > context[0],
		() => "good",
		() => "bad"
	)
	.run(1, { foo: 2 }, { bar: 3 });

assert.equal(result, "good");

const TypedPipeline = require("./classes/TypedPipeline");

/** @type { import("./types/TypedFunction").TypedFunction<string, string> } */
const upperCase = value => value.toUpperCase();

const fn = new TypedPipeline()
	.pipe(upperCase)
	.pairwise(() => "!!!")
	.pipe(values => values.join(""))
	.compose();

assert.equal(
	fn("It works", { foo: "typed" }, { bar: "pipeline" }),
	"IT WORKS!!!"
);
