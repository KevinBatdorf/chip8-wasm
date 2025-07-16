import { DISPLAY_OFFSET, I_OFFSET, REGISTERS_OFFSET } from "../constants";
import { block, fn, i32, if_, local, loop } from "../wasm";

// DXYN: Draw sprite at coordinate (VX, VY) with N bytes of sprite data
// Set VF to 1 if any pixels are flipped, 0 otherwise
// biome-ignore format: keep if structure
const drawSprite = new Uint8Array([
	...i32.const(I_OFFSET),
	...i32.load16_u(), // Load I from memory
	...local.get(6), // row (loop counter)
	...i32.add(),
	...i32.load8_u(), // Load font at address I
	...local.set(9),

	...i32.const(DISPLAY_OFFSET),
	// Find the Y byte to print at
	...local.get(3), // Y
	...local.get(6), // row (loop counter)
	...i32.add(),
	...i32.const(8), // 8 bytes per row
	...i32.mul(),
	...i32.add(),
	// Find the X byte to print at
	...local.get(2), // X
	...i32.const(3),
	...i32.shr_u(), // X >> 3
	...i32.add(), // row * 8 + (X >> 3)
	...local.tee(10), // byte index

	...local.get(10), // load again to xor
	...i32.load8_u(), // Load the current byte at (X, Y)
	...local.tee(11), // store previous display byte
	...local.get(9), // sprite byte
	// calculate X offset
	...local.get(2), // X
	...i32.const(7),
	...i32.and(),
	...i32.shr_u(), // shift right to get the X offset
	...local.tee(12), // store next display byte
	...i32.xor(),
	...i32.store8(),

	// was there a collision?
	...local.get(11), // previous display byte
	...local.get(12), // next display byte
    ...i32.and(), // check if both previous and next are 0
    ...i32.const(0),
    ...i32.ne(),
    ...local.set(7), // store collision flag

	// Handle byte overflow
	...local.get(10), // byte index
	...i32.const(1),
	...i32.add(), // byte index + 1
	...local.get(10), // byte index again to XOR
	...i32.const(1),
	...i32.add(), // byte index + 1
	...i32.load8_u(), // Load the next byte at (X + 1, Y)
	...local.tee(11), // store sibling display byte
	...local.get(9), // sprite byte
	...i32.const(8),
	...local.get(2), // X
	...i32.const(7),
	...i32.and(), // X & 0x07
	...i32.sub(), // byte index - (X & 0x07)
	...i32.shl(), // shift left to get the bit offset
	...local.tee(12), // store next (sibling) display byte
	...i32.xor(),
	...i32.store8(),

    // Check collision again if still 0
    ...local.get(7), // collision flag
    ...i32.eqz(),
    ...if_.start(),
        ...local.get(11), // previous display byte
        ...local.get(12), // next display byte
        ...i32.and(), // check if both previous and next are 0
        ...i32.const(0),
        ...i32.ne(),
        ...local.set(7), // store collision flag
    ...if_.end(),
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
        // 8: y row
        // 9: sprite byte
        // 10: display byte index
        // 11: previous display byte
        // 12: next display byte
        ...local.declare(
            "i32", "i32", "i32", "i32", "i32", "i32",
            "i32", "i32", "i32", "i32", "i32", "i32"
        ),
        ...i32.const(REGISTERS_OFFSET),
        ...local.get(0), // high byte of opcode
        ...i32.const(0x0f),
        ...i32.and(), // isolate the second nibble (0x0X)
        ...i32.add(),
        ...i32.load8_u(),
        ...i32.const(63), // constrain to 0-63
        ...i32.and(),
        ...local.set(2), // X

        ...i32.const(REGISTERS_OFFSET),
        ...local.get(1), // low byte of opcode
        ...i32.const(4),
		...i32.shr_u(), // extract the first nibble of low byte
		...i32.add(),
        ...i32.load8_u(),
        ...i32.const(31), // constrain to 0-31
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
