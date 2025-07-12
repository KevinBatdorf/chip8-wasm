import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { REGISTERS_OFFSET, createChip8Engine } from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});

test("5XY0 skips next instruction if VX === VY", () => {
	chip8.loadROM(
		// biome-ignore format: keep if structure
		new Uint8Array([
			0x6a, 0x12, // 6A12: V[A] = 0x12
			0x6b, 0x12, // 6B12: V[B] = 0x12
			0x5a, 0xb0, // 5AB0: if V[A] === V[B], skip next
			0x6c, 0x99, // 6C99: V[C] = 0x99 (should be skipped)
			0x6c, 0x34, // 6C34: V[C] = 0x34 (should execute)
		]),
	);
	chip8.step(); // V[A] = 0x12
	chip8.step(); // V[B] = 0x12
	chip8.step(); // 5AB0: should skip next
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_OFFSET + 0xc]).not.toBe(0x99);

	chip8.step();
	expect(mem[REGISTERS_OFFSET + 0xc]).toBe(0x34);
});

test("5XY0 does not skip next instruction if VX !== VY", () => {
	chip8.loadROM(
		// biome-ignore format: keep if structure
		new Uint8Array([
			0x6a, 0x12, // 6A12: V[A] = 0x12
			0x6b, 0x34, // 6B34: V[B] = 0x34
			0x5a, 0xb0, // 5AB0: if V[A] === V[B], skip next (should not skip)
			0x6c, 0x99, // 6C99: V[C] = 0x99 (should execute)
			0x6c, 0x34, // 6C34: V[C] = 0x34 (should be overwritten)
		]),
	);
	chip8.step(); // V[A] = 0x12
	chip8.step(); // V[B] = 0x34
	chip8.step(); // 5AB0: does not skip
	chip8.step(); // 6C99: executes
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_OFFSET + 0xc]).toBe(0x99);
});
