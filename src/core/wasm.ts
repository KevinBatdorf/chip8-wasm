import { signedLEB, unsignedLEB } from "./emit";

export const valType = (t: "i32" | "f64" | "void"): number => {
	switch (t) {
		case "i32":
			return 0x7f;
		case "f64":
			return 0x7c;
		case "void":
			return 0x40; // void type
		default:
			throw new Error(`Unknown type: ${t}`);
	}
};

export const local = {
	declare: (...types: ("i32" | "f64")[]): number[] => {
		if (!types.length) return [0x00]; // no locals
		const groups = new Map<string, number>();
		for (const t of types) {
			groups.set(t, (groups.get(t) ?? 0) + 1);
		}
		const result: number[] = [...unsignedLEB(groups.size)];
		for (const [type, count] of groups.entries()) {
			result.push(...unsignedLEB(count));
			result.push(valType(type as "i32" | "f64"));
		}
		return result;
	},
	get: (index: number): number[] => [0x20, ...unsignedLEB(index)],
	set: (index: number): number[] => [0x21, ...unsignedLEB(index)],
	tee: (index: number): number[] => [0x22, ...unsignedLEB(index)],
};

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
	lt_u: (): number[] => [0x49], // unsigned less than
	add: (): number[] => [0x6a],
	sub: (): number[] => [0x6b],
	mul: (): number[] => [0x6c],
	div_u: (): number[] => [0x6e], // unsigned division
	rem_u: (): number[] => [0x70], // unsigned remainder
	and: (): number[] => [0x71], // bitwise AND
	or: (): number[] => [0x72], // bitwise OR
	xor: (): number[] => [0x73], // bitwise XOR
	shl: (): number[] => [0x74], // shift left
	shr_u: (): number[] => [0x76], // unsigned shift right
	load: (offset = 0): number[] => [0x28, 0x02, ...unsignedLEB(offset)],
	load8_u: (offset = 0): number[] => [0x2d, 0x00, ...unsignedLEB(offset)],
	load16_u: (offset = 0): number[] => [0x2f, 0x00, ...unsignedLEB(offset)],
	store: (offset = 0): number[] => [0x36, 0x00, ...unsignedLEB(offset)],
	store8: (offset = 0): number[] => [0x3a, 0x00, ...unsignedLEB(offset)],
	store16: (offset = 0): number[] => [0x3b, 0x00, ...unsignedLEB(offset)],
};

export const control = {
	end: (): number[] => [0x0b],
};

export const block = {
	start: (type = valType("void")): number[] => [0x02, ...unsignedLEB(type)],
	end: (): number[] => control.end(),
};

export const loop = {
	start: (type = valType("void")): number[] => [0x03, ...unsignedLEB(type)],
	br: (labelIndex: number): number[] => [0x0c, ...unsignedLEB(labelIndex)],
	br_if: (labelIndex: number): number[] => [0x0d, ...unsignedLEB(labelIndex)],
	end: (): number[] => control.end(),
};

export const if_ = {
	start: (type = valType("void")): number[] => [0x04, ...unsignedLEB(type)],
	else: (): number[] => [0x05],
	end: (): number[] => control.end(),
};

export const misc = {
	drop: (): number[] => [0x1a],
	unreachable: (): number[] => [0x00],
	nop: (): number[] => [0x01],
};

export const fn = {
	call: (index: number): number[] => [0x10, ...unsignedLEB(index)],
	call_indirect: (index: number): number[] => [
		0x11,
		...unsignedLEB(index),
		0x00,
	],
	return: (): number[] => [0x0f],
	end: (): number[] => control.end(),
};

export const memory = {
	size: () => [0x3f, 0x00],
	grow: () => [0x40, 0x00],
	fill: (memIndex = 0) => [0xfc, 0x0b, ...unsignedLEB(memIndex)],
};

export const wat = (
	...params: (number | number[] | Uint8Array)[]
): Uint8Array =>
	new Uint8Array(
		params.flatMap((p) =>
			p instanceof Uint8Array ? Array.from(p) : Array.isArray(p) ? p : [p],
		),
	);
