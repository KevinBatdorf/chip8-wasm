import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import {
	DELAY_TIMER_OFFSET,
	I_OFFSET,
	REGISTERS_OFFSET,
	SOUND_TIMER_OFFSET,
	createChip8Engine,
} from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});

test("FX07 sets VX to the delay timer", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x60, 0x10, // 6010: V0 = 0x10
			0xf0, 0x15, // F015: delay_timer = V0
			0x60, 0x00, // 6000: V0 = 0x00
			0xf0, 0x07, // F007: V0 = delay_timer
		]),
	);
	chip8.step(); // V0 = 0x10
	chip8.step(); // delay_timer = V0
	chip8.step(); // V0 = 0x00
	chip8.step(); // V0 = delay_timer (still 0x10 unless time passed)

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_OFFSET + 0x0]).toBe(0x10);
});

test("FX15 sets the delay timer from VX", () => {
	// VA = 0x20; delay_timer = VA
	chip8.loadROM(new Uint8Array([0x6a, 0x20, 0xfa, 0x15]));
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[DELAY_TIMER_OFFSET]).toBe(0x20);
});

test("FX18 sets the sound timer from VX", () => {
	// VA = 0x30; sound_timer = VA
	chip8.loadROM(new Uint8Array([0x6a, 0x30, 0xfa, 0x18]));
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[SOUND_TIMER_OFFSET]).toBe(0x30);
});

test("FX0A waits for key and sets VX to key index (via setKey)", () => {
	chip8.loadROM(new Uint8Array([0xf1, 0x0a]));

	chip8.step(); // F10A should start waiting
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_OFFSET + 0x1]).toBe(0x00); // V1 still 0

	// Simulate key press through API
	chip8.setKey(0x5, true);

	// Next step should store the key index (0x5) into V1
	chip8.step();
	expect(mem[REGISTERS_OFFSET + 0x1]).toBe(0x5);
});

test("FX1E adds VX to I", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x60, 0x05, // 6005: V0 = 5
			0xA2, 0x00, // A200: I = 0x200
			0xF0, 0x1E, // F01E: I += V0
		]),
	);

	chip8.step(); // V0 = 5
	chip8.step(); // I = 0x200
	chip8.step(); // I += V0 (5)

	const view = new DataView(chip8.getMemory().buffer);
	expect(view.getUint16(I_OFFSET, true)).toBe(0x205);
});

test("FX29 sets I to location of font sprite for digit VX", async () => {
	// biome-ignore format: keep structure
	const rom = new Uint8Array([
		0x60, 0x05, // 6005 => Set V0 = 0x05 (digit 5)
		0xF0, 0x29, // F029 => Set I = location of sprite for V0
	]);
	await chip8.loadROM(rom);
	chip8.step(); // V0 = 0x05
	chip8.step(); // F029 sets I to sprite address for V0
	const debug = chip8.getDebug();

	expect(debug.getI()).toBe(25);
});
