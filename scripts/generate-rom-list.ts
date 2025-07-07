import { readdir, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROMS_DIR = "public/roms";
const OUTPUT_FILE = "src/roms-manifest.json";

const getRoms = async (dir: string): Promise<Record<string, string[]>> => {
	const result: Record<string, string[]> = {};
	const categories = await readdir(dir, { withFileTypes: true });

	for (const cat of categories) {
		if (!cat.isDirectory()) continue;
		const path = join(dir, cat.name);
		const files = await readdir(path);
		result[cat.name] = files.filter((f) => extname(f) === ".ch8");
	}
	return result;
};

const manifest = await getRoms(ROMS_DIR);
await writeFile(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
console.log("✅ ROM manifest written to", OUTPUT_FILE);
