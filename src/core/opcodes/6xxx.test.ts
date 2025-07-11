import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { createChip8Engine } from "../..";
import { REGISTERS_OFFSET } from "../../core/constants";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});

test("6xNN sets Vx to NN", () => {
	chip8.loadROM(new Uint8Array([0x6a, 0x12, 0x6b, 0x34]));
	chip8.step();

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_OFFSET + 0xa]).toBe(0x12);
	expect(mem[REGISTERS_OFFSET + 0xb]).not.toBe(0x34);
	chip8.step();
	expect(mem[REGISTERS_OFFSET + 0xa]).toBe(0x12);
	expect(mem[REGISTERS_OFFSET + 0xb]).toBe(0x34);
});
