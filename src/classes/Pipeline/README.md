# Pipeline

Pipes functions with the given value, context, and global context.

## Methods

- [pipe](#pipe)
- [context](#context)
- [catch](#catch)
- [compose](#compose)
- [run](#run)
- [Steps](#steps)
  - [assert](#assert)
  - [ifelse](#ifelse)
  - [match](#match)
  - [pairwise](#pairwise)
  - [tap](#tap)

### pipe

Adds a function to the pipeline, the value returned will be passed to the next piped function.

```ts
const pipeline = new Pipeline()
	.pipe((value, context, global) => value + 1)
	.pipe((value, context, global) => value.toString())
	.pipe((value, context, global) => [value]);
```

### context

Changes the context passed to the following functions of the pipeline.

```ts
const pipeline = new Pipeline()
	.pipe((value, context, global) => value + 1) // context = "original context"
	.context((value, context, global) => context.split(" ")[1])
	.pipe((value, context, global) => context); // context = "context"
```

### catch

Adds an optional error handler that will be run if any of the piped functions fail.

By default there's no error handler and any errors will be thrown.

If this method is called more than once, the newest one will override the last one.

```ts
const pipeline = new Pipeline()
	.pipe((value, context, global) => value + 1)
	.pipe((value, context, global) => value.bad_parameter) // Will throw error
	.pipe((value, context, global) => [value])
	.catch((error, context, global) => console.log(error)); // Will log Syntax Error
```

### compose

Creates a function that will run all the piped functions in order.

The first function will receive the given values, the subsequent functions will receive the value returned from the previous function and the contexts.

If any of the functions returns a Promise, the returned value will be wrapped in a Promise.

```ts
const fn = new Pipeline()
	.pipe((value, context, global) => value + 1)
	.pipe((value, context, global) => value.toString())
	.pipe((value, context, global) => [value])
	.compose();

fn(1, context, global); // ["2"]
fn(5, context, global); // ["6"]

const asyncFn = new Pipeline()
	.pipe((value, context, global) => value + 1)
	.pipe(async (value, context, global) => value.toString())
	.pipe((value, context, global) => [value])
	.compose();

asyncFn(1, context, global); // Promise => ["2"]
asyncFn(5, context, global); // Promise => ["6"]
```

### run

The exact same as [Pipeline.compose](#compose), but calls the function instead of returning it.

```ts
const pipeline = new Pipeline()
	.pipe((value, context, global) => value + 1)
	.pipe((value, context, global) => value.toString())
	.pipe((value, context, global) => [value]);

pipeline.run(1, context, global); // ["2"]
pipeline.run(5, context, global); // ["6"]

const asyncPipeline = new Pipeline()
	.pipe((value, context, global) => value + 1)
	.pipe(async (value, context, global) => value.toString())
	.pipe((value, context, global) => [value]);

asyncPipeline.run(1, context, global); // Promise => ["2"]
asyncPipeline.run(5, context, global); // Promise => ["6"]
```

## Steps

There are methods for all the [steps](../../steps/README.md#steps) available, their implementation is exactly the same, and the function that the steps would return is added to the pipeline.

```ts
const pipeline = new Pipeline()
	.pipe((value, context, global) => value + 1)
	.tap((value, context, global) => {
		console.log("hello from tap step");
	})
	.ifelse(
		(value, context, global) => value > 5,
		(value, context, global) => value / 2,
		(value, context, global) => value * 2
	)
	.assert((value, context, global) => new Error("No value"))
	.match(match =>
		match
			.on(
				(value, context, global) => value > 5,
				(value, context, global) => value / 2
			)
			.on(
				(value, context, global) => value < 5,
				(value, context, global) => value * 2
			)
	)
	.pairwise((value, context, global) => value + context.amount);
```

### assert

See [assert](../../steps/README.md#assert).

### ifelse

See [ifelse](../../steps/README.md#ifelse).

### match

See [match](../../steps/README.md#match).

### pairwise

See [pairwise](../../steps/README.md#pairwise).

### tap

See [tap](../../steps/README.md#tap).