import { writeFileSync } from "node:fs";
import { generate } from "../wasm/chip8";

writeFileSync("public/chip8.wasm", generate());
