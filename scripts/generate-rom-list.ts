import { readdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import type { RomEntry } from "../src/types";

// check .com.com

const OUTPUT_FILE = "src/roms-manifest.json";

const getTestRoms = async (): Promise<RomEntry[]> => {
	const result: RomEntry[] = [];

	const files = await readdir("public/roms/tests");
	for (const file of files) {
		if (extname(file) !== ".ch8") continue;
		const name = file
			.replace(/\[.*?\]/g, "")
			.replaceAll("-", " ")
			.replace(/^\d+/, "")
			.replace(".ch8", "")
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
		result.push({
			name,
			path: join("roms/tests", file),
		});
	}
	return result;
};

const manifest = {
	tests: await getTestRoms(),
	roms: [],
};
await writeFile(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
console.log("✅ ROM manifest written to", OUTPUT_FILE);
