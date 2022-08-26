import typescript from "@rollup/plugin-typescript";

export default {
	input: "src/index.ts",
	output: {
		dir: "dist",
		format: "es",
	},
	plugins: [typescript()],
	external: [
		"axios",
		"dotenv",
		"global",
		"json2md",
		"pino",
		"redis",
		"os",
		"fs/promises",
		"path",
	],
};
