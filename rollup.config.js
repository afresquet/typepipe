import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import packageJson from "./package.json";

const isDev = () => !!process.argv.find(arg => arg.includes("--dev"));

export default [
	{
		input: "src/index.ts",
		output: [
			{
				file: packageJson.main,
				format: "cjs",
				sourcemap: isDev(),
			},
			{
				file: packageJson.module,
				format: "es",
				sourcemap: isDev(),
			},
			{
				name: "TypePipe",
				file: packageJson.umd,
				format: "umd",
				sourcemap: isDev(),
			},
		],
		plugins: [typescript(), isDev() ? null : terser()],
	},
];
