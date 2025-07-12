import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import {
	PC_OFFSET,
	STACK_OFFSET,
	STACK_PTR_OFFSET,
	createChip8Engine,
} from "../..";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});

test("2NNN calls subroutine at NNN", () => {
	chip8.loadROM(new Uint8Array([0x22, 0x00]));
	chip8.step();

	const mem = new Uint8Array(chip8.getMemory().buffer);
	const pc = mem[PC_OFFSET] | (mem[PC_OFFSET + 1] << 8);
	expect(pc).toBe(0x200);

	// Check return address pushed to stack (PC + 2 = 0x202)
	const sp = mem[STACK_PTR_OFFSET];
	const retAddr = STACK_OFFSET + sp - 2;
	const ret = mem[retAddr] | (mem[retAddr + 1] << 8);
	expect(ret).toBe(0x202);
});

test("2NNN call out of bounds traps", () => {
	chip8.loadROM(new Uint8Array([0x2f, 0xff]));
	expect(() => chip8.step()).toThrow();

	chip8.loadROM(new Uint8Array([0x21, 0xff]));
	expect(() => chip8.step()).toThrow();
});
