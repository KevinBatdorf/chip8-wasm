import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { createChip8Engine } from "../..";
import { PC_ADDRESS } from "../../core/constants";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	globalThis.requestAnimationFrame = (cb) =>
		setTimeout(() => cb(Date.now()), 16) as unknown as number;
	globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
	chip8 = await createChip8Engine(wasmBinary);
});

test("BNNN jumps to NNN + V0", () => {
	chip8.loadROM(new Uint8Array([0x60, 0x01, 0xb3, 0x00]));
	chip8.step();
	chip8.step();

	const mem = new Uint8Array(chip8.getMemory().buffer);
	const pc = mem[PC_ADDRESS] | (mem[PC_ADDRESS + 1] << 8);
	expect(pc).toBe(0x301);
});

test("BNNN jumps out of bounds and traps (edge)", () => {
	chip8.loadROM(new Uint8Array([0x60, 0x01, 0xbf, 0xff]));
	chip8.step();
	expect(chip8.getError()).toBeNull(); // No error yet
	chip8.step(); // This should cause an out-of-bounds error
	expect(chip8.getError()).not.toBeNull(); // Now we should have an error
});

test("BNNN jumps out of bounds and traps (near end)", () => {
	chip8.loadROM(new Uint8Array([0x60, 0x05, 0xbf, 0xfc]));
	chip8.step();
	expect(chip8.getError()).toBeNull(); // No error yet
	chip8.step(); // This should cause an out-of-bounds error
	expect(chip8.getError()).not.toBeNull(); // Now we should have an error
});
