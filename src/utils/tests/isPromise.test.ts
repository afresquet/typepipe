import { isPromise } from "../isPromise";

describe("isPromise util", () => {
	test("returns true for a promise", () => {
		expect(isPromise(Promise.resolve())).toBe(true);
	});

	test("returns false for a non-promise", () => {
		expect(isPromise(Promise)).toBe(false);
		expect(isPromise(true)).toBe(false);
		expect(isPromise(null)).toBe(false);
		expect(isPromise(undefined)).toBe(false);
		expect(isPromise(1)).toBe(false);
		expect(isPromise(1.1)).toBe(false);
		expect(isPromise(NaN)).toBe(false);
		expect(isPromise(Infinity)).toBe(false);
		expect(isPromise(Date)).toBe(false);
		expect(isPromise("")).toBe(false);
		expect(isPromise({})).toBe(false);
		expect(isPromise([])).toBe(false);
		expect(isPromise(() => {})).toBe(false);
	});
});
