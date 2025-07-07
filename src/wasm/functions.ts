import {
	DELAY_TIMER_OFFSET,
	DISPLAY_OFFSET,
	I_OFFSET,
	KEY_BUFFER_OFFSET,
	PC_OFFSET,
	REGISTERS_OFFSET,
	ROM_LOAD_ADDRESS,
	SOUND_TIMER_OFFSET,
	STACK_OFFSET,
	STACK_PTR_OFFSET,
} from "../core/constants";
import {
	emitExportEntry,
	emitFunction,
	emitFunctionType,
	emitSection,
	unsignedLEB,
} from "./emit";
import { fn, i32, local, memory, misc } from "./helpers";

type FuncSignature = {
	name: string;
	type: { params: number[]; results: number[] };
	body: Uint8Array;
	export?: boolean;
};

const functions: FuncSignature[] = [];

export const addFunction = (
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

export const getFunctionTypesSection = (): Uint8Array => {
	const { types } = getFunctionTypes();
	return emitSection(
		1, // section 1: Type section
		new Uint8Array([
			...unsignedLEB(types.length),
			...types.flatMap((t) => [...t]),
		]),
	);
};

export const getFunctionSection = (): Uint8Array => {
	const { typeIndices } = getFunctionTypes();
	const indices = functions.map((fn) =>
		unsignedLEB(typeIndices.get(getFunctionTypeKey(fn.type)) ?? 0),
	);
	return emitSection(
		3, // section 3: Function section
		new Uint8Array([...unsignedLEB(indices.length), ...indices.flat()]),
	);
};

export const getExportSection = (): Uint8Array => {
	const entries = functions
		.map((func, index) =>
			func.export ? emitExportEntry(func.name, index, 0x00) : null,
		)
		.filter((entry): entry is number[] => entry !== null);
	return emitSection(
		7,
		new Uint8Array([...unsignedLEB(entries.length), ...entries.flat()]),
	);
};

export const getCodeSection = (): Uint8Array => {
	const codeBodies = functions.map(({ body }) => emitFunction(body));
	return emitSection(
		10,
		new Uint8Array([
			...unsignedLEB(codeBodies.length),
			...codeBodies.flatMap((b) => [...b]),
		]),
	);
};

const initBody = new Uint8Array([
	...local.declare(),
	// Clear rom and display
	...i32.const(ROM_LOAD_ADDRESS),
	...i32.const(0),
	...i32.const(DISPLAY_OFFSET - ROM_LOAD_ADDRESS),
	...memory.fill(),

	// Clear key buffer
	...i32.const(KEY_BUFFER_OFFSET),
	...i32.const(0),
	...i32.const(16), // 16 bytes for key buffer
	...memory.fill(),

	// Clear stack
	...i32.const(STACK_OFFSET),
	...i32.const(0),
	...i32.const(32), // 32 bytes for stack (16 entries of 2 bytes each)
	...memory.fill(),

	// Clear registers
	...i32.const(REGISTERS_OFFSET),
	...i32.const(0),
	...i32.const(16), // 16 bytes for registers
	...memory.fill(),

	// Set PC
	...i32.const(PC_OFFSET),
	...i32.const(ROM_LOAD_ADDRESS),
	...i32.store16(),

	// Set SP
	...i32.const(STACK_PTR_OFFSET),
	...i32.const(0),
	...i32.store8(),

	// Set timers
	...i32.const(DELAY_TIMER_OFFSET),
	...i32.const(0),
	...i32.store8(),
	...i32.const(SOUND_TIMER_OFFSET),
	...i32.const(0),
	...i32.store8(),

	// Set I = 0
	...i32.const(I_OFFSET),
	...i32.const(0),
	...i32.store16(),

	...fn.end(),
]);
const tickBody = new Uint8Array([
	...local.declare(),
	...misc.nop(),
	...fn.end(),
]);
const updateTimersBody = new Uint8Array([
	...local.declare(),
	...misc.nop(),
	...fn.end(),
]);

addFunction("init", [], [], initBody, { export: true });
addFunction("tick", [], [], tickBody, { export: true });
addFunction("update_timers", [], [], updateTimersBody, { export: true });
