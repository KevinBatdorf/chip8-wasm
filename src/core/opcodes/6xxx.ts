import { REGISTERS_ADDRESS } from "../constants";
import { fn, i32, local, wat } from "../wasm";

// e.g. VX = NN
export const six = () =>
	wat(
		// params: high, low byte of opcode
		local.declare(),
		local.get(0), // high byte of opcode
		i32.const(0x0f),
		i32.and(), // isolate the second nibble (0x0X)
		i32.const(REGISTERS_ADDRESS),
		i32.add(), // address of VX

		local.get(1), // low byte of opcode (NN)
		i32.store8(), // store NN into VX
		fn.end(),
	);
