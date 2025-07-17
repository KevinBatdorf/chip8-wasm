import { readFileSync } from "node:fs";
import { beforeEach, expect, test } from "vitest";
import { createChip8Engine } from "../..";
import { REGISTERS_ADDRESS } from "../../core/constants";

let chip8: Awaited<ReturnType<typeof createChip8Engine>>;
const wasmBinary = readFileSync("public/chip8.wasm");

beforeEach(async () => {
	chip8 = await createChip8Engine(wasmBinary);
});

test("8XY0 sets VX = VY", () => {
	chip8.loadROM(new Uint8Array([0x6a, 0x12, 0x6b, 0x34, 0x8a, 0xb0]));
	chip8.step(); // 6A 12
	chip8.step(); // 6B 34
	chip8.step(); // 8A B0
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x34);
});

test("8XY1 sets VX = VX OR VY", () => {
	chip8.loadROM(new Uint8Array([0x6a, 0xf0, 0x6b, 0x0f, 0x8a, 0xb1]));
	chip8.step();
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0xff);
});

test("8XY2 sets VX = VX AND VY", () => {
	chip8.loadROM(new Uint8Array([0x6a, 0xf0, 0x6b, 0x0f, 0x8a, 0xb2]));
	chip8.step();
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x00);
});

test("8XY3 sets VX = VX XOR VY", () => {
	chip8.loadROM(new Uint8Array([0x6a, 0xff, 0x6b, 0x0f, 0x8a, 0xb3]));
	chip8.step();
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0xf0);
});

test("8XY4 adds VY to VX and sets VF = carry", () => {
	chip8.loadROM(new Uint8Array([0x6a, 0xf0, 0x6b, 0x20, 0x8a, 0xb4]));
	chip8.step();
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x10);
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(1);
});

test("8XY5 subtracts VY from VX and sets VF = NOT borrow", () => {
	chip8.loadROM(new Uint8Array([0x6a, 0x30, 0x6b, 0x10, 0x8a, 0xb5]));
	chip8.step();
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x20);
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(1);
});

test("8XY6 sets VX = VY >> 1 and stores LSB of VY in VF", () => {
	chip8.loadROM(new Uint8Array([0x6b, 0x07, 0x8a, 0xb6]));
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x03);
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(1);
});

test("8XY7 sets VX = VY - VX and VF = NOT borrow", () => {
	chip8.loadROM(new Uint8Array([0x6a, 0x10, 0x6b, 0x30, 0x8a, 0xb7]));
	chip8.step();
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x20);
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(1);
});

test("8XYE shifts VX left and stores MSB in VF", () => {
	chip8.loadROM(new Uint8Array([0x6a, 0x81, 0x8a, 0xae]));
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x02);
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(1);
});
