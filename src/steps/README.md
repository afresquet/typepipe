# Steps

Steps return functions with extra functionality.

- [assert](#assert)
- [ifelse](#ifelse)
- [match](#match)
- [pairwise](#pairwise)
- [tap](#tap)

## assert

Creates a function that will assert that the given value is not `undefined` or `null`.

If the value is `undefined` or `null`, it will throw the result of calling the given callback.

If it's not, it will return the value it received.

```ts
const fn = assert((value, context, global) => new Error("no value"));

fn(1, context, global); // 1
fn(undefined, context, global); // Error: no value
fn(null, context, global); // Error: no value
```

## ifelse

Creates a function that will call a `condition` callback, if it returns `true` it will run the `then` callback, if it returns `false` it will run the `otherwise` callback.

Returns the value of either `then` or `otherwise` callbacks, depending on which one was called.

If any of the three callbacks it receives returns a `Promise`, the returned value will be wrapped in a `Promise`.

```ts
const fn = ifelse(
	(value, context, global) => value > 5,
	(value, context, global) => value / 2,
	(value, context, global) => value * 2
);

fn(20, context, global); // 10
fn(2, context, global); // 4

const asyncFn = ifelse(
	async (value, context, global) => value > 5,
	(value, context, global) => value / 2,
	(value, context, global) => value * 2
);

asyncFn(20, context, global); // Promise => 10
asyncFn(2, context, global); // Promise => 4
```

## match

Creates a function that will run the given callback with a [Match](../classes/Match/README.md#match) object passed as the argument, that will have it's method `run` be called with the received arguments.

It will return the value that the [Match](../classes/Match/README.md#match) object returns, if it's a `Promise` TypeScript will infer it.

```ts
const fn = match(m =>
	m
		.on(
			(value, context, global) => value > 5,
			(value, context, global) => value / 2
		)
		.on(
			(value, context, global) => value < 5,
			(value, context, global) => value * 2
		)
);

fn(20, context, global); // 10
fn(2, context, global); // 4

const asyncFn = match(m =>
	m
		.on(
			(value, context, global) => value > 5,
			async (value, context, global) => value / 2
		)
		.on(
			(value, context, global) => value < 5,
			(value, context, global) => value * 2
		)
);

asyncFn(20, context, global); // Promise => 10
asyncFn(2, context, global); // Promise => 4
```

## pairwise

Creates a function that will run the given callback function with the arguments it receives.

It will return an `array` with the value it received as the first element, and the value returned from the callback function as the second element.

If the callback returns a `Promise`, the returned `array` will be wrapped in a `Promise`.

```ts
const fn = pairwise((value, context, global) => value + 1);

fn(1, context, global); // [1, 2]

const asyncFn = pairwise(async x => x + 1);

asyncFn(1, context, global); // Promise => [1, 2]
```

## tap

Creates a function that will run the given callback function with the arguments it receives.

The return value of the callback function will be ignored, and the function will return the value it received.

If the callback returns a `Promise`, the returned value will be wrapped in a `Promise`.

```ts
const fn = tap((value, context, global) => value + 1);

fn(1, context, global); // 1

const asyncFn = tap(async x => x + 1);

asyncFn(1, context, global); // Promise => 1
```
