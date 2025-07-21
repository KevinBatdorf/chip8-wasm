import { PC_ADDRESS, REGISTERS_ADDRESS } from "../constants";
import { fn, i32, if_, local, wat } from "../wasm";

// 5XY0 Skip next instruction if VX === NN
// biome-ignore format: keep if structure
export const five = () => wat(
    // params: high byte of opcode, low byte of opcode
    local.declare(),
    // return early if low nibble is not 0
    local.get(1),
    i32.const(0x0f),
    i32.and(), // isolate the low nibble
    i32.const(0),
    i32.ne(),
    if_.start(),
        fn.return(),
    if_.end(),

    // VX
    i32.const(REGISTERS_ADDRESS),
    local.get(0),
    i32.const(0x0f),
    i32.and(), // Get X
    i32.add(), // address of VX
    i32.load8_u(), // load VX value

    // VY
    i32.const(REGISTERS_ADDRESS),
    local.get(1),
    i32.const(4),
    i32.shr_u(), // extract the first nibble of low byte
    i32.add(), // address of VY
    i32.load8_u(), // load VY value
    i32.eq(), // compare VX and VY
    if_.start(),
        i32.const(PC_ADDRESS),
        i32.const(PC_ADDRESS),
        i32.load16_u(), // load current PC
        i32.const(2),
        i32.add(),
        i32.store16(),
    if_.end(),
    fn.end(),
);
