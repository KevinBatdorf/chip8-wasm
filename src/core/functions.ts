import { init, tick, updateTimers } from "./cpu";
import { emitFunctionType, unsignedLEB } from "./emit";
import { eight, seven, six } from "./opcodes";
import { one } from "./opcodes/1xxx";
import { fn, misc, valType } from "./wasm";

type FuncSignature = {
	name: string;
	type: { params: number[]; results: number[] };
	body: Uint8Array;
	export?: boolean;
};
type OpFuncSignature = {
	index: number;
	name: string;
	type: { params: number[]; results: number[] };
};

const functions: FuncSignature[] = [];
export const getFunctions = (): FuncSignature[] => functions;

const opFunctions: OpFuncSignature[] = [];
export const getOpFunctions = (): OpFuncSignature[] => opFunctions;
const opFunctionMap = new Map<string, number>();

const addFunction = (
	name: string,
	params: number[],
	results: number[],
	body: Uint8Array,
	opts: { export?: boolean } = {},
) => {
	functions.push({
		name,
		type: { params, results },
		body,
		export: opts.export ?? false,
	});
};

// These will go into a function table, and the function section too
const addOpFunction = (
	prefix: number, // e.g. 0x6 -> just the first nibble
	params: number[],
	results: number[],
	body: Uint8Array,
): number => {
	const index = functions.length;
	const name = prefix.toString(16);
	functions.push({
		name,
		type: { params, results },
		body,
	});
	opFunctions.push({ index, name, type: { params, results } });
	opFunctionMap.set(name, index);
	return index;
};

const getFunctionTypeKey = (type: {
	params: number[];
	results: number[];
}): string => {
	return `${type.params.join(",")}:${type.results.join(",")}`;
};

export const getFunctionTypes = (): {
	types: Uint8Array[];
	typeIndices: Map<string, number>;
} => {
	const types: Uint8Array[] = [];
	const typeIndices = new Map<string, number>();
	for (const func of functions) {
		const key = getFunctionTypeKey(func.type);
		if (!typeIndices.has(key)) {
			typeIndices.set(key, types.length);
			types.push(emitFunctionType(func.type));
		}
	}
	return { types, typeIndices };
};
export const getFunctionIndices = (): number[][] => {
	const { typeIndices } = getFunctionTypes();
	return functions.map((fn) =>
		unsignedLEB(typeIndices.get(getFunctionTypeKey(fn.type)) ?? 0),
	);
};

// opcode function groups
const notImplemented = new Uint8Array([...misc.unreachable(), ...fn.end()]);
addOpFunction(0x0, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0x1, [valType("i32"), valType("i32")], [], one);
addOpFunction(0x2, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0x3, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0x4, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0x5, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0x6, [valType("i32"), valType("i32")], [], six);
addOpFunction(0x7, [valType("i32"), valType("i32")], [], seven);
addOpFunction(0x8, [valType("i32"), valType("i32")], [], eight);
addOpFunction(0x9, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0xa, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0xb, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0xc, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0xd, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0xe, [valType("i32"), valType("i32")], [], notImplemented);
addOpFunction(0xf, [valType("i32"), valType("i32")], [], notImplemented);

// internal functions
addFunction("init", [], [], init, { export: true });
addFunction("tick", [], [], tick, { export: true });
addFunction("update_timers", [], [], updateTimers, { export: true });
