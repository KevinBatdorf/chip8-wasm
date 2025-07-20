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

test("8XY6 uses VY = VF as input and stores LSB of VY in VF", () => {
	chip8.loadROM(
		// biome-ignore format: keep structure
		new Uint8Array([
            0x6f, 0x01, // Set VF = 0x01
            0x8a, 0xf6, // Set VA = VF >> 1, store LSB of VF in VF
	    ]),
	);
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x00); // VA = 0x01 >> 1 = 0x00
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(0x01); // VF = LSB of old VF = 1
});

test("8XY6 shift-right, input from VF = 0x02 (even)", () => {
	chip8.loadROM(new Uint8Array([0x6f, 0x02, 0x8a, 0xf6])); // VF = 0x02, VA = VF >> 1
	chip8.step(); // Set VF
	chip8.step(); // Shift
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x01); // 0x02 >> 1 = 0x01
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(0x00); // LSB of 0x02 = 0
});

test("8XY6 shift-right, input from VF = 0x03 (odd)", () => {
	chip8.loadROM(new Uint8Array([0x6f, 0x03, 0x8a, 0xf6])); // VF = 0x03, VA = VF >> 1
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x01);
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(0x01); // LSB of 0x03 = 1
});

test("8XYE shift-left, input from VF = 0x81 (MSB set)", () => {
	chip8.loadROM(new Uint8Array([0x6f, 0x81, 0x8a, 0xfe])); // VF = 0x81, VA = VF << 1
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x02); // 0x81 << 1 = 0x102 -> 0x02
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(0x01); // MSB of 0x81 = 1
});

test("8XYE shift-left, input from VF = 0x41 (MSB not set)", () => {
	chip8.loadROM(new Uint8Array([0x6f, 0x41, 0x8a, 0xfe])); // VF = 0x41, VA = VF << 1
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x82); // 0x41 << 1 = 0x82
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(0x00); // MSB of 0x41 = 0
});

test("8XY6 fails if VF is overwritten too early", () => {
	// biome-ignore format: keep structure
	chip8.loadROM(new Uint8Array([
		0x6F, 0x07, // VF = 0x07
		0x8A, 0xF6, // VA = VF >> 1, VF = LSB of VF
	]));
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x03); // 7 >> 1 = 3
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(0x01); // LSB of original 7 is 1
});

test("8XY6 does not clobber VY when VY is VF", () => {
	// biome-ignore format: keep structure
	chip8.loadROM(new Uint8Array([
		0x6f, 0x3c, // VF = 0x3C (60) - This will also be VY
		0x8a, 0xf6  // VA = VF >> 1 → VA = 0x1E, VF = LSB of VF = 0
	]));
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0xa]).toBe(0x1e); // VA = 60 >> 1 = 30
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(0); // LSB of 0x3C is 0
});

test("8XY6 with VY = VF preserves original value before shift", () => {
	// biome-ignore format: keep structure
	chip8.loadROM(new Uint8Array([
		0x6f, 0x07, // VF = 0x07
		0x83, 0xf6, // V3 = VF >> 1
	]));
	chip8.step();
	chip8.step();
	const mem = new Uint8Array(chip8.getMemory().buffer);
	expect(mem[REGISTERS_ADDRESS + 0x3]).toBe(0x03); // V3 = 0x07 >> 1 = 0x03
	expect(mem[REGISTERS_ADDRESS + 0xf]).toBe(1); // LSB of 0x07 = 1
});
