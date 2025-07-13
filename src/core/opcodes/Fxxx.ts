import {
	DELAY_TIMER_OFFSET,
	FONT_OFFSET,
	FX0A_VX_OFFSET,
	I_OFFSET,
	REGISTERS_OFFSET,
	SOUND_TIMER_OFFSET,
} from "../constants";
import { fn, i32, if_, local } from "../wasm";

// Delay timer = VX
const putVXinDelayTimer = [
	...i32.const(DELAY_TIMER_OFFSET),
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.const(REGISTERS_OFFSET),
	...i32.add(), // address of VX
	...i32.load8_u(), // load VX value
	...i32.store8(), // store VX value into delay timer
	...fn.return(),
];

// VX = delay timer
const putDelayTimerInVX = [
	...i32.const(REGISTERS_OFFSET),
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(),
	...i32.add(), // address of VX
	...i32.const(DELAY_TIMER_OFFSET),
	...i32.load8_u(), // load delay timer value
	...i32.store8(), // store delay timer value into VX
	...fn.return(),
];

// sound timer = VX
const putVXInSoundTimer = [
	...i32.const(SOUND_TIMER_OFFSET),
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.const(REGISTERS_OFFSET),
	...i32.add(), // address of VX
	...i32.load8_u(), // load VX value
	...i32.store8(), // store VX value into sound timer
	...fn.return(),
];

// FX0A: Wait for key press, store in VX
const putVXInKeyWait = [
	...i32.const(FX0A_VX_OFFSET),
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.store8(), // JS will watch for this
	...fn.return(),
];

// FX1E: Add VX to I
const addVXToI = [
	...i32.const(I_OFFSET),
	...i32.const(I_OFFSET),
	...i32.load16_u(), // load current I
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.const(REGISTERS_OFFSET),
	...i32.add(), // address of VX
	...i32.load8_u(), // load VX value
	...i32.add(), // add VX value to I
	...i32.store16(), // store new I value
	...fn.return(),
];

// FX29: Set I to sprite address for digit in VX
const putVXFontInI = [
	...i32.const(I_OFFSET),
	...local.get(0), // high byte of opcode
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)
	...i32.const(REGISTERS_OFFSET),
	...i32.add(), // address of VX
	...i32.load8_u(), // load VX value
	...i32.const(5),
	...i32.mul(),
	...i32.const(FONT_OFFSET),
	...i32.add(), // address of font sprite
	...i32.store16(), // store new I value
	...fn.return(),
];

// Timers
// biome-ignore format: keep if structure
export const f = () =>
	new Uint8Array([
		// params: high byte of opcode, low byte of opcode
		...local.declare(),

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

		...fn.end(),
	]);
