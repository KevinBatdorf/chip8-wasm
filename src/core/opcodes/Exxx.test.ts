import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { REGISTERS_ADDRESS, createChip8Engine } from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});

test("EX9E skips next instruction if key in VX is pressed", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x60, 0x02, // 6002: V0 = 0x02
			0xe0, 0x9e, // E09E: skip if key[V0] is pressed
			0x61, 0x33, // 6133: V1 = 0x33 (should be skipped)
		]),
	);

	// Set key 2 to pressed
	chip8.setKey(0x2, true);

	chip8.step(); // V0 = 2
	chip8.step(); // Should skip next
	chip8.step(); // Execute whatever's next

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0x1]).toBe(0x00); // V1 should not be set
});

test("EXA1 skips next instruction if key in VX is NOT pressed", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x60, 0x03, // 6003: V0 = 0x03
			0xe0, 0xa1, // E0A1: skip if key[V0] is NOT pressed
			0x61, 0x44, // 6144: V1 = 0x44 (should be skipped)
		]),
	);

	// Key 3 is NOT pressed (default state)

	chip8.step(); // V0 = 3
	chip8.step(); // Should skip next
	chip8.step(); // Execute whatever's next

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0x1]).toBe(0x00); // V1 should not be set
});

test("EX9E does not skip if key not pressed", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x60, 0x01, // 6001: V0 = 0x01
			0xe0, 0x9e, // E09E: skip if key[V0] is pressed
			0x61, 0x77, // 6177: V1 = 0x77 (should run)
		]),
	);

	chip8.step(); // V0 = 1
	chip8.step(); // Should not skip
	chip8.step(); // Execute V1 = 0x77

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0x1]).toBe(0x77); // V1 should be set
});

test("EXA1 does not skip if key IS pressed", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x60, 0x04, // 6004: V0 = 0x04
			0xe0, 0xa1, // E0A1: skip if key[V0] is NOT pressed
			0x61, 0x88, // 6188: V1 = 0x88 (should run)
		]),
	);

	chip8.setKey(0x4, true); // key is pressed

	chip8.step(); // V0 = 4
	chip8.step(); // Should not skip
	chip8.step(); // V1 = 0x88

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0x1]).toBe(0x88); // V1 should be set
});
