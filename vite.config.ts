import { execSync, spawn } from "node:child_process";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const isCI = !!process.env.CI || process.env.NODE_ENV === "test";
const runBuildWasm = async () => {
	return new Promise<void>((resolve, reject) => {
		const proc = spawn("npm", ["run", "build:wasm"], {
			stdio: "inherit",
			shell: true,
		});
		proc.on("exit", (code) => {
			if (code === 0) resolve();
			else reject(new Error(`build:wasm exited with code ${code}`));
		});
	});
};
// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		{
			name: "watch-wasm-source",
			enforce: "pre",
			async buildStart() {
				if (isCI) return;
				await runBuildWasm();
				execSync("npm run debug:wat", { stdio: "inherit" });
			},
			async handleHotUpdate({ file, server }) {
				if (isCI) return;
				if (
					file.includes("/src/wasm/") ||
					file.includes("/src/core/") ||
					file.includes("/src/runtime/")
				) {
					console.log("🛠️ Rebuilding chip8.wasm...");
					await runBuildWasm();
					execSync("npm run debug:wat", { stdio: "inherit" });
					server.ws.send({ type: "full-reload" });
				}
			},
		},
	],
	test: {
		forceRerunTriggers: [
			"**/package.json/**",
			"**/vitest.config.*/**",
			"**/vite.config.*/**",
			"**/wasm/**",
			"**/runtime/**",
			"**/core/**",
		],
	},
});
