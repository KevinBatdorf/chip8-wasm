import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { createChip8Engine } from "../..";
import { PC_ADDRESS } from "../../core/constants";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});

test("1NNN jumps to address NNN", () => {
	chip8.loadROM(new Uint8Array([0x13, 0x00]));
	chip8.step();

	const mem = new Uint8Array(chip8.getMemory().buffer);
	const pc = mem[PC_ADDRESS] | (mem[PC_ADDRESS + 1] << 8);
	expect(pc).toBe(0x300);
});

test("1NNN jumps out of bounds and traps", () => {
	chip8.loadROM(new Uint8Array([0x1f, 0xff]));
	expect(() => chip8.step()).toThrow();
	chip8.loadROM(new Uint8Array([0x11, 0xff]));
	expect(() => chip8.step()).toThrow();
});
