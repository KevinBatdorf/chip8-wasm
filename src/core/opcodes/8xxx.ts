import { REGISTERS_OFFSET } from "../constants";
import { fn, i32, if_, local } from "../wasm";

// 8XY0	VX = VY
const eight0 = new Uint8Array([
	...local.get(2), // address of VX
	...local.get(3), // address of VY
	...i32.load8_u(), // load current value of VY
	...i32.store8(), // store VY into VX
	...fn.return(),
]);

// 8XY1	VX = VX OR VY
const eight1 = new Uint8Array([
	...local.get(2), // address of VX
	...local.get(3), // address of VY
	...i32.load8_u(), // load current value of VY
	...local.get(2), // address of VX
	...i32.load8_u(), // load current value of VX
	...i32.or(), // VX = VX OR VY
	...i32.store8(), // store VY into VX
	...fn.return(),
]);

// 8XY2	VX = VX AND VY
const eight2 = new Uint8Array([
	...local.get(2), // address of VX
	...local.get(3), // address of VY
	...i32.load8_u(), // load current value of VY
	...local.get(2), // address of VX
	...i32.load8_u(), // load current value of VX
	...i32.and(), // VX = VX AND VY
	...i32.store8(), // store VY into VX
	...fn.return(),
]);

// 8XY3	VX = VX XOR VY
export const eight3 = new Uint8Array([
	...local.get(2), // address of VX
	...local.get(3), // address of VY
	...i32.load8_u(), // load current value of VY
	...local.get(2), // address of VX
	...i32.load8_u(), // load current value of VX
	...i32.xor(), // VX = VX XOR VY
	...i32.store8(), // store VY into VX
	...fn.return(),
]);

// 8XY4	VX += VY, VF = carry
export const eight4 = new Uint8Array([
	...local.get(2), // address of VX
	...local.get(3), // address of VY
	...i32.load8_u(), // load current value of VY
	...local.get(2), // address of VX
	...i32.load8_u(), // load current value of VX
	...i32.add(), // VX += VY
	...local.tee(5), // store result in local 5 for carry check
	...i32.store8(), // store VY into VX

	// Check for carry
	...i32.const(REGISTERS_OFFSET + 0xf), // address of VF
	...local.get(5), // result of VX += VY
	...i32.const(0xff), // max value for 8-bit
	...i32.gt_u(), // check if result > 255 (carry)
	...i32.store8(),
	...fn.return(),
]);

// 8XY5	VX -= VY, VF = NOT borrow
export const eight5 = new Uint8Array([
	...local.get(2), // address of VX
	...local.get(2), // address of VX
	...i32.load8_u(), // load current value of VX
	...local.tee(5),
	...local.get(3), // address of VY
	...i32.load8_u(), // load current value of VY
	...local.tee(6),
	...i32.sub(), // VX -= VY
	...i32.store8(), // store VY into VX

	// Check for carry
	...i32.const(REGISTERS_OFFSET + 0xf), // address of VF
	...local.get(5), // VX value
	...local.get(6), // VY value
	...i32.ge_u(), // if VX >= VY borrow is 1
	...i32.store8(),
	...fn.return(),
]);

// 8XY6	VX >>= 1, VF = LSB of VX
export const eight6 = new Uint8Array([
	...i32.const(REGISTERS_OFFSET + 0xf), // address of VF
	...local.get(2), // address of VX
	...i32.load8_u(), // load current value of VX
	...i32.const(1),
	...i32.and(), // isolate the LSB
	...i32.store8(), // store LSB in VF

	...local.get(2), // address of VX
	...local.get(2), // address of VX
	...i32.load8_u(), // load current value of VX
	...i32.const(1),
	...i32.shr_u(), // shift right by 1
	...i32.store8(), // store shifted value back to VX
	...fn.return(),
]);

