import { useEffect, useState } from "react";
import { type Chip8Engine, createChip8Engine } from "..";
import { DebugScreen } from "./components/DebugScreen";
import { RomSelect } from "./components/RomSelect";
import { getRom, getWasm } from "./helpers";
import { keyMap } from "./lib/keys";

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
				0x60,
				0x00, // V0 = 0 (X)
				0x61,
				0x00, // V1 = 0 (Y)
				0x6a,
				0x0a, // VA = 0xA (digit)
				0xfa,
				0x29, // I = address of sprite for digit in VA
				0xd0,
				0x05, // draw sprite at (V0, V1), 5 bytes tall
			]);
			chip8.loadROM(romD);
			return;
		}
		getRom(`/roms/${rom.file}`).then((bytes) => {
			chip8.loadROM(bytes);
			chip8.start();
		});
	}, [chip8, rom]);

	useEffect(() => {
		if (!chip8) return;
		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.altKey || e.ctrlKey || e.metaKey) return;
			const key = e.key.toLowerCase();
			if (key in keyMap) {
				e.preventDefault();
				chip8.setKey(keyMap[key], false);
			}
		};
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.altKey || e.ctrlKey || e.metaKey) return;
			const key = e.key.toLowerCase();
			if (key in keyMap) {
				e.preventDefault();
				chip8.setKey(keyMap[key], true);
			}
		};
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [chip8]);

	return (
		<div className="flex">
			<aside className="flex-shrink-0 p-0 text-sm">
				<RomSelect currentRom={rom?.file ?? null} onSelect={setRom} />
			</aside>
			<main className="font-mono flex-1 text-sm">
				<div className="sticky top-0 z-10 bg-stone-200 text-black flex-grow min-h-screen w-full">
					<div className="flex items-center justify-center gap-2 p-2 flex-grow">
						<h1>CHIP-8 Emulator</h1>
						<p>{rom?.name ? `Loaded ROM: ${rom.name}` : "No ROM loaded"}</p>
					</div>
				</div>
			</main>
			<DebugScreen rom={rom} debug={chip8?.getDebug() ?? null} chip8={chip8} />
		</div>
	);
}
