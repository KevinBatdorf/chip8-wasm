import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { REGISTERS_ADDRESS, createChip8Engine } from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	globalThis.requestAnimationFrame = (cb) =>
		setTimeout(() => cb(Date.now()), 16) as unknown as number;
	globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
	chip8 = await createChip8Engine(wasmBinary);
});
test("4XNN skips next instruction if VX !== NN", () => {
	chip8.loadROM(
		// biome-ignore format: keep if structure
		new Uint8Array([
			0x6a, 0x12, // 6A12: V[A] = 0x12
			0x4a, 0x13, // 4A13: if V[A] !== 0x13, skip next
			0x6b, 0x99, // 6B99: V[B] = 0x99 (should be skipped)
			0x6b, 0x34, // 6B34: V[B] = 0x34 (should execute)
		]),
	);
	chip8.step(); // V[A] = 0x13
	chip8.step(); // 4A13: should skip next

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x12);
	expect(mem[REGISTERS_ADDRESS + 0xb]).not.toBe(0x99);

	chip8.step();
	// Next instruction should run
	expect(mem[REGISTERS_ADDRESS + 0xb]).toBe(0x34);
});
test("4XNN does not skip if VX === NN", () => {
	chip8.loadROM(
		// biome-ignore format: keep if structure
		new Uint8Array([
			0x6a, 0x12, // 6A12: V[A] = 0x12
			0x4a, 0x12, // 4A12: if V[A] !== 0x12, skip next (should NOT skip)
			0x6b, 0x99, // 6B99: V[B] = 0x99 (should run)
			0x6b, 0x34, // 6B34: V[B] = 0x34 (should overwrite)
		]),
	);

	chip8.step(); // V[A] = 0x12
	chip8.step(); // 4A12: V[A] === 0x12 → no skip
	chip8.step(); // 6B99 should run

	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x12);
	expect(mem[REGISTERS_ADDRESS + 0xb]).toBe(0x99);

	chip8.step(); // 6B34 should overwrite
	expect(mem[REGISTERS_ADDRESS + 0xb]).toBe(0x34);
});
