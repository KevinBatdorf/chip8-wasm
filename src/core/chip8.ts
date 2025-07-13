import { emitSection, encodeString, unsignedLEB } from "./emit";
import { fonts } from "./fonts";
import {
	func,
	getExportedFunctions,
	getFunctionTypeKey,
	getFunctionTypes,
	getImportedFunctions,
	getOpFunctions,
} from "./functions";
import { i32 } from "./wasm";

export const generate = (): Uint8Array => {
	// WASM magic + version
	const header = new Uint8Array([
		0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
	]);

	const { functionTypes, functionIndices } = getFunctionTypes();
	const importedFunctions = getImportedFunctions();
	const exportedFunctions = getExportedFunctions();
	const opFunctions = getOpFunctions();

	const functionTypesSection = emitSection(
		1,
		new Uint8Array([
			...unsignedLEB(functionTypes.length),
			...functionTypes.flat(),
		]),
	);

	// memory, random, etc
	const importSection = emitSection(
		2,
		new Uint8Array([
			...unsignedLEB(1 + importedFunctions.length),
			...encodeString("env"),
			...encodeString("memory"),
			0x02, // memory kind (memory)
			0x00, // limits (0 = no maximum)
			...unsignedLEB(1), // initial size (1 page = 64KB)
			...importedFunctions.flatMap((func) => {
				const key = getFunctionTypeKey(func.type);
				const typeIndex = functionIndices.get(key);
				if (typeIndex === undefined) {
					throw new Error(`Function type not found: ${key}`);
				}
				return [
					...encodeString("env"),
					...encodeString(func.name),
					0x00, // function kind (import)
					...unsignedLEB(typeIndex),
				];
			}),
		]),
	);

	const functionSection = emitSection(
		3,
		new Uint8Array([
			...unsignedLEB(opFunctions.length + exportedFunctions.length),
			...opFunctions.flatMap((func) => {
				const key = getFunctionTypeKey(func.type);
				const typeIndex = functionIndices.get(key);
				if (typeIndex === undefined) {
					throw new Error(`Function type not found: ${key}`);
				}
				return unsignedLEB(typeIndex);
			}),
			...exportedFunctions.flatMap((func) => {
				const key = getFunctionTypeKey(func.type);
				const typeIndex = functionIndices.get(key);
				if (typeIndex === undefined) {
					throw new Error(`Function type not found: ${key}`);
				}
				return unsignedLEB(typeIndex);
			}),
		]),
	);

	const tableSection = emitSection(
		4,
		new Uint8Array([
			0x01, // one table
			0x70, // element type: funcref
			0x00, // limits: min only
			...unsignedLEB(opFunctions.length),
		]),
	);

	const exportSection = emitSection(
		7,
		new Uint8Array([
			...unsignedLEB(exportedFunctions.length),
			...exportedFunctions.flatMap((fn) => [
				...encodeString(fn.name),
				0x00, // export kind (function)
				...unsignedLEB(func()[fn.name] ?? 0),
			]),
		]),
	);

	const elementSection = emitSection(
		9,
		new Uint8Array([
			...unsignedLEB(1), // one element segment
			0x00, // table index
			...i32.const(0), // offset in table
			0x0b,
			...unsignedLEB(opFunctions.length),
			...opFunctions.flatMap((fn) => unsignedLEB(func()[fn.name] ?? 0)),
		]),
	);

	const codeSection = emitSection(
		10,
		new Uint8Array([
			...unsignedLEB(opFunctions.length + exportedFunctions.length),
			...opFunctions.flatMap((func) => {
				const body = func.body || new Uint8Array([]);
				return [...unsignedLEB(body.length), ...body];
			}),
			...exportedFunctions.flatMap((func) => {
				const body = func.body || new Uint8Array([]);
				return [...unsignedLEB(body.length), ...body];
			}),
		]),
	);
	const fontSection = emitSection(
		11,
		new Uint8Array([
			...unsignedLEB(1),
			0x00, // memory index
			...i32.const(0x000), // offset in memory
			0x0b,
			...unsignedLEB(fonts.length),
			...fonts,
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
		...fontSection,
	]);
};
