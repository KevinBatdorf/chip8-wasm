import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { I_ADDRESS, createChip8Engine } from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	globalThis.requestAnimationFrame = (cb) =>
		setTimeout(() => cb(Date.now()), 16) as unknown as number;
	globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
	chip8 = await createChip8Engine(wasmBinary);
});
test("ANNN sets I to address NNN", () => {
	chip8.loadROM(new Uint8Array([0xa2, 0xf0])); // A2F0: I = 0x2F0
	chip8.step();
	const view = new DataView(chip8.getMemory().buffer);
	expect(view.getUint16(I_ADDRESS, true)).toBe(0x2f0);
});
