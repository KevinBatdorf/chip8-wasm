import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import {
	PC_ADDRESS,
	STACK_ADDRESS,
	STACK_PTR_ADDRESS,
	createChip8Engine,
} from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	globalThis.requestAnimationFrame = (cb) =>
		setTimeout(() => cb(Date.now()), 16) as unknown as number;
	globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
	chip8 = await createChip8Engine(wasmBinary);
});

test("2NNN calls subroutine at NNN", () => {
	chip8.loadROM(new Uint8Array([0x22, 0x00]));
	chip8.step();

	const mem = new Uint8Array(chip8.getMemory().buffer);
	const pc = mem[PC_ADDRESS] | (mem[PC_ADDRESS + 1] << 8);
	expect(pc).toBe(0x200);

	// Check return address pushed to stack (PC + 2 = 0x202)
	const sp = mem[STACK_PTR_ADDRESS];
	const retAddr = STACK_ADDRESS + sp - 2;
	const ret = mem[retAddr] | (mem[retAddr + 1] << 8);
	expect(ret).toBe(0x202);
});

test("2NNN call out of bounds traps", () => {
	chip8.loadROM(new Uint8Array([0x21, 0x0]));
	expect(chip8.getError()).toBeNull(); // No error yet
	chip8.step();
	expect(chip8.getError()).not.toBeNull(); // Now we should have an error
});
