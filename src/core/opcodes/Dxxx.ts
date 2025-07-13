import { fn, local } from "../wasm";

// DXYN: Draw sprite at coordinate (VX, VY) with N bytes of sprite data
// Set VF to 1 if any pixels are flipped, 0 otherwise
export const d = () =>
	new Uint8Array([
		// params: high byte of opcode, low byte of opcode
		...local.declare(),

		...fn.end(),
	]);
