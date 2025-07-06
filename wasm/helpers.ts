import { signedLEB, unsignedLEB } from "./emit";

export const i32 = {
	type: (): number[] => [0x7f], // i32 type
	const: (value: number): number[] => [0x41, ...signedLEB(value)],
	eq: (): number[] => [0x46],
	eqz: (): number[] => [0x45], // equal zero
	gt_u: (): number[] => [0x4b], // unsigned greater than
	ge_s: (): number[] => [0x4e], // signed greater than or equal
	ge_u: (): number[] => [0x4f], // unsigned greater than or equal
	ne: (): number[] => [0x47],
	lt_s: (): number[] => [0x48], // signed less than
	add: (): number[] => [0x6a],
	sub: (): number[] => [0x6b],
	mul: (): number[] => [0x6c],
	and: (): number[] => [0x71], // bitwise AND
	or: (): number[] => [0x72], // bitwise OR
	shl: (): number[] => [0x74], // shift left
	shr_u: (): number[] => [0x76], // unsigned shift right
	load: (offset = 0): number[] => [0x28, 0x02, ...unsignedLEB(offset)],
	store: (offset = 0): number[] => [0x36, 0x02, ...unsignedLEB(offset)],
	load8_u: (offset = 0): number[] => [0x2d, 0x00, ...unsignedLEB(offset)],
	store8: (offset = 0): number[] => [0x3a, 0x00, ...unsignedLEB(offset)],
};
