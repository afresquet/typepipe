/**
 * Returns a `boolean` of whether `T` is a `Promise` or not.
 * @example
 * ```typescript
 * type A = IsPromise<Promise<{}>>; // true
 * type B = IsPromise<{}>; // false
 * ```
 */
export type IsPromise<T> = T extends PromiseLike<unknown> ? true : false;

/**
 * Persists `T` if it's `true`, otherwise returns `U`.
 * @example
 * ```typescript
 * type A = Persist<false, false>; // false
 * type B = Persist<false, true>; // true
 * type C = Persist<true, false>; // true
 * ```
 */
export type Persist<T, U extends boolean> = T extends true ? T : U;

/**
 * Returns `Promise<T>` if `U` is truthy, otherwise returns `T`.
 *
 * `U` can be a `Promise`, or a `boolean` if `B` is `true`.
 * @example
 * ```typescript
 * type A = IsAsync<string, Promise<{}>>; // Promise<string>
 * type B = IsAsync<string, {}>; // string
 * type C = IsAsync<string, true, true>; // Promise<string>
 * type D = IsAsync<string, false, true>; // string
 * ```
 */
export type IsAsync<T, U, B = false> = B extends true
	? U extends true
		? Promise<T>
		: T
	: U extends PromiseLike<unknown>
	? Promise<T>
	: T;

/**
 * Checks if `T` extends `never`, if `true` it returns `U`, otherwise it returns `V`.
 * @example
 * ```typescript
 * type A = ExtendsNever<never, string, number>; // string
 * type B = ExtendsNever<{}, string, number>; // number
 * ```
 */
export type ExtendsNever<T, U, V> = [T] extends [never] ? U : V;

/**
 * If it's a `Promise` it returns a union of its resolved value and itself.
 *
 * Otherwise it returns a union of itself and a `Promise` of itself.
 * @example
 * ```typescript
 * type A = Infer<string>; // string | Promise<string>
 * type B = Infer<Promise<string>>; // string | Promise<string>
 */
export type Infer<T> = T extends PromiseLike<infer U>
	? U | Promise<U>
	: T | Promise<T>;
