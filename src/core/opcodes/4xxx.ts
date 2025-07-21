import { PC_ADDRESS, REGISTERS_ADDRESS } from "../constants";
import { fn, i32, if_, local, wat } from "../wasm";

// 4XNN Skip next instruction if VX !== NN
// biome-ignore format: keep if structure
export const four = () => wat(
    // params: high byte of opcode, low byte of opcode
    local.declare(),
    i32.const(REGISTERS_ADDRESS),
    local.get(0),
    i32.const(0x0f),
    i32.and(), // Get X
    i32.add(), // address of VX
    i32.load8_u(), // load VX value
    local.get(1),
    i32.ne(), // compare VX and NN
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
