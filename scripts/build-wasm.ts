import { writeFileSync } from "node:fs";
import { generate } from "../src/wasm/chip8";

writeFileSync("public/chip8.wasm", generate());
