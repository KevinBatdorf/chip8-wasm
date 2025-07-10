import { REGISTERS_OFFSET } from "./constants";
import { fn, i32, local } from "./helpers";

// e.g. VX = NN
export const six = new Uint8Array([
	...local.declare(),
	...local.get(0), // opcode
	...i32.const(8),
	...i32.shr_u(), // shift right to isolate the first byte (0x6X)
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)

	...i32.const(REGISTERS_OFFSET),
	...i32.add(), // we now have the address of VX

	...local.get(0), // opcode again
	...i32.const(0xff),
	...i32.and(), // isolate the last nibble (0xNN)
	...i32.store8(), // store NN into VX
	...fn.end(),
]);

// e.g. VX += NN
export const seven = new Uint8Array([
	...local.declare("i32"), // address of VX
	...local.get(0), // opcode
	...i32.const(8),
	...i32.shr_u(), // shift right to isolate the first byte (0x7X)
	...i32.const(0x0f),
	...i32.and(), // isolate the second nibble (0x0X)

	...i32.const(REGISTERS_OFFSET),
	...i32.add(), // we now have the address of VX
	...local.tee(1), // set but leave on stack for later use

	...local.get(1), // load here to get the value next
	...i32.load8_u(), // load current value of VX
	...local.get(0), // opcode again
	...i32.const(0xff),
	...i32.and(), // isolate the last nibble (0xNN)
	...i32.add(), // add NN to VX value

	...i32.store8(), // store NN into VX
	...fn.end(),
]);
