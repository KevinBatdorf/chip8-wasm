import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { createChip8Engine } from "..";
import { ROM_LOAD_ADDRESS } from "../core/constants";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");
beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});

test(`loads ROM into memory at ${ROM_LOAD_ADDRESS}`, () => {
	const rom = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]);
	chip8.loadROM(rom);

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[ROM_LOAD_ADDRESS]).toBe(0xaa);
	expect(mem[ROM_LOAD_ADDRESS + 1]).toBe(0xbb);
	expect(mem[ROM_LOAD_ADDRESS + 2]).toBe(0xcc);
	expect(mem[ROM_LOAD_ADDRESS + 3]).toBe(0xdd);
});
