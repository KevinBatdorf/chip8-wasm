import { useEffect, useState } from "react";
import { createChip8Engine } from "../runtime/engine";

const getRom = async (path: string): Promise<Uint8Array> => {
	const res = await fetch(path);
	if (!res.ok) throw new Error(`Failed to load ROM: ${res.status}`);
	const buffer = await res.arrayBuffer();
	return new Uint8Array(buffer);
};
const getWasm = async (path: string): Promise<Uint8Array> => {
	const res = await fetch(path);
	if (!res.ok) throw new Error(`Failed to load WASM: ${res.status}`);
	const buffer = await res.arrayBuffer();
	return new Uint8Array(buffer);
};

export default function App() {
	const [chip8, setChip8] = useState<Awaited<
		ReturnType<typeof createChip8Engine>
	> | null>(null);

	const memory = chip8?.getMemory();
	const buffer = new Uint8Array(memory?.buffer ?? new ArrayBuffer(0));

	useEffect(() => {
		Promise.all([
			getWasm("/chip8.wasm"), // path to your compiled WASM
			getRom("/roms/programs/IBM Logo.ch8"),
		]).then(([wasmBinary, romData]) => {
			createChip8Engine(wasmBinary).then((engine) => {
				engine.loadROM(romData);
				setChip8(engine);
			});
		});
	}, []);

	useEffect(() => {
		if (!chip8) return;
		// console.log("CHIP-8 Engine initialized", chip8);
	}, [chip8]);

	return (
		<div style={{ padding: "2rem", fontFamily: "monospace" }}>
			<h1>CHIP-8 Emulator</h1>
			<p>
				{buffer
					? `Memory loaded: ${buffer.byteLength} bytes`
					: "Loading Memory..."}
			</p>

			{buffer && (
				<pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
					{Array.from(buffer)
						.slice(0, 64 * 32) // Display only the first 2048 bytes (64x32 display)
						.map((b) => b.toString(16).padStart(2, "0"))
						.join(" ")}
				</pre>
			)}
		</div>
	);
}
