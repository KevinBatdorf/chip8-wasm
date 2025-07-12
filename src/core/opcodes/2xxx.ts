import {
	DISPLAY_OFFSET,
	PC_OFFSET,
	ROM_LOAD_ADDRESS,
	STACK_OFFSET,
	STACK_PTR_OFFSET,
} from "../constants";
import { fn, i32, if_, local, misc } from "../wasm";

// Execute subroutine starting at address NNN
export const two = new Uint8Array([
	// params: high byte of opcode, low byte of opcode
	...local.declare("i32"), // NNN
	...local.get(0), // high
	...i32.const(8),
	...i32.shl(),
	...local.get(1), // low
	...i32.or(), // combine high and low bytes into opcode
	...i32.const(0x0fff), // mask to get the address
	...i32.and(),
	...local.tee(2), // store NNN in local 2

	// Are we out of bounds?
	...i32.const(ROM_LOAD_ADDRESS),
	...i32.lt_u(), // check if NNN < ROM_LOAD_ADDRESS
	...if_.start(),
	...misc.unreachable(),
	...fn.end(),
	...local.get(2), // NNN
	...i32.const(DISPLAY_OFFSET - 2), // max safe address
	...i32.gt_u(),
	...if_.start(),
	...misc.unreachable(),
	...fn.end(),

	// Add PC to the stack
	...i32.const(STACK_PTR_OFFSET),
	...i32.load8_u(), // load stack pointer
	...i32.const(STACK_OFFSET), // base address of stack
	...i32.add(),
	...i32.const(PC_OFFSET),
	...i32.load16_u(), // load current PC
	...i32.store16(), // store current PC at stack pointer

	// Increment stack pointer
	...i32.const(STACK_PTR_OFFSET),
	...i32.const(STACK_PTR_OFFSET),
	...i32.load8_u(),
	...i32.const(2), // each stack entry is 2 bytes
	...i32.add(),
	...i32.store8(),

	// Move PC to NNN
	...i32.const(PC_OFFSET),
	...local.get(2),
	...i32.store16(),
	...fn.end(),
]);
