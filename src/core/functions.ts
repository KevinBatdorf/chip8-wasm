import { init, tick, updateTimers } from "./cpu";
import { unsignedLEB } from "./emit";
import {
	a,
	b,
	c,
	e,
	eight,
	f,
	five,
	four,
	nine,
	one,
	seven,
	six,
	three,
	two,
	zero,
} from "./opcodes";
import { d } from "./opcodes/Dxxx";
import { valType } from "./wasm";

type FuncSignature = {
	name: string;
	type: { params: number[]; results: number[] };
	body?: Uint8Array;
};

const exportedFunctions: FuncSignature[] = [];
export const getExportedFunctions = (): FuncSignature[] => exportedFunctions;

const opFunctions: FuncSignature[] = [];
export const getOpFunctions = (): FuncSignature[] => opFunctions;

const importedFunctions: FuncSignature[] = [];
export const getImportedFunctions = (): FuncSignature[] => importedFunctions;

// e.g. tick(), init(), update_timers()
const addExportFunction = (
	name: string,
	params: number[],
	results: number[],
	body: Uint8Array,
) => {
	exportedFunctions.push({
		name,
		type: { params, results },
		body,
	});
};

// All opcodes segmented by their first nibble
const addOpFunction = (
	prefix: number, // e.g. 0x6 -> just the first nibble
	params: number[],
	results: number[],
	body: Uint8Array,
) => {
	const name = prefix.toString(16);
	opFunctions.push({ name, type: { params, results }, body });
};

// e.g. Math.random() from JS
const addImportFunction = (
	name: string,
	params: number[],
	results: number[],
): void => {
	importedFunctions.push({
		name,
		type: { params, results },
	});
	importedFunctions.push({ name, type: { params, results } });
};

export const getFunctionTypeKey = (type: {
	params: number[];
	results: number[];
}): string => {
	return `${type.params.join(",")}:${type.results.join(",")}`;
};

export const getFunctionTypes = (): {
	functionTypes: number[][];
	functionIndices: Map<string, number>;
} => {
	const functionTypes: number[][] = [];
	const functionIndices = new Map<string, number>();
	const allFunctions = [
		...opFunctions,
		...importedFunctions,
		...exportedFunctions,
	];
	for (const imp of allFunctions) {
		const key = getFunctionTypeKey(imp.type);
		if (!functionIndices.has(key)) {
			const typeIndex = functionTypes.length;
			functionIndices.set(key, typeIndex);
			functionTypes.push([
				0x60,
				...unsignedLEB(imp.type.params.length),
				...imp.type.params,
				...unsignedLEB(imp.type.results.length),
				...imp.type.results,
			]);
		}
	}
	return { functionTypes, functionIndices };
};

// This function returns a mapping of function names to their indices
export const func = (): Record<string, number> => {
	const list: Record<string, number> = {};
	let index = 0;
	for (const imp of importedFunctions) list[imp.name] = index++;
	for (const def of opFunctions) list[def.name] = index++;
	for (const user of exportedFunctions) list[user.name] = index++;
	return list;
};

// opcode function groups
addOpFunction(0x0, [valType("i32"), valType("i32")], [], zero());
addOpFunction(0x1, [valType("i32"), valType("i32")], [], one());
addOpFunction(0x2, [valType("i32"), valType("i32")], [], two());
addOpFunction(0x3, [valType("i32"), valType("i32")], [], three());
addOpFunction(0x4, [valType("i32"), valType("i32")], [], four());
addOpFunction(0x5, [valType("i32"), valType("i32")], [], five());
addOpFunction(0x6, [valType("i32"), valType("i32")], [], six());
addOpFunction(0x7, [valType("i32"), valType("i32")], [], seven());
addOpFunction(0x8, [valType("i32"), valType("i32")], [], eight());
addOpFunction(0x9, [valType("i32"), valType("i32")], [], nine());
addOpFunction(0xa, [valType("i32"), valType("i32")], [], a());
addOpFunction(0xb, [valType("i32"), valType("i32")], [], b());
addOpFunction(0xc, [valType("i32"), valType("i32")], [], c());
addOpFunction(0xd, [valType("i32"), valType("i32")], [], d());
addOpFunction(0xe, [valType("i32"), valType("i32")], [], e());
addOpFunction(0xf, [valType("i32"), valType("i32")], [], f());

// internal functions
addExportFunction("init", [], [], init);
addExportFunction("tick", [], [], tick);
addExportFunction("update_timers", [], [], updateTimers);

// imported functions
addImportFunction("random", [], [valType("i32")]);
