import { useEffect, useState } from "react";
import { type Chip8Engine, createChip8Engine } from "..";
import { DebugScreen } from "./components/DebugScreen";
import { RomSelect } from "./components/RomSelect";
import { getRom, getWasm } from "./helpers";

export default function App() {
	const [chip8, setChip8] = useState<Chip8Engine | null>(null);
	const [rom, setRom] = useState<{ name: string; file: string } | null>(null);

	useEffect(() => {
		getWasm("/chip8.wasm").then((wasmBinary) => {
			createChip8Engine(wasmBinary).then(setChip8);
		});
	}, []);

	useEffect(() => {
		if (!chip8) return;
		if (!rom) {
			setRom({ name: "Test", file: "test.ch8" }); // for testing
			return;
		}
		if (rom.file === "test.ch8") {
			const romD = new Uint8Array([
				0x6a,
				0x12, // 6A12: V[A] = 0x12
				0x6b,
				0x12, // 6B12: V[B] = 0x12
				0x5a,
				0xb0, // 5AB0: if V[A] === V[B], skip next
				0x6c,
				0x99, // 6C99: V[C] = 0x99 (should be skipped)
				0x6c,
				0x34, // 6C34: V[C] = 0x34 (should execute)
			]);
			chip8.loadROM(romD);
			return;
		}
		getRom(`/roms/${rom.file}`).then((bytes) => {
			chip8.loadROM(bytes);
			chip8.start();
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
			<DebugScreen rom={rom} debug={chip8?.getDebug() ?? null} chip8={chip8} />
		</div>
	);
}