// 8XY7	VX = VY - VX, VF = NOT borrow
export const eight7 = new Uint8Array([
	...local.get(2), // address of VX
	...local.get(3), // address of VY
	...i32.load8_u(), // load current value of VY
	...local.tee(5),
	...local.get(2), // address of VX
	...i32.load8_u(), // load current value of VX
	...local.tee(6),
	...i32.sub(), // VX = VY - VX
	...i32.store8(), // store VY into VX

	// Check for carry
	...i32.const(REGISTERS_OFFSET + 0xf), // address of VF
	...local.get(5), // VY value
	...local.get(6), // VX value
	...i32.ge_u(), // if VY >= VX borrow is 1
	...i32.store8(),
	...fn.return(),
]);

// 8XYE	VX <<= 1, VF = MSB of VX
export const eightE = new Uint8Array([
	...i32.const(REGISTERS_OFFSET + 0xf), // address of VF
	...local.get(2), // address of VX
	...i32.load8_u(), // load current value of VX
	...i32.const(7), // shift right by 7 to get the MSB
	...i32.shr_u(),
	...i32.const(1),
	...i32.and(), // isolate the MSB
	...i32.store8(), // store MSB in VF

	...local.get(2), // address of VX
	...local.get(2), // address of VX
	...i32.load8_u(), // load current value of VX
	...i32.const(1),
	...i32.shl(), // shift left by 1
	...i32.store8(), // store shifted value back to VX
	...fn.return(),
]);

// biome-ignore format: keep if structure
export const eight = () =>
	new Uint8Array([
		// params: high, low byte of opcode
		// [2] = high byte, [3] = low byte, [4] = second nibble of low byte
		// [5] = scratch value, [6] = scratch value
		...local.declare("i32", "i32", "i32", "i32", "i32"),

		...local.get(0), // high byte of opcode
		...i32.const(0x0f),
		...i32.and(), // isolate the second nibble (0x0X)
		...i32.const(REGISTERS_OFFSET),
		...i32.add(), // address of VX
		...local.set(2),

		...local.get(1), // low byte of opcode
		...i32.const(0xf0),
		...i32.and(), // isolate the first nibble (0xX0)
		...i32.const(4),
		...i32.shr_u(), // shift right to get the first nibble
		...i32.const(REGISTERS_OFFSET),
		...i32.add(), // address of VY
		...local.set(3),

		...local.get(1), // low byte
		...i32.const(0x0f),
		...i32.and(), // isolate the lower nibble
		...local.set(4),

		// 0: VX = VY
		...local.get(4),
		...i32.const(0),
		...i32.eq(),
		...if_.start(),
		    ...eight0,
		...if_.end(),

		// 1: VX = VX OR VY
		...local.get(4),
		...i32.const(1),
		...i32.eq(),
		...if_.start(),
		    ...eight1,
		...if_.end(),

		// 2: VX = VX AND VY
		...local.get(4),
		...i32.const(2),
		...i32.eq(),
		...if_.start(),
		    ...eight2,
		...if_.end(),

		// 3: VX = VX XOR VY
		...local.get(4),
		...i32.const(3),
		...i32.eq(),
		...if_.start(),
		    ...eight3,
		...if_.end(),

		// 4: VX += VY, VF = carry
		...local.get(4),
		...i32.const(4),
		...i32.eq(),
		...if_.start(),
		    ...eight4,
		...if_.end(),

		// 5: VX -= VY, VF = NOT borrow
		...local.get(4),
		...i32.const(5),
		...i32.eq(),
		...if_.start(),
		    ...eight5,
		...if_.end(),

		// 6: VX >>= 1, VF = LSB
		...local.get(4),
		...i32.const(6),
		...i32.eq(),
		...if_.start(),
		    ...eight6,
		...if_.end(),

		// 7: VX = VY - VX, VF = NOT borrow
		...local.get(4),
		...i32.const(7),
		...i32.eq(),
		...if_.start(),
		    ...eight7,
		...if_.end(),

		// E: VX <<= 1, VF = MSB
		...local.get(4),
		...i32.const(0xe),
		...i32.eq(),
		...if_.start(),
		    ...eightE,
		...if_.end(),
		...fn.end(),
	]);
