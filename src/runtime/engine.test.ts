import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { createChip8Engine } from "..";
import {
	DELAY_TIMER_OFFSET,
	DISPLAY_OFFSET,
	I_OFFSET,
	PC_OFFSET,
	REGISTERS_OFFSET,
	ROM_LOAD_ADDRESS,
	SOUND_TIMER_OFFSET,
	STACK_PTR_OFFSET,
} from "../core/constants";

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

test("init clears memory and sets state", () => {
	const mem = new Uint8Array(chip8.getMemory().buffer);
	mem.fill(0xff); // Fill with garbage data

	chip8.reset();

	// Test that cleared regions are zero
	for (let i = ROM_LOAD_ADDRESS; i < DISPLAY_OFFSET; i++) {
		expect(mem[i]).toBe(0);
	}

	// Test PC is set correctly
	const pc = mem[PC_OFFSET] | (mem[PC_OFFSET + 1] << 8);
	expect(pc).toBe(ROM_LOAD_ADDRESS);

	// Test SP and timers
	expect(mem[STACK_PTR_OFFSET]).toBe(0);
	expect(mem[DELAY_TIMER_OFFSET]).toBe(0);
	expect(mem[SOUND_TIMER_OFFSET]).toBe(0);

	// Test I register
	const i = mem[I_OFFSET] | (mem[I_OFFSET + 1] << 8);
	expect(i).toBe(0);

	// Test general-purpose registers
	for (let i = 0; i < 16; i++) {
		expect(mem[REGISTERS_OFFSET + i]).toBe(0);
	}
});
