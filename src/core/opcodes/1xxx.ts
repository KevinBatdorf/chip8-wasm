import { MAX_ROM_ADDRESS, PC_ADDRESS, ROM_LOAD_ADDRESS } from "../constants";
import { fn, i32, if_, local, misc, wat } from "../wasm";

// Jump to address NNN
// biome-ignore format: keep if structure
export const one = () => wat(
	// params: high byte of opcode, low byte of opcode
	local.declare("i32"), // NNN
	local.get(0), // high
	i32.const(8),
	i32.shl(),
	local.get(1), // low
	i32.or(), // combine high and low bytes into opcode
	i32.const(0x0fff), // mask to get the address
	i32.and(),
	local.tee(0), // store NNN in local 0

	// Are we out of bounds?
	i32.const(ROM_LOAD_ADDRESS),
	i32.lt_u(), // check if NNN < ROM_LOAD_ADDRESS
	if_.start(),
		misc.unreachable(),
	fn.end(),
	local.get(0), // NNN
	i32.const(MAX_ROM_ADDRESS),
	i32.gt_u(),
	if_.start(),
		misc.unreachable(),
	fn.end(),

	// Store it
	i32.const(PC_ADDRESS),
	local.get(0),
	i32.store16(),
	fn.end(),
);
