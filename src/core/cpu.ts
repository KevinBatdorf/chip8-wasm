import {
	DELAY_TIMER_ADDRESS,
	DISPLAY_ADDRESS,
	DRAW_HAPPENED_ADDRESS,
	FRAME_BUFFER_ADDRESS,
	FX0A_VX_ADDRESS,
	I_ADDRESS,
	KEY_BUFFER_ADDRESS,
	MAX_ROM_ADDRESS,
	PC_ADDRESS,
	QUIRK_CLIPPING,
	QUIRK_CLIPPING_ADDRESS,
	QUIRK_DISPLAY_WAIT,
	QUIRK_DISPLAY_WAIT_ADDRESS,
	QUIRK_JUMPING,
	QUIRK_JUMPING_ADDRESS,
	QUIRK_MEMORY,
	QUIRK_MEMORY_ADDRESS,
	QUIRK_SHIFTING,
	QUIRK_SHIFTING_ADDRESS,
	QUIRK_VF_RESET,
	QUIRK_VF_RESET_ADDRESS,
	REGISTERS_ADDRESS,
	ROM_LOAD_ADDRESS,
	SOUND_TIMER_ADDRESS,
	STACK_ADDRESS,
	STACK_PTR_ADDRESS,
	TICKS_PER_FRAME,
	TICKS_PER_FRAME_ADDRESS,
} from "./constants";
import { fn, i32, if_, local, memory, misc } from "./wasm";

export const init = new Uint8Array([
	...local.declare(),

	// Setup quirks config
	...i32.const(QUIRK_VF_RESET_ADDRESS),
	...i32.const(QUIRK_VF_RESET),
	...i32.store8(),
	...i32.const(QUIRK_MEMORY_ADDRESS),
	...i32.const(QUIRK_MEMORY),
	...i32.store8(),
	...i32.const(QUIRK_DISPLAY_WAIT_ADDRESS),
	...i32.const(QUIRK_DISPLAY_WAIT),
	...i32.store8(),
	...i32.const(QUIRK_CLIPPING_ADDRESS),
	...i32.const(QUIRK_CLIPPING),
	...i32.store8(),
	...i32.const(QUIRK_JUMPING_ADDRESS),
	...i32.const(QUIRK_JUMPING),
	...i32.store8(),
	...i32.const(QUIRK_SHIFTING_ADDRESS),
	...i32.const(QUIRK_SHIFTING),
	...i32.store8(),

	// Set ticks per frame
	...i32.const(TICKS_PER_FRAME_ADDRESS),
	...i32.const(TICKS_PER_FRAME), // Default to 8 ticks per frame
	...i32.store8(),

	// Clear rom
	...i32.const(ROM_LOAD_ADDRESS),
	...i32.const(0),
	...i32.const(MAX_ROM_ADDRESS - ROM_LOAD_ADDRESS + 1), // 3584 bytes for ROM
	...memory.fill(),

	// Clear display
	...i32.const(DISPLAY_ADDRESS),
	...i32.const(0),
	...i32.const(256), // 256 bytes for display (64x32 = 2048 bits = 256 bytes)
	...memory.fill(),
	...i32.const(FRAME_BUFFER_ADDRESS),
	...i32.const(0),
	...i32.const(256), // 256 bytes for frame buffer
	...memory.fill(),

	// Clear key buffer
	...i32.const(KEY_BUFFER_ADDRESS),
	...i32.const(0),
	...i32.const(16), // 16 bytes for key buffer
	...memory.fill(),

	// Clear stack
	...i32.const(STACK_ADDRESS),
	...i32.const(0),
	...i32.const(32), // 32 bytes for stack (16 entries of 2 bytes each)
	...memory.fill(),

	// Clear registers
	...i32.const(REGISTERS_ADDRESS),
	...i32.const(0),
	...i32.const(16), // 16 bytes for registers
	...memory.fill(),

	// Set PC
	...i32.const(PC_ADDRESS),
	...i32.const(ROM_LOAD_ADDRESS),
	...i32.store16(),

	// Set SP
	...i32.const(STACK_PTR_ADDRESS),
	...i32.const(0),
	...i32.store8(),

	// Set timers
	...i32.const(DELAY_TIMER_ADDRESS),
	...i32.const(0),
	...i32.store8(),
	...i32.const(SOUND_TIMER_ADDRESS),
	...i32.const(0),
	...i32.store8(),

	// Set I = 0
	...i32.const(I_ADDRESS),
	...i32.const(0),
	...i32.store16(),

	// Set FX0A_VX_ADDRESS to 0
	...i32.const(FX0A_VX_ADDRESS),
	...i32.const(0),
	...i32.store8(),

	...fn.end(),
]);

