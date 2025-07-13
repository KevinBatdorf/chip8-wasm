import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { REGISTERS_OFFSET, createChip8Engine } from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});
test("CXNN sets VX to random & NN", () => {
	chip8.loadROM(new Uint8Array([0x60, 0xff, 0xc0, 0x0f]));

	chip8.step(); // V0 = 0xFF
	chip8.step(); // V0 = rand() & 0x0F

	const value = new Uint8Array(chip8.getMemory().buffer)[
		REGISTERS_OFFSET + 0x0
	];

	expect(value).toBeGreaterThanOrEqual(0);
	expect(value).toBeLessThanOrEqual(0x0f);
	expect(value).not.toBe(0xff);
});
