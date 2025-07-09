import {
	DELAY_TIMER_OFFSET,
	DISPLAY_OFFSET,
	I_OFFSET,
	KEY_BUFFER_OFFSET,
	PC_OFFSET,
	REGISTERS_OFFSET,
	ROM_LOAD_ADDRESS,
	SOUND_TIMER_OFFSET,
	STACK_OFFSET,
	STACK_PTR_OFFSET,
} from "./constants";
import { fn, i32, local, memory, misc } from "./helpers";

export const init = new Uint8Array([
	...local.declare(),
	// Clear rom and display
	...i32.const(ROM_LOAD_ADDRESS),
	...i32.const(0),
	...i32.const(DISPLAY_OFFSET - ROM_LOAD_ADDRESS),
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

	...fn.end(),
]);

export const tick = new Uint8Array([
	...local.declare("i32", "i32"), // PC, opcode

	// Load PC
	...i32.const(PC_OFFSET),
	...i32.load16_u(),
	...local.set(0),

	// Load opcode
	...local.get(0), // PC
	...i32.load8_u(), // load high byte
	...i32.const(8),
	...i32.shl(), // shift left 8 bits
	...local.get(0), // PC again
	...i32.const(1),
	...i32.add(),
	...i32.load8_u(), // load low byte
	...i32.or(), // combine into full opcode
	...local.set(1), // store opcode in local 1

	// increment PC
	...i32.const(PC_OFFSET),
	...local.get(0),
	...i32.const(2),
	...i32.add(),
	...i32.store16(),

	// Call the opcode handler
	...local.get(1), // get it to pass in
	...local.get(1),
	...i32.const(12),
	...i32.shr_u(), // extract the first nibble
	...fn.call_indirect(0), // hard coded to 0, since we only have one function type

	...fn.end(),
]);

export const updateTimers = new Uint8Array([
	...local.declare(),
	...misc.nop(),
	...fn.end(),
]);
