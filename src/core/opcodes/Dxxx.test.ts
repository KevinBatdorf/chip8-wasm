import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import {
	DISPLAY_ADDRESS,
	FONT_ADDRESS,
	REGISTERS_ADDRESS,
	createChip8Engine,
} from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});
test("DXYN draws the built-in font for digit A at position (0, 0)", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
            0x60, 0x00, // V0 = 0 (X)
            0x61, 0x00, // V1 = 0 (Y)
            0x6A, 0x0A, // VA = 0xA (digit)
            0xFA, 0x29, // I = address of sprite for digit in VA
            0xD0, 0x05, // draw sprite at (V0, V1), 5 bytes tall
        ]),
	);

	chip8.step(); // V0 = 0
	chip8.step(); // V1 = 0
	chip8.step(); // VA = 0x0A
	chip8.step(); // FX29 → I = FONT_ADDRESS + 5 * VA
	chip8.step(); // DXYN

	const mem = new Uint8Array(chip8.getMemory().buffer);
	const fontAddr = FONT_ADDRESS + 5 * 0x0a;
	for (let i = 0; i < 5; i++) {
		expect(mem[DISPLAY_ADDRESS + i * 8]).toBe(mem[fontAddr + i]);
	}
});
test("DXYN draws unaligned sprite with X=3 causing byte overflow", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x60, 0x06, // V0 = 6 (X)
			0x61, 0x00, // V1 = 0 (Y)
			0x6A, 0x00, // VA = 0x00 (digit 0)
			0xFA, 0x29, // I = FONT_ADDRESS + 5 * 0
			0xD0, 0x15, // draw sprite at (6, 0)
		]),
	);

	chip8.step(); // V0
	chip8.step(); // V1
	chip8.step(); // VA
	chip8.step(); // FX29
	chip8.step(); // DXYN
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[DISPLAY_ADDRESS + 0]).toBe(0x03);
	expect(mem[DISPLAY_ADDRESS + 1]).toBe(0xc0);
});

test("DXYN sets VF = 1 when pixels are unset (collision)", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x60, 0x00, // V0 = 0 (X)
			0x61, 0x00, // V1 = 0 (Y)
			0x6A, 0x00, // VA = 0 (digit 0)
			0xFA, 0x29, // I = font addr for 0
			0xD0, 0x05, // draw 0 at (0, 0)

			0x6A, 0x01, // VA = 1 (digit 1)
			0xFA, 0x29, // I = font addr for 1
			0xD0, 0x05, // draw 1 at (0, 0)
		]),
	);

	for (let i = 0; i < 8; i++) chip8.step();

	const mem = new Uint8Array(chip8.getMemory().buffer);
	const VF = mem[0xf + REGISTERS_ADDRESS];
	expect(VF).toBe(1);
});

test("DXYN sets VF = 0 when no pixels are unset (no collision)", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x60, 0x00, // V0 = 0
			0x61, 0x00, // V1 = 0
			0x6A, 0x02, // VA = 2 (digit 2)
			0xFA, 0x29, // I = sprite for 2
			0xD0, 0x15, // draw 2 at (0, 0)

			0x61, 0x05, // V1 = 5 (move Y to avoid overlap)
			0x6A, 0x01, // VA = 1
			0xFA, 0x29, // I = sprite for 1
			0xD0, 0x15, // draw 1 at (0, 5)
		]),
	);

	for (let i = 0; i < 10; i++) chip8.step();

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(0); // VF should be 0 — no collision
});

test("DXYN sets VF = 1 when collision occurs in overflow byte", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x60, 0x03, // V0 = 3
			0x61, 0x00, // V1 = 0
			0x6A, 0x00, // VA = 0
			0xFA, 0x29, // I = sprite for 0
			0xD0, 0x05, // draw 0 at (3, 0)

			0x6A, 0x01, // VA = 1
			0xFA, 0x29, // I = sprite for 1
			0xD0, 0x05, // draw 1 at (3, 0)
		]),
	);

	for (let i = 0; i < 8; i++) chip8.step();

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(1);
});
