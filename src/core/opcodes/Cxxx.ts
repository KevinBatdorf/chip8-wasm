import { REGISTERS_ADDRESS } from "../constants";
import { func } from "../functions";
import { fn, i32, local, wat } from "../wasm";

// CXNN: Set VX to a random number with a mask of NN
export const c = () =>
	wat(
		// params: high byte of opcode, low byte of opcode
		local.declare(),
		i32.const(REGISTERS_ADDRESS),
		local.get(0),
		i32.const(0x0f),
		i32.and(), // Get X
		i32.add(), // address of VX

		fn.call(func().random),
		local.get(1), // low byte of opcode
		i32.and(), // mask with NN
		i32.store8(), // store in VX
		fn.end(),
	);
