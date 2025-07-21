import { I_ADDRESS } from "../constants";
import { fn, i32, local, wat } from "../wasm";

// ANNN: Set I to the address NNN
export const a = () =>
	wat(
		// params: high byte of opcode, low byte of opcode
		local.declare(),

		i32.const(I_ADDRESS),
		local.get(0), // high
		i32.const(8),
		i32.shl(),
		local.get(1), // low
		i32.or(), // combine high and low bytes into opcode
		i32.const(0x0fff), // mask to get the address
		i32.and(),

		i32.store16(),
		fn.end(),
	);
