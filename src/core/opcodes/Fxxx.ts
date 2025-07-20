import {
	DELAY_TIMER_ADDRESS,
	FONT_ADDRESS,
	FX0A_VX_ADDRESS,
	I_ADDRESS,
	QUIRK_MEMORY_ADDRESS,
	REGISTERS_ADDRESS,
	SOUND_TIMER_ADDRESS,
} from "../constants";
import { block, fn, i32, if_, local, loop } from "../wasm";

// Delay timer = VX
const putVXinDelayTimer = [
	...i32.const(DELAY_TIMER_ADDRESS),
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.const(REGISTERS_ADDRESS),
	...i32.add(), // address of VX
	...i32.load8_u(), // load VX value
	...i32.store8(), // store VX value into delay timer
	...fn.return(),
];

// VX = delay timer
const putDelayTimerInVX = [
	...i32.const(REGISTERS_ADDRESS),
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(),
	...i32.add(), // address of VX
	...i32.const(DELAY_TIMER_ADDRESS),
	...i32.load8_u(), // load delay timer value
	...i32.store8(), // store delay timer value into VX
	...fn.return(),
];

// sound timer = VX
const putVXInSoundTimer = [
	...i32.const(SOUND_TIMER_ADDRESS),
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.const(REGISTERS_ADDRESS),
	...i32.add(), // address of VX
	...i32.load8_u(), // load VX value
	...i32.store8(), // store VX value into sound timer
	...fn.return(),
];

// FX0A: Wait for key press, store in VX
const putVXInKeyWait = [
	...i32.const(FX0A_VX_ADDRESS),
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.const(0xf0),
	...i32.or(), // sentinel value to indicate waiting for key press
	...i32.store8(), // JS will watch for this
	...fn.return(),
];

// FX1E: Add VX to I
const addVXToI = [
	...i32.const(I_ADDRESS),
	...i32.const(I_ADDRESS),
	...i32.load16_u(), // load current I
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.const(REGISTERS_ADDRESS),
	...i32.add(), // address of VX
	...i32.load8_u(), // load VX value
	...i32.add(), // add VX value to I
	...i32.store16(), // store new I value
	...fn.return(),
];

// FX29: Set I to sprite address for digit in VX
const putVXFontInI = [
	...i32.const(I_ADDRESS),
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.const(REGISTERS_ADDRESS),
	...i32.add(), // address of VX
	...i32.load8_u(), // load VX value
	...i32.const(5),
	...i32.mul(),
	...i32.const(FONT_ADDRESS),
	...i32.add(), // address of font sprite
	...i32.store16(), // store new I value
	...fn.return(),
];

// FX33: Store BCD of VX at I, I+1, I+2
const BCDInI = [
	// 100s place
	...i32.const(I_ADDRESS),
	...i32.load16_u(), // load current I
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.const(REGISTERS_ADDRESS),
	...i32.add(), // address of VX
	...i32.load8_u(), // load VX value
	...local.tee(2), // store VX value in local scratch
	...i32.const(100),
	...i32.div_u(), // get hundreds place
	...i32.store8(), // store hundreds place at I

	// 10s place
	...i32.const(I_ADDRESS),
	...i32.load16_u(), // load current I
	...i32.const(1),
	...i32.add(), // I + 1
	...local.get(2), // get VX value from local scratch
	...i32.const(100),
	...i32.rem_u(), // get remainder after hundreds place
	...i32.const(10),
	...i32.div_u(), // get tens place
	...i32.store8(), // store tens place at I+1

	// 1s place
	...i32.const(I_ADDRESS),
	...i32.load16_u(), // load current I
	...i32.const(2),
	...i32.add(), // I + 2
	...local.get(2), // get VX value from local scratch
	...i32.const(100),
	...i32.rem_u(), // get remainder after hundreds place
	...i32.const(10),
	...i32.rem_u(), // get ones place
	...i32.store8(), // store ones place at I+2

	...fn.return(),
];

// FX55: Store V0 to VX in memory starting at I
// biome-ignore format: keep if structure
const storeV0ToVXInMemory = [
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
    ...local.set(2), // store second nibble in local scratch
    ...i32.const(0),
    ...local.set(3), // loop counter
    ...block.start(),
        ...loop.start(),
            ...local.get(3), // loop counter
            ...local.get(2), // second nibble (X)
            ...i32.gt_u(),
            ...loop.br_if(1), // if loop counter >= second nibble, exit loop

            ...i32.const(I_ADDRESS),
            ...i32.load16_u(), // load current I
            ...local.get(3), // loop counter
            ...i32.add(), // address of I + loop counter
            ...i32.const(REGISTERS_ADDRESS),
            ...local.get(3), // loop counter
            ...i32.add(), // address of V0 to VX
            ...i32.load8_u(), // load V0 to VX value
            ...i32.store8(), // store V0 to VX value in memory

            ...local.get(3), // loop counter
            ...i32.const(1),
            ...i32.add(), // increment loop counter
            ...local.set(3), // update loop counter
            ...loop.br(0), // continue loop
        ...loop.end(),
    ...block.end(),
    // I is set to I + X + 1
    ...i32.const(QUIRK_MEMORY_ADDRESS),
    ...i32.load8_u(),
    ...if_.start(),
        ...i32.const(I_ADDRESS),
        ...i32.const(I_ADDRESS),
        ...i32.load16_u(), // load current I
        ...local.get(2), // second nibble (X)
        ...i32.add(), // add X + 1 to I
        ...i32.const(1),
        ...i32.add(), // new I = current I + X + 1
        ...i32.store16(), // store new I value
    ...if_.end(),
	...fn.return(),
];

