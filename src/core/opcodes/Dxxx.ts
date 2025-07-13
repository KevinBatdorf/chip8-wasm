import { DISPLAY_OFFSET, I_OFFSET, REGISTERS_OFFSET } from "../constants";
import { block, fn, i32, local, loop } from "../wasm";

// DXYN: Draw sprite at coordinate (VX, VY) with N bytes of sprite data
// Set VF to 1 if any pixels are flipped, 0 otherwise
const drawSprite = new Uint8Array([
	//
]);

// biome-ignore format: keep if structure
export const d = () =>
    new Uint8Array([
        // 2: X
        // 3: Y
        // 4: I
        // 5: N
        // 6: row (loop counter)
        // 7: collision flag
        ...local.declare(
            "i32", "i32", "i32", "i32", "i32", "i32",
        ),
        ...i32.const(REGISTERS_OFFSET),
        ...local.get(0), // high byte of opcode
        ...i32.const(0x0f),
        ...i32.and(), // isolate the second nibble (0x0X)
        ...i32.add(),
        ...i32.load8_u(),
        ...i32.const(0x3f), // ensure X is within 0-63
        ...i32.and(),
        ...local.set(2), // X

        ...i32.const(REGISTERS_OFFSET),
        ...local.get(1), // low byte of opcode
        ...i32.const(0xf0),
        ...i32.and(), // isolate the second nibble (0x0X)
        ...i32.add(),
        ...i32.load8_u(),
        ...i32.const(0x1f), // ensure Y is within 0-31
        ...i32.and(),
        ...local.set(3), // Y

        ...i32.const(I_OFFSET),
        ...i32.load16_u(), // Load I from memory
        ...local.set(4), // I

        ...local.get(1), // low byte
        ...i32.const(0x0f),
        ...i32.and(), // isolate the lower nibble
        ...local.set(5), // N

        ...i32.const(0),
        ...local.set(6), // row

        ...i32.const(0),
        ...local.set(7), // collision flag

        ...block.start(),
            ...loop.start(),
                ...local.get(6), // row
                ...local.get(5), // N
                ...i32.eq(),
                ...loop.br_if(1), // row === N
                ...drawSprite,
                ...local.get(6), // row
                ...i32.const(1),
                ...i32.add(),
                ...local.set(6), // row + 1
                ...loop.br(0), // continue loop
            ...loop.end(),
        ...block.end(),

        ...i32.const(REGISTERS_OFFSET + 0xf), // VF
        ...local.get(7), // collision
        ...i32.store8(),

        ...fn.end(),
    ]);
