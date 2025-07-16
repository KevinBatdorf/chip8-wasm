import { useEffect, useState } from "react";
import { type Chip8Engine, createChip8Engine } from "..";
import { DebugScreen } from "./components/DebugScreen";
import { Display } from "./components/Display";
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
				0x00, // V0 = 0
				0x61,
				0x00, // V1 = 0
				0x6a,
				0x02, // VA = 2 (digit 2)
				0xfa,
				0x29, // I = sprite for 2
				0xd0,
				0x05, // draw 2 at (0, 0)

				0x61,
				0x05, // V1 = 5 (move Y to avoid overlap)
				0x6a,
				0x01, // VA = 1
				0xfa,
				0x29, // I = sprite for 1
				0xd0,
				0x05, // draw 1 at (0, 5)
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
				// @ts-ignore
				e.target?.blur?.();
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
			<main className="font-mono flex-1 text-sm bg-stone-200 text-black">
				<div className="sticky top-0 z-10 flex-grow min-h-screen w-full flex flex-col gap-16">
					<h1 className="text-center mt-3">CHIP-8 Emulator</h1>
					<div className="flex justify-center p-2 flex-grow">
						<Display onFrame={chip8?.onFrame} />
					</div>
				</div>
			</main>
			<DebugScreen rom={rom} debug={chip8?.getDebug() ?? null} chip8={chip8} />
		</div>
	);
}
