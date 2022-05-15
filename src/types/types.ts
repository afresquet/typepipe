export type IsPromise<T> = T extends PromiseLike<unknown> ? true : false;

export type IsPromiseOR<T, U> = T extends PromiseLike<unknown>
	? true
	: U extends PromiseLike<unknown>
	? true
	: false;

export type Persist<T, U> = T extends true ? T : U;

export type IsAsync<T, U, B = false> = B extends true
	? U extends true
		? Promise<T>
		: T
	: U extends PromiseLike<unknown>
	? Promise<T>
	: T;

export type ExtendsNever<T, U, V> = [T] extends [never] ? U : V;
