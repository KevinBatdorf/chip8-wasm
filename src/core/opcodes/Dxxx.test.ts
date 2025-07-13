import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { DISPLAY_OFFSET, REGISTERS_OFFSET, createChip8Engine } from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});

test("DXYN draws sprite with no collision", () => {
	chip8.loadROM(
		// biome-ignore format: keep if structure
		new Uint8Array([
            0x60, 0x00, // V0 = 0
            0x61, 0x00, // V1 = 0
            0xA0, 0x00, // I = 0x000 (font sprite for 0)
            0xD0, 0x15, // Draw sprite at (V0, V1), height = 5
        ]),
	);

	chip8.step(); // 6000
	chip8.step(); // 6100
	chip8.step(); // A000
	chip8.step(); // D015

	const display = new Uint8Array(
		chip8.getMemory().buffer,
		DISPLAY_OFFSET,
		64 * 32,
	);
	const pixelCount = display.reduce((sum, b) => sum + b, 0);

	expect(pixelCount).toBeGreaterThan(0); // Some pixels should be on
	expect(new Uint8Array(chip8.getMemory().buffer)[REGISTERS_OFFSET + 0xf]).toBe(
		0,
	); // VF = 0 (no collision)
});

test("DXYN sets VF=1 on collision", () => {
	chip8.loadROM(
		// biome-ignore format: keep if structure
		new Uint8Array([
            0x60, 0x00, // V0 = 0
            0x61, 0x00, // V1 = 0
            0xA0, 0x00, // I = 0x000 (font sprite for 0)
            0xD0, 0x15, // Draw sprite
            0xD0, 0x15, // Draw again (collides with itself)
        ]),
	);

	chip8.step(); // 6000
	chip8.step(); // 6100
	chip8.step(); // A000
	chip8.step(); // D015
	chip8.step(); // D015 again (collision)

	const value = new Uint8Array(chip8.getMemory().buffer)[
		REGISTERS_OFFSET + 0xf
	];
	expect(value).toBe(1); // VF = 1
});

test("DXYN wraps around screen edges", () => {
	chip8.loadROM(
		// biome-ignore format: keep if structure
		new Uint8Array([
            0x60, 0x3F, // V0 = 63 (last column)
            0x61, 0x1F, // V1 = 31 (last row)
            0xA0, 0x00, // I = 0x000 (font sprite for 0)
            0xD0, 0x15, // Draw sprite at bottom-right
        ]),
	);

	chip8.step(); // 603F
	chip8.step(); // 611F
	chip8.step(); // A000
	chip8.step(); // D015

	const display = new Uint8Array(
		chip8.getMemory().buffer,
		DISPLAY_OFFSET,
		64 * 32,
	);
	const bottomRow = display.slice(31 * 64, 32 * 64);
	const active = bottomRow.reduce((sum, b) => sum + b, 0);

	expect(active).toBeGreaterThan(0); // Pixels should wrap and be visible
});
