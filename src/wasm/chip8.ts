import { emitSection, encodeString, unsignedLEB } from "./emit";
import {
	addFunction,
	getCodeSection,
	getExportSection,
	getFunctionSection,
	getFunctionTypesSection,
} from "./functions";

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

	return new Uint8Array([
		...header,
		...getFunctionTypesSection(),
		...importSection,
		...getFunctionSection(),
		...getExportSection(),
		...getCodeSection(),
	]);
};
