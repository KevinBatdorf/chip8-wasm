import {
	emitExportEntry,
	emitFunction,
	emitSection,
	encodeString,
	unsignedLEB,
} from "./emit";
import {
	getFunctionIndices,
	getFunctionTypes,
	getFunctions,
	getOpFunctions,
} from "./functions";
import { i32 } from "./wasm";

export const generate = (): Uint8Array => {
	// WASM magic + version
	const header = new Uint8Array([
		0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
	]);

	// memory import
	const importSection = emitSection(
		2,
		new Uint8Array([
			...unsignedLEB(1), // 1 import
			...encodeString("env"), // module name
			...encodeString("memory"), // import name
			0x02, // import kind (memory)
			0x00, // limits (0 = no maximum)
			...unsignedLEB(1), // initial size (1 page = 64KB)
		]),
	);

	const { types } = getFunctionTypes();
	const functionTypesSection = emitSection(
		1, // section 1: Type section
		new Uint8Array([
			...unsignedLEB(types.length),
			...types.flatMap((t) => [...t]),
		]),
	);

	const functionIndices = getFunctionIndices();
	const functionSection = emitSection(
		3, // section 3: Function section
		new Uint8Array([
			...unsignedLEB(functionIndices.length),
			...functionIndices.flat(),
		]),
	);

	const tableSection = emitSection(
		4,
		new Uint8Array([
			0x01, // one table
			0x70, // element type: funcref
			0x00, // limits: min only
			...unsignedLEB(getOpFunctions().length),
		]),
	);

	const functionEntries = getFunctions()
		.map((func, index) =>
			func.export ? emitExportEntry(func.name, index, 0x00) : null,
		)
		.filter((entry): entry is number[] => entry !== null);
	const exportSection = emitSection(
		7,
		new Uint8Array([
			...unsignedLEB(functionEntries.length),
			...functionEntries.flat(),
		]),
	);

	const elementSection = emitSection(
		9, // Element section
		new Uint8Array([
			...unsignedLEB(1), // one element segment
			0x00, // table index
			...i32.const(0), // offset in table
			0x0b,
			...unsignedLEB(getOpFunctions().length),
			...getOpFunctions().map((f) => f.index),
		]),
	);

	const codeBodies = getFunctions().map(({ body }) => emitFunction(body));
	const codeSection = emitSection(
		10,
		new Uint8Array([
			...unsignedLEB(codeBodies.length),
			...codeBodies.flatMap((b) => [...b]),
		]),
	);

	return new Uint8Array([
		...header,
		...functionTypesSection,
		...importSection,
		...functionSection,
		...tableSection,
		...exportSection,
		...elementSection,
		...codeSection,
	]);
};