// FX65: Fill V0 to VX from memory starting at I
// biome-ignore format: keep if structure
const loadV0ToVXFromMemory = [
    ...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
    ...local.set(2), // store second nibble in local scratch
    ...i32.const(0),
    ...local.set(3), // loop counter
    ...block.start(),
        ...loop.start(),
            ...local.get(3), // loop counter
            ...local.get(2), // second nibble (X)
            ...i32.gt_u(),
            ...loop.br_if(1), // if loop counter >= second nibble, exit loop

            ...i32.const(REGISTERS_ADDRESS),
            ...local.get(3), // loop counter
            ...i32.add(), // address of V0 to VX
            ...i32.const(I_ADDRESS),
            ...i32.load16_u(), // load current I
            ...local.get(3), // loop counter
            ...i32.add(), // address of I + loop counter
            ...i32.load8_u(), // load value from memory at I + loop counter
            ...i32.store8(), // store I + loop counter value in V0 to VX

            ...local.get(3), // loop counter
            ...i32.const(1),
            ...i32.add(), // increment loop counter
            ...local.set(3), // update loop counter
            ...loop.br(0), // continue loop
        ...loop.end(),
    ...block.end(),
    // I is set to I + X + 1
    ...i32.const(QUIRK_MEMORY_ADDRESS),
    ...i32.load8_u(),
    ...if_.start(),
        ...i32.const(I_ADDRESS),
        ...i32.const(I_ADDRESS),
        ...i32.load16_u(), // load current I
        ...local.get(2), // second nibble (X)
        ...i32.add(), // add X + 1 to I
        ...i32.const(1),
        ...i32.add(), // new I = current I + X + 1
        ...i32.store16(), // store new I value
    ...if_.end(),
	...fn.return(),
]

// Timers
// biome-ignore format: keep if structure
export const f = () =>
	new Uint8Array([
		// params: high byte of opcode, low byte of opcode
		...local.declare("i32", "i32"), // scratch, scratch

		// Delay timer = VX
		...local.get(1), // low byte
		...i32.const(0x15),
		...i32.eq(),
		...if_.start(),
		    ...putVXinDelayTimer,
		...if_.end(),

		// VX = delay timer
		...local.get(1), // low byte
		...i32.const(0x07),
		...i32.eq(),
		...if_.start(),
		    ...putDelayTimerInVX,
		...if_.end(),

		// sound timer = VX
		...local.get(1), // low byte
		...i32.const(0x18),
		...i32.eq(),
		...if_.start(),
		    ...putVXInSoundTimer,
		...if_.end(),

		// FX0A: Wait for key press, store in VX
		...local.get(1), // low byte
		...i32.const(0x0a),
		...i32.eq(),
		...if_.start(),
		    ...putVXInKeyWait,
		...if_.end(),

		// FX1E: Add VX to I
		...local.get(1), // low byte
		...i32.const(0x1e),
		...i32.eq(),
		...if_.start(),
		    ...addVXToI,
		...if_.end(),

        // FX29: Set I to sprite address for digit in VX
        ...local.get(1), // low byte
        ...i32.const(0x29),
        ...i32.eq(),
        ...if_.start(),
            ...putVXFontInI,
        ...if_.end(),

        // FX33: Store BCD of VX at I, I+1, I+2
        ...local.get(1), // low byte
        ...i32.const(0x33),
        ...i32.eq(),
        ...if_.start(),
            ...BCDInI,
        ...if_.end(),

        // FX55: Store V0 to VX in memory starting at I
        ...local.get(1), // low byte
        ...i32.const(0x55),
        ...i32.eq(),
        ...if_.start(),
            ...storeV0ToVXInMemory,
        ...if_.end(),

        // FX65: Fill V0 to VX from memory starting at I
        ...local.get(1), // low byte
        ...i32.const(0x65),
        ...i32.eq(),
        ...if_.start(),
            ...loadV0ToVXFromMemory,
        ...if_.end(),

		...fn.end(),
	]);
