export function isPromise(input: any): input is Promise<any> {
	return (
		(typeof Promise !== "undefined" && input instanceof Promise) ||
		(input !== null &&
			typeof input === "object" &&
			typeof input.then === "function" &&
			typeof input.catch === "function")
	);
}
