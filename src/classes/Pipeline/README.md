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

Adds an error handler that will be run if any of the piped functions fail.

By default there's no error handler and any errors will be thrown.

If this method is called more than once, the newest one will override the last one.

This method should be called before piping any functions that you want to handle errors for.

```ts
const pipeline = new Pipeline()
	.catch((error, context, global) => console.log(error)) // Will log Syntax Error
	.pipe((value, context, global) => value + 1)
	.pipe((value, context, global) => value.bad_parameter) // Will throw error
	.pipe((value, context, global) => [value]);

const pipeline2 = new Pipeline()
	.catch((error, context, global) => console.log("Error Handler 1"))
	.tap((value, context, global) => {
		if (value > 10) throw new Error("Value is too high");
	})
	.catch((error, context, global) => console.log("Error Handler 2"))
	.tap((value, context, global) => {
		if (value < 5) throw new Error("Value is too low");
	});

pipeline2.run(15, context, global); // Returns nothing | Console log: Error Handler 1
pipeline2.run(1, context, global); // Returns nothing | Console log: Error Handler 2
pipeline2.run(7, context, global); // Returns 7
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

There are methods for all the [steps](../../steps) available, their implementation is exactly the same, and the function that the steps would return is added to the pipeline.

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

See [assert](../../steps)

### ifelse

See [ifelse](../../steps)

### match

See [match](../../steps)

### pairwise

See [pairwise](../../steps)

### tap

See [tap](../../steps)
