# Match

Stores conditions and callbacks to execute with the given values.

## Methods

- [on](#on)
- [otherwise](#otherwise)
- [compose](#compose)
- [run](#run)

### on

Adds a condition and a callback that will be run if the condition matches.

```ts
const match = new Match()
	.on(
		(value, context, global) => value > 5,
		(value, context, global) => value / 2
	)
	.on(
		(value, context, global) => value < 5,
		(value, context, global) => value * 2
	);
```

### otherwise

Adds a callback that will be called if no conditions match.

```ts
const match = new Match()
	.on(
		(value, context, global) => value > 5,
		(value, context, global) => value / 2
	)
	.otherwise((value, context, global) => value * 2);
```

### compose

Creates a function that will run all the conditions with the given values and will return the result of the called callback.

If any of the conditions or callbacks returns a `Promise`, the returned value will be wrapped in a `Promise`.

```ts
const fn = new Match()
	.on(
		(value, context, global) => value > 5,
		(value, context, global) => value / 2
	)
	.on(
		(value, context, global) => value < 5,
		(value, context, global) => value * 2
	)
	.otherwise((value, context, global) => 0)
	.compose();

fn(20, context, global); // 10
fn(2, context, global); // 4
fn(5, context, global); // 0

const asyncFn = new Match()
	.on(
		(value, context, global) => value > 5,
		async (value, context, global) => value / 2
	)
	.on(
		async (value, context, global) => value < 5,
		(value, context, global) => value * 2
	)
	.otherwise((value, context, global) => 0)
	.compose();

asyncFn(20, context, global); // Promise => 10
asyncFn(2, context, global); // Promise => 4
asyncFn(5, context, global); // Promise => 0
```

### run

The exact same as [Match.compose](#compose), but calls the composed function instead of returning it.

```ts
const match = new Match()
	.on(
		(value, context, global) => value > 5,
		(value, context, global) => value / 2
	)
	.on(
		(value, context, global) => value < 5,
		(value, context, global) => value * 2
	)
	.otherwise((value, context, global) => 0);

match.run(20, context, global); // 10
match.run(2, context, global); // 4
match.run(5, context, global); // 0

const asyncMatch = new Match()
	.on(
		(value, context, global) => value > 5,
		async (value, context, global) => value / 2
	)
	.on(
		async (value, context, global) => value < 5,
		(value, context, global) => value * 2
	)
	.otherwise((value, context, global) => 0);

asyncMatch.run(20, context, global); // Promise => 10
asyncMatch.run(2, context, global); // Promise => 4
asyncMatch.run(5, context, global); // Promise => 0
```
