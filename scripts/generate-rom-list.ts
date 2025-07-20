import {
	copyFile,
	mkdir,
	readdir,
	readFile,
	writeFile,
} from "node:fs/promises";
import { extname, join } from "node:path";
import type { RomEntry, RomOptions } from "../src/types";

const OUTPUT_FILE = "src/roms-manifest.json";
const ROMS_DIR = "public/roms/roms";
const ARCHIVE_JSON = "./chip8Archive/programs.json";
const AUTHORS_JSON = "./chip8Archive/authors.json";
const ARCHIVE_ROMS = "./chip8Archive/roms";

type ArchiveRomJson = Record<
	string,
	{
		title?: string;
		authors?: string[];
		images?: string[];
		desc?: string;
		event?: string;
		release?: string;
		platform?: "chip8" | "schip" | "xochip";
		options?: RomOptions;
	}
>;
type AuthorJson = Record<
	string,
	{
		email?: string;
		url?: string;
	}
>;
const getTestRoms = async (): Promise<RomEntry[]> => {
	const files = await readdir("public/roms/tests");
	return files
		.filter((file) => extname(file) === ".ch8")
		.map((file) => ({
			name: file
				.replace(/\[.*?\]/g, "")
				.replaceAll("-", " ")
				.replace(/^\d+/, "")
				.replace(".ch8", "")
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ")
				.trim(),
			path: join("roms/tests", file),
		}));
};

const getArchiveRoms = async (): Promise<RomEntry[]> => {
	const [romsJson, authorsJsonRaw] = await Promise.all([
		readFile(ARCHIVE_JSON, "utf8"),
		readFile(AUTHORS_JSON, "utf8"),
	]);
	const data = JSON.parse(romsJson) as ArchiveRomJson;
	const authorsJson: AuthorJson = JSON.parse(authorsJsonRaw);
	await mkdir(ROMS_DIR, { recursive: true });

	const entries = Object.entries(data)
		.filter(([, v]) => v.platform === "chip8")
		.map(([key, v]) => ({ key, entry: v }));

	await Promise.all(
		entries.map(async ({ key }) => {
			const src = join(ARCHIVE_ROMS, `${key}.ch8`);
			const dest = join(ROMS_DIR, `${key}.ch8`);
			await copyFile(src, dest);
		}),
	);

	return entries.map(({ key, entry }) => ({
		name: entry.title ?? key,
		path: join("roms/roms", `${key}.ch8`),
		description: entry.desc,
		authors: entry.authors?.map((name: string) => ({
			name,
			...authorsJson[name],
		})),
		releaseDate: entry.release,
		event: entry.event,
		platform: entry.platform,
		options: entry.options,
	}));
};

const manifest = {
	tests: await getTestRoms(),
	roms: (await getArchiveRoms()).sort((a, b) => {
		const aDate = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
		const bDate = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
		return bDate - aDate; // descending (newest first)
	}),
};
await writeFile(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
console.log("✅ ROM manifest written to", OUTPUT_FILE);
