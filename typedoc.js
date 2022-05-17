module.exports = {
	name: "TypePipe",
	entryPoints: ["./src/index.ts", "./src/types/types.ts"],
	externalPattern: ["./src/types/types.ts"],
	out: "docs",
	excludePrivate: true,
};
