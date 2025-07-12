import {
	DELAY_TIMER_OFFSET,
	DISPLAY_OFFSET,
	FX0A_VX_OFFSET,
	I_OFFSET,
	KEY_BUFFER_OFFSET,
	PC_OFFSET,
	REGISTERS_OFFSET,
	ROM_LOAD_ADDRESS,
	SOUND_TIMER_OFFSET,
	STACK_OFFSET,
	STACK_PTR_OFFSET,
} from "./constants";
import { fn, i32, if_, local, memory } from "./wasm";

export const init = new Uint8Array([
	...local.declare(),

	// Clear rom
	...i32.const(ROM_LOAD_ADDRESS),
	...i32.const(0),
	...i32.const(DISPLAY_OFFSET - ROM_LOAD_ADDRESS),
	...memory.fill(),

	// Clear display
	...i32.const(DISPLAY_OFFSET),
	...i32.const(0),
	...i32.const(STACK_OFFSET - DISPLAY_OFFSET), // usually 64×32 = 2048 bytes
	...memory.fill(),

	// Clear key buffer
	...i32.const(KEY_BUFFER_OFFSET),
	...i32.const(0),
	...i32.const(16), // 16 bytes for key buffer
	...memory.fill(),

	// Clear stack
	...i32.const(STACK_OFFSET),
	...i32.const(0),
	...i32.const(32), // 32 bytes for stack (16 entries of 2 bytes each)
	...memory.fill(),

	// Clear registers
	...i32.const(REGISTERS_OFFSET),
	...i32.const(0),
	...i32.const(16), // 16 bytes for registers
	...memory.fill(),

	// Set PC
	...i32.const(PC_OFFSET),
	...i32.const(ROM_LOAD_ADDRESS),
	...i32.store16(),

	// Set SP
	...i32.const(STACK_PTR_OFFSET),
	...i32.const(0),
	...i32.store8(),

	// Set timers
	...i32.const(DELAY_TIMER_OFFSET),
	...i32.const(0),
	...i32.store8(),
	...i32.const(SOUND_TIMER_OFFSET),
	...i32.const(0),
	...i32.store8(),

	// Set I = 0
	...i32.const(I_OFFSET),
	...i32.const(0),
	...i32.store16(),

	// Set FX0A_VX_OFFSET to 0
	...i32.const(FX0A_VX_OFFSET),
	...i32.const(0),
	...i32.store8(),

	...fn.end(),
]);

export const tick = new Uint8Array([
	...local.declare("i32", "i32", "i32"), // PC, high byte, low byte

	// Load PC
	...i32.const(PC_OFFSET),
	...i32.load16_u(),
	...local.set(0),

	...local.get(0), // PC
	...i32.load8_u(), // load high byte
	...local.set(1), // store high byte in local 1

	...local.get(0), // PC again
	...i32.const(1),
	...i32.add(),
	...i32.load8_u(), // load low byte
	...local.set(2), // store low byte in local 2

	// increment PC
	...i32.const(PC_OFFSET),
	...local.get(0),
	...i32.const(2),
	...i32.add(),
	...i32.store16(),

	// function params
	...local.get(1), // high
	...local.get(2), // low

	// Call the opcode handler
	...local.get(1),
	...i32.const(4),
	...i32.shr_u(), // extract the first nibble of high byte
	...fn.call_indirect(0), // hard coded to 0, since we only have one function type

	...fn.end(),
]);

// biome-ignore format: keep if structure
export const updateTimers = new Uint8Array([
	...local.declare(),
	// Delay timer
	...i32.const(DELAY_TIMER_OFFSET),
	...i32.load8_u(), // load delay timer value
	...i32.const(0),
    ...i32.gt_u(), // is it greater than 0?
    ...if_.start(),
        ...i32.const(DELAY_TIMER_OFFSET),
        ...i32.const(DELAY_TIMER_OFFSET),
        ...i32.load8_u(), // load delay timer value again
        ...i32.const(1),
        ...i32.sub(), // decrement delay timer
        ...i32.store8(),
    ...if_.end(),

    // Sound timer
    ...i32.const(SOUND_TIMER_OFFSET),
    ...i32.load8_u(), // load sound timer value
    ...i32.const(0),
    ...i32.gt_u(), // is it greater than 0?
    ...if_.start(),
        ...i32.const(SOUND_TIMER_OFFSET),
        ...i32.const(SOUND_TIMER_OFFSET),
        ...i32.load8_u(), // load sound timer value again
        ...i32.const(1),
        ...i32.sub(), // decrement sound timer
        ...i32.store8(),
    ...if_.end(),

	...fn.end(),
]);
