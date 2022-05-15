export type IsPromise<T> = T extends PromiseLike<unknown> ? true : false;

export type Persist<T, U> = T extends true ? T : U;

export type IsAsync<T, U, B = false> = B extends true
	? U extends true
		? Promise<T>
		: T
	: U extends PromiseLike<unknown>
	? Promise<T>
	: T;

export type ExtendsNever<T, U, V> = [T] extends [never] ? U : V;

export type Infer<T> = T extends PromiseLike<infer U>
	? U | Promise<U>
	: T | Promise<T>;
