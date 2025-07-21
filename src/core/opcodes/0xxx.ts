import {
	FRAME_BUFFER_ADDRESS,
	PC_ADDRESS,
	STACK_ADDRESS,
	STACK_PTR_ADDRESS,
} from "../constants";
import { fn, i32, if_, local, memory, wat } from "../wasm";

// Return from a subroutine
const ee = wat(
	// Decrement stack pointer
	i32.const(STACK_PTR_ADDRESS),
	i32.const(STACK_PTR_ADDRESS),
	i32.load8_u(),
	i32.const(2),
	i32.sub(),
	i32.store8(),

	// Load the return address from the stack into PC
	i32.const(PC_ADDRESS),
	i32.const(STACK_ADDRESS),
	i32.const(STACK_PTR_ADDRESS),
	i32.load8_u(),
	i32.add(), // Get the current pos in stack
	i32.load16_u(), // Load PC from stack
	i32.store16(), // Store in PC
);

// Clear the display
const clearDisplay = wat(
	i32.const(FRAME_BUFFER_ADDRESS),
	i32.const(0),
	i32.const(256), // 256 bytes for frame buffer
	memory.fill(),
);

// Execute subroutine starting at address NNN
// biome-ignore format: keep if structure
export const zero = () => wat(
    // params: high byte of opcode, low byte of opcode
    local.declare(),

    // Return from a subroutine
    local.get(1), // low byte
    i32.const(0xee),
    i32.eq(),
    if_.start(),
        ee,
    if_.end(),

    // Clear the display
    local.get(1), // low byte
    i32.const(0xe0),
    i32.eq(),
    if_.start(),
        clearDisplay,
    if_.end(),

    fn.end(),
);
