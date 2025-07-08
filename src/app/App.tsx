import { useEffect, useState } from "react";
import { type Chip8Engine, createChip8Engine } from "..";
import { DebugScreen } from "./components/DebugScreen";
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
		<div className="flex">
			<aside className="flex-shrink-0 p-0 text-sm">
				<RomSelect currentRom={rom?.file ?? null} onSelect={setRom} />
			</aside>
			<main className="font-mono flex-1 text-sm">
				<div className="sticky top-0 z-10 bg-stone-200 text-black flex-grow flex justify-center items-center min-h-screen w-full">
					<div className="flex items-center justify-center gap-2 p-2 flex-grow">
						<h1>CHIP-8 Emulator</h1>
						<p>{rom?.name ? `Loaded ROM: ${rom.name}` : "No ROM loaded"}</p>
					</div>
					<div className="flex items-center gap-2 p-2 w-96">
						<div>Controls</div>
					</div>
				</div>
			</main>
			{buffer && (
				<DebugScreen
					memory={buffer.slice(0x000, 0x1400)}
					romData={romData}
					debug={chip8?.getDebug()}
				/>
			)}
		</div>
	);
}
