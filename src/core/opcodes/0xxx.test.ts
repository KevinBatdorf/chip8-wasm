import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { DISPLAY_ADDRESS, PC_ADDRESS, createChip8Engine } from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});
test("0NNN is ignored (no-op)", () => {
	chip8.loadROM(new Uint8Array([0x01, 0x23, 0x02, 0x34]));
	chip8.step();
	// PC should just move to the next instruction
	const mem = new Uint8Array(chip8.getMemory().buffer);
	const pc = mem[PC_ADDRESS] | (mem[PC_ADDRESS + 1] << 8);
	expect(pc).toBe(0x202);
});

test("00EE returns from subroutine", () => {
	// biome-ignore format: keep structure
	const rom = new Uint8Array([
		0x23, 0x00, // Call subroutine at 0x300
		...new Uint8Array(0x300 - 0x202).fill(0), // Fill up to 0x300
		0x00, 0xEE, // Return from subroutine
	]);
	chip8.loadROM(rom);
	chip8.step(); // Call 0x300
	expect(chip8.getDebug().getPC()).toBe(0x300);
	chip8.step(); // Execute 00EE
	expect(chip8.getDebug().getPC()).toBe(0x202);
});

// TODO: update this test after adding display support
test("00E0 clears the display", () => {
	const rom = new Uint8Array([0x00, 0xe0]);
	chip8.loadROM(rom);

	// Fill display with dummy data before stepping
	const mem = new Uint8Array(chip8.getMemory().buffer);
	mem.fill(0xff, DISPLAY_ADDRESS, DISPLAY_ADDRESS + 256);

	chip8.step();

	for (let i = 0; i < 256; i++) {
		expect(mem[DISPLAY_ADDRESS + i]).toBe(0);
	}
});
