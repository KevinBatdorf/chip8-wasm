import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { createChip8Engine } from "../..";
import { REGISTERS_ADDRESS } from "../../core/constants";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});

test("7xNN wraps on overflow", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
			0x6a, 0xff, // 6A = 0xFF (set V[A] = 255)
			0x7a, 0x02, // 7A += 0x02 → should wrap to 1
		]),
	);
	chip8.step(); // 6A FF
	chip8.step(); // 7A 02
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(1); // 255 + 2 → 257 % 256 = 1
});
