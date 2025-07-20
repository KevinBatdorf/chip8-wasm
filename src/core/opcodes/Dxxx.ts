import {
	DRAW_HAPPENED_ADDRESS,
	FRAME_BUFFER_ADDRESS,
	I_ADDRESS,
	QUIRK_CLIPPING_ADDRESS,
	QUIRK_DISPLAY_WAIT_ADDRESS,
	REGISTERS_ADDRESS,
} from "../constants";
import { block, fn, i32, if_, local, loop, misc, valType } from "../wasm";

// DXYN: Draw sprite at coordinate (VX, VY) with N bytes of sprite data
// Set VF to 1 if any pixels are flipped, 0 otherwise
// biome-ignore format: keep if structure
const drawSprite = new Uint8Array([
	...i32.const(I_ADDRESS),
	...i32.load16_u(), // Load I from memory
	...local.get(6), // row (loop counter)
	...i32.add(),
	...i32.load8_u(), // Load font at address I
	...local.set(8),

	...i32.const(FRAME_BUFFER_ADDRESS),
	// Find the Y byte to print at
    ...i32.const(QUIRK_CLIPPING_ADDRESS),
    ...i32.load8_u(),
    ...if_.start(valType("i32")),
        ...local.get(3), // Y
        ...local.get(6), // row (loop counter)
        ...i32.add(),
    ...if_.else(),
        ...local.get(3), // Y
        ...local.get(6), // row (loop counter)
        ...i32.add(),
        ...i32.const(32), // 32 rows in total
        ...i32.rem_u(), // Y % 32
    ...if_.end(),
	...i32.const(8), // 8 bytes per row
	...i32.mul(),
	...i32.add(),
	// Find the X byte to print at
	...local.get(2), // X
	...i32.const(3),
	...i32.shr_u(), // X >> 3
    ...local.tee(12), // store byte column index
	...i32.add(), // row * 8 + (X >> 3)
	...local.tee(9), // byte index

	...local.get(9), // load again to xor
	...i32.load8_u(), // Load the current byte at (X, Y)
	...local.tee(10), // store previous display byte
	...local.get(8), // sprite byte
	// calculate X offset
	...local.get(2), // X
	...i32.const(7),
	...i32.and(),
	...i32.shr_u(), // shift right to get the X offset
	...local.tee(11), // store next display byte
	...i32.xor(),
	...i32.store8(),

	// was there a collision?
	...local.get(10), // previous display byte
	...local.get(11), // next display byte
    ...i32.and(), // check if both previous and next are 0
    ...i32.const(0),
    ...i32.ne(),
    ...local.set(7), // store collision flag

    // If X is byte aligned, we can stop here
    ...local.get(2), // X
    ...i32.const(7),
    ...i32.and(), // X & 0x07
    ...i32.eqz(),
    ...if_.start(),
        ...loop.br(1),
    ...if_.end(),

	// Handle byte overflow
    ...local.get(12), // byte column index
	...i32.const(1),
	...i32.add(), // byte index + 1
    ...i32.const(7),
    ...i32.and(), // check if we are wrapping around
    ...i32.eqz(),
    ...if_.start(valType("i32")),
        ...i32.const(QUIRK_CLIPPING_ADDRESS),
        ...i32.load8_u(),
        ...if_.start(valType("i32")),
            ...i32.const(0),
            ...loop.br(2), // If clipping, return early
        ...if_.else(),
            // If not clipping, wrap around
            ...local.get(9),
            ...i32.const(7),
            ...i32.const(-1),
            ...i32.xor(), // ~7
            ...i32.and(), // row base
            ...i32.const(1),
            ...i32.sub(), // since we are overflow, move back 1
        ...if_.end(),
    ...if_.else(),
        // If not at the edge, then use the next index
        ...local.get(9), // byte index
        ...i32.const(1),
        ...i32.add(), // byte index + 1
    ...if_.end(),
	...local.get(9), // byte index again to XOR
	...i32.const(1),
	...i32.add(), // byte index + 1
	...i32.load8_u(), // Load the next byte at (X + 1, Y)
	...local.tee(10), // store sibling display byte
	...local.get(8), // sprite byte
	...i32.const(8),
	...local.get(2), // X
	...i32.const(7),
	...i32.and(), // X & 0x07
	...i32.sub(), // byte index - (X & 0x07)
	...i32.shl(), // shift left to get the bit offset
	...local.tee(11), // store next (sibling) display byte
	...i32.xor(),
	...i32.store8(),

    // Check collision again if still 0
    ...local.get(7), // collision flag
    ...i32.eqz(),
    ...if_.start(),
        ...local.get(10), // previous display byte
        ...local.get(11), // next display byte
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
        // 8: sprite byte
        // 9: display byte index
        // 10: previous display byte
        // 11: next display byte
        // 12: byte column index
        ...local.declare(
            "i32", "i32", "i32", "i32", "i32", "i32",
            "i32", "i32", "i32", "i32", "i32", "i32"
        ),

        // If quirk is enabled break out of the loop later
        ...i32.const(QUIRK_DISPLAY_WAIT_ADDRESS),
        ...i32.load8_u(),
        ...if_.start(),
            ...i32.const(DRAW_HAPPENED_ADDRESS),
            ...i32.const(1),
            ...i32.store8(), // Set draw happened flag
        ...if_.end(),

        ...i32.const(REGISTERS_ADDRESS),
        ...local.get(0), // high byte of opcode
        ...i32.const(0x0f),
        ...i32.and(), // isolate the second nibble (0x0X)
        ...i32.add(),
        ...i32.load8_u(),
        ...i32.const(63), // constrain to 0-63
        ...i32.and(),
        ...local.set(2), // X

        ...i32.const(REGISTERS_ADDRESS),
        ...local.get(1), // low byte of opcode
        ...i32.const(4),
		...i32.shr_u(), // extract the first nibble of low byte
		...i32.add(),
        ...i32.load8_u(),
        ...i32.const(31), // constrain to 0-31
        ...i32.and(),
        ...local.set(3), // Y

        ...i32.const(I_ADDRESS),
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
                // break if at the end of the loop
                ...local.get(6), // row
                ...local.get(5), // N
                ...i32.eq(),
                ...loop.br_if(1), // row === N

                ...block.start(),
                    ...drawSprite,
                ...block.end(),

                ...local.get(6), // row
                ...i32.const(1),
                ...i32.add(),
                ...local.set(6), // row + 1
                ...loop.br(0), // continue loop
            ...loop.end(),
        ...block.end(),

        ...i32.const(REGISTERS_ADDRESS + 0xf), // VF
        ...local.get(7), // collision
        ...i32.store8(),

        ...fn.end(),
    ]);
