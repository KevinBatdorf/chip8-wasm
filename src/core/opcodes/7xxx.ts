import { REGISTERS_ADDRESS } from "../constants";
import { fn, i32, local } from "../wasm";

// e.g. VX += NN
export const seven = () =>
	new Uint8Array([
		// params: high, low byte of opcode
		...local.declare("i32"), // address of VX
		...i32.const(REGISTERS_ADDRESS + 0xf), // address of VF
		...i32.const(0), // set VF to 0
		...i32.store8(), // clear VF
		...local.get(0), // high
		...i32.const(0x0f),
		...i32.and(), // isolate the second nibble (0x0X)

		...i32.const(REGISTERS_ADDRESS),
		...i32.add(), // we now have the address of VX
		...local.tee(2), // set but leave on stack for later use

		...local.get(2), // load here to get the value next
		...i32.load8_u(), // load current value of VX
		...local.get(1), // low
		...i32.add(), // add NN to VX value

		...i32.store8(), // store NN into VX (handles overflow automatically)
		...fn.end(),
	]);
