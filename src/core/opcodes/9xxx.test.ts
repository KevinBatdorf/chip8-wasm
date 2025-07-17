import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { REGISTERS_ADDRESS, createChip8Engine } from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});
test("9XY0 skips next instruction if VX !== VY", () => {
	chip8.loadROM(
		// biome-ignore format: keep if structure
		new Uint8Array([
			0x6a, 0x12, // 6A12: V[A] = 0x12
			0x6b, 0x34, // 6B34: V[B] = 0x34
			0x9a, 0xb0, // 9AB0: if V[A] !== V[B], skip next
			0x6c, 0x99, // 6C99: V[C] = 0x99 (should be skipped)
			0x6c, 0x01, // 6C01: V[C] = 0x01 (should run)
		]),
	);

	chip8.step(); // V[A] = 0x12
	chip8.step(); // V[B] = 0x34
	chip8.step(); // 9AB0: V[A] !== V[B] → skip next

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xc]).not.toBe(0x99);

	chip8.step(); // 6C01
	expect(mem[REGISTERS_ADDRESS + 0xc]).toBe(0x01);
});

test("9XY0 does not skip if VX === VY", () => {
	chip8.loadROM(
		// biome-ignore format: keep if structure
		new Uint8Array([
			0x6a, 0x12, // 6A12: V[A] = 0x12
			0x6b, 0x12, // 6B12: V[B] = 0x12
			0x9a, 0xb0, // 9AB0: if V[A] !== V[B], skip next (should NOT skip)
			0x6c, 0x99, // 6C99: V[C] = 0x99 (should run)
			0x6c, 0x01, // 6C01: V[C] = 0x01 (should overwrite)
		]),
	);

	chip8.step(); // V[A] = 0x12
	chip8.step(); // V[B] = 0x12
	chip8.step(); // 9AB0: V[A] === V[B] → no skip
	chip8.step(); // 6C99

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xc]).toBe(0x99);

	chip8.step(); // 6C01 should overwrite
	expect(mem[REGISTERS_ADDRESS + 0xc]).toBe(0x01);
});