// biome-ignore format: keep if structure
export const tick = new Uint8Array([
	...local.declare("i32", "i32", "i32"), // PC, high byte, low byte

	// Exit early if draw happened (display quirk is enabled)
	...i32.const(DRAW_HAPPENED_ADDRESS),
	...i32.load8_u(),
	...if_.start(),
	    ...fn.return(),
	...if_.end(),

	// Load PC
	...i32.const(PC_ADDRESS),
	...i32.load16_u(),
	...local.tee(0),

    // Check if PC is out of bounds (lower)
    ...i32.const(ROM_LOAD_ADDRESS),
    ...i32.lt_u(), // check if PC < ROM_LOAD_ADDRESS
    ...if_.start(),
        ...misc.unreachable(),
    ...fn.end(),
    // (upper)
    ...local.get(0), // PC
    ...i32.const(MAX_ROM_ADDRESS),
    ...i32.gt_u(), // check if PC > MAX_ROM_ADDRESS
    ...if_.start(),
        ...misc.unreachable(),
    ...fn.end(),

	...local.get(0), // PC
	...i32.load8_u(), // load high byte
	...local.set(1), // store high byte in local 1

	...local.get(0), // PC again
	...i32.const(1),
	...i32.add(),
	...i32.load8_u(), // load low byte
	...local.set(2), // store low byte in local 2

	// increment PC
	...i32.const(PC_ADDRESS),
	...local.get(0),
	...i32.const(2),
	...i32.add(),
	...i32.store16(),

	// function params
	...local.get(1), // high
	...local.get(2), // low

	// Call the opcode handler
	...local.get(1),
	...i32.const(4),
	...i32.shr_u(), // extract the first nibble of high byte
	...fn.call_indirect(0), // hard coded to 0, since we only have one function type

	...fn.end(),
]);

// biome-ignore format: keep if structure
export const updateTimers = new Uint8Array([
	...local.declare(),
	// Delay timer
	...i32.const(DELAY_TIMER_ADDRESS),
	...i32.load8_u(), // load delay timer value
	...i32.const(0),
    ...i32.gt_u(), // is it greater than 0?
    ...if_.start(),
        ...i32.const(DELAY_TIMER_ADDRESS),
        ...i32.const(DELAY_TIMER_ADDRESS),
        ...i32.load8_u(), // load delay timer value again
        ...i32.const(1),
        ...i32.sub(), // decrement delay timer
        ...i32.store8(),
    ...if_.end(),

    // Sound timer
    ...i32.const(SOUND_TIMER_ADDRESS),
    ...i32.load8_u(), // load sound timer value
    ...i32.const(0),
    ...i32.gt_u(), // is it greater than 0?
    ...if_.start(),
        ...i32.const(SOUND_TIMER_ADDRESS),
        ...i32.const(SOUND_TIMER_ADDRESS),
        ...i32.load8_u(), // load sound timer value again
        ...i32.const(1),
        ...i32.sub(), // decrement sound timer
        ...i32.store8(),
    ...if_.end(),

	...fn.end(),
]);
