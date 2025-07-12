import { PC_OFFSET, REGISTERS_OFFSET } from "../constants";
import { fn, i32, if_, local } from "../wasm";

// 3XNN Skip next instruction if VX === NN
// biome-ignore format: keep if structure
export const three = new Uint8Array([
	// params: high byte of opcode, low byte of opcode
	...local.declare(),
	...i32.const(REGISTERS_OFFSET),
	...local.get(0),
	...i32.const(0x0f),
	...i32.and(), // Get X
	...i32.add(), // address of VX
	...i32.load8_u(), // load VX value
	...local.get(1),
	...i32.eq(), // compare VX and NN
	...if_.start(),
        ...i32.const(PC_OFFSET),
        ...i32.const(PC_OFFSET),
        ...i32.load16_u(), // load current PC
        ...i32.const(2),
        ...i32.add(),
        ...i32.store16(),
	...if_.end(),
	...fn.end(),
]);
