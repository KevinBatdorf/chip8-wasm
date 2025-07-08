import { useEffect, useState } from "react";
import { type Chip8Engine, createChip8Engine } from "..";
import { MemoryDump } from "./components/MemoryDump";
import { RomSelect } from "./components/RomSelect";
import { getRom, getWasm } from "./helpers";

export default function App() {
	const [chip8, setChip8] = useState<Chip8Engine | null>(null);
	const [rom, setRom] = useState<{ name: string; file: string } | null>(null);
	const [romData, setRomData] = useState<Uint8Array | null>(null);
	const memory = chip8?.getMemory();
	const buffer = new Uint8Array(memory?.buffer ?? new ArrayBuffer(0));

	useEffect(() => {
		getWasm("/chip8.wasm").then((wasmBinary) => {
			createChip8Engine(wasmBinary).then(setChip8);
		});
	}, []);

	useEffect(() => {
		if (!chip8 || !rom) return;
		getRom(`/roms/${rom.file}`).then((bytes) => {
			setRomData(bytes);
			chip8.loadROM(bytes);
		});
	}, [chip8, rom]);

	return (
		<div className="flex gap-2">
			<aside className="">
				<RomSelect currentRom={rom?.file ?? null} onSelect={setRom} />
			</aside>
			<div className="font-mono">
				<h1>CHIP-8 Emulator</h1>
				<p>{rom?.name ? `Loaded ROM: ${rom.name}` : "No ROM loaded"}</p>

				{buffer && (
					<MemoryDump
						memory={buffer.slice(0x000, 0x1400)}
						romData={romData}
						debug={chip8?.getDebug()}
					/>
				)}
			</div>
		</div>
	);
}
