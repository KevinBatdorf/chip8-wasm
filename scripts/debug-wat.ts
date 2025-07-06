import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { generate } from "../wasm/chip8";

writeFileSync("debug.wasm", generate());
execSync("wasm2wat debug.wasm -o debug.wat");
