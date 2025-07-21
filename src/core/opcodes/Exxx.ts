import {
	KEY_BUFFER_ADDRESS,
	PC_ADDRESS,
	REGISTERS_ADDRESS,
} from "../constants";
import { fn, i32, if_, local, wat } from "../wasm";

// EX9E: Skip next instruction if key in VX is pressed
// biome-ignore format: keep if structure
const skipIfPressed = wat(
    i32.const(KEY_BUFFER_ADDRESS),
    local.get(0), // high byte of opcode
    i32.const(0x0f),
    i32.and(), // isolate the second nibble (0x0X)
    i32.const(REGISTERS_ADDRESS),
    i32.add(), // address of VX
    i32.load8_u(), // load VX value
    i32.add(), // address of key buffer
    i32.load8_u(), // load key state
    i32.const(1),
    i32.eq(), // check if key is pressed
    if_.start(),
        i32.const(PC_ADDRESS),
        i32.const(PC_ADDRESS),
        i32.load16_u(), // load current PC
        i32.const(2), // skip next instruction
        i32.add(), // new PC
        i32.store16(), // store new PC
    if_.end(),
    fn.return(),
);

// EXA1: Skip next instruction if key in VX is NOT pressed
// biome-ignore format: keep if structure
const skipIfNotPressed = wat(
    local.get(0), // high byte of opcode
    i32.const(0x0f),
    i32.and(), // isolate the second nibble (0x0X)
    i32.const(REGISTERS_ADDRESS),
    i32.add(), // address of VX
    i32.load8_u(), // load VX value
    i32.const(KEY_BUFFER_ADDRESS),
    i32.add(), // address of key buffer
    i32.load8_u(), // load key state
    i32.eqz(), // check if key is NOT pressed
    if_.start(),
        i32.const(PC_ADDRESS),
        i32.const(PC_ADDRESS),
        i32.load16_u(), // load current PC
        i32.const(2), // skip next instruction
        i32.add(), // new PC
        i32.store16(), // store new PC
    if_.end(),
    fn.return(),
);

// Jump to the key buffer check
// biome-ignore format: keep if structure
export const e = () => wat(
    // params: high byte of opcode, low byte of opcode
    local.declare(),

    // EX9E: Skip next if key in VX is pressed
    local.get(1), // low byte
    i32.const(0x9e),
    i32.eq(),
    if_.start(),
        skipIfPressed,
    if_.end(),

    // EXA1: Skip next if key in VX is NOT pressed
    local.get(1), // low byte
    i32.const(0xa1),
    i32.eq(),
    if_.start(),
        skipIfNotPressed,
    if_.end(),

    fn.end(),
);
