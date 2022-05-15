export type IsPromise<T> = T extends PromiseLike<unknown> ? true : false;

export type Persist<T, U> = T extends true ? T : U;

export type IsAsync<T, U, B = false> = B extends true
	? U extends true
		? Promise<T>
		: T
	: U extends PromiseLike<unknown>
	? Promise<T>
	: T;
