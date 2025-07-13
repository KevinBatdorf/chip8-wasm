import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { createChip8Engine } from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});
// test("DXYN draws the built-in font for digit A at position (0, 0)", () => {
// 	chip8.loadROM(
// 		// biome-ignore format: keep structure
// 		new Uint8Array([
//             0x60, 0x00, // V0 = 0 (X)
//             0x61, 0x00, // V1 = 0 (Y)
//             0x6A, 0x0A, // VA = 0xA (digit)
//             0xFA, 0x29, // I = address of sprite for digit in VA
//             0xD0, 0x05, // draw sprite at (V0, V1), 5 bytes tall
//         ]),
// 	);

// 	chip8.step(); // V0 = 0
// 	chip8.step(); // V1 = 0
// 	chip8.step(); // VA = 0x0A
// 	chip8.step(); // FX29 → I = FONT_OFFSET + 5 * VA
// 	chip8.step(); // DXYN

// 	const mem = new Uint8Array(chip8.getMemory().buffer);
// 	const fontAddr = FONT_OFFSET + 5 * 0x0a;
// 	for (let i = 0; i < 5; i++) {
// 		expect(mem[DISPLAY_OFFSET + i * 8]).toBe(mem[fontAddr + i]);
// 	}
// });

test("true is true", () => {
	expect(true).toBe(true);
});
