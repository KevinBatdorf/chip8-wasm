import { execSync } from "node:child_process";
import fs from "node:fs";

// dummy content for now
const bytes = new Uint8Array([
	0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 1, 3, 2, 1, 0, 1,
]);

fs.writeFileSync("debug.wasm", bytes);
execSync("wasm2wat debug.wasm -o debug.wat");
