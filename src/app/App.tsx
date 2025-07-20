import clsx from "clsx";
import { useEffect, useState } from "react";
import { type Chip8Engine, createChip8Engine } from "..";
import type { RomEntry } from "../types";
import { Chip8 } from "./components/Chip8";
import { DebugScreen } from "./components/DebugScreen";
import { RomSelect } from "./components/RomSelect";
import { getRom, getWasm } from "./helpers";
import { keyMap } from "./lib/keys";
import { useChip8Store } from "./state/chip8";

export default function App() {
	const [chip8, setChip8] = useState<Chip8Engine | null>(null);
	const [rom, setRom] = useState<RomEntry | null>(null);
	const [hovering, setHovering] = useState(false);
	const { scale, setScale } = useChip8Store();

	useEffect(() => {
		getWasm("/chip8.wasm").then((wasmBinary) => {
			createChip8Engine(wasmBinary).then(setChip8);
		});
	}, []);

	useEffect(() => {
		if (!chip8) return;
		if (!rom) {
			// setRom({ name: "Test", path: "roms/test.ch8" }); // for testing
			return;
		}
		// 		if (rom.path === "roms/test.ch8") {
		// 			// biome-ignore format: keep structure
		// 			const rom = new Uint8Array([
		//   0x00, 0xFE, 0x22, 0x14, 0x22, 0x1A, 0x22, 0x1A,
		//   0x22, 0x20, 0x22, 0x1A, 0x60, 0x01, 0xF0, 0x15,
		//   0x22, 0x42, 0x12, 0x06, 0x63, 0x20, 0x64, 0x19,
		//   0x00, 0xEE, 0xA2, 0x4A, 0xD3, 0x46, 0x00, 0xEE,
		//   0x60, 0x08, 0xE0, 0x9E, 0x12, 0x28, 0x74, 0x01,
		//   0x60, 0x05, 0xE0, 0x9E, 0x12, 0x30, 0x74, 0xFF,
		//   0x60, 0x07, 0xE0, 0x9E, 0x12, 0x38, 0x73, 0xFF,
		//   0x60, 0x09, 0xE0, 0x9E, 0x12, 0x40, 0x73, 0x01,
		//   0x00, 0xEE, 0xF0, 0x07, 0x30, 0x00, 0x12, 0x42,
		//   0x00, 0xEE, 0x3C, 0x18, 0xFF, 0x18, 0x24, 0xE7,
		// ]);

		// 			chip8.loadROM(rom, {
		// 				clipQuirks: false,
		// 				vBlankQuirks: false,
		// 			});
		// 			chip8.step();
		// 			chip8.step();
		// 			chip8.step();
		// 			chip8.step();
		// 			chip8.step();
		// 			return;
		// 		}

		getRom(rom.path).then((bytes) => {
			chip8.loadROM(bytes);
			chip8.start();
		});
	}, [chip8, rom]);

	useEffect(() => {
		if (!chip8 || !hovering) return;
		const id = setTimeout(() => {
			setHovering(false);
		}, 5_000);
		return () => clearTimeout(id);
	}, [hovering, chip8]);

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
			<aside className="flex-shrink-0 p-0 text-sm max-w-46 w-full">
				<RomSelect currentRom={rom} onSelect={setRom} />
			</aside>
			<main className="font-mono flex-1 text-sm bg-stone-200 text-black">
				<div className="sticky top-0 z-10 flex-grow min-h-screen w-full flex flex-col gap-16">
					<h1 className="text-center mt-3">CHIP-8 Emulator</h1>
					<div
						className="flex flex-col gap-1 items-center p-2"
						onMouseEnter={() => setHovering(true)}
						onMouseMove={() => setHovering(true)}
					>
						<div
							className="flex justify-between w-full"
							style={{ maxWidth: 64 * scale }}
						>
							<div>{rom ? rom.name : "Select a ROM"}</div>
						</div>
						<Chip8 scale={scale} chip8={chip8} onFrame={chip8?.onFrame} />
						<div
							className={clsx(
								"flex justify-between w-full transition-opacity duration-300",
								{
									"opacity-0": !hovering,
									"opacity-100": hovering,
								},
							)}
							style={{ maxWidth: 64 * scale }}
						>
							<div>
								<button
									type="button"
									onClick={() => {
										chip8?.reset();
										chip8?.start();
									}}
								>
									Reset
								</button>
							</div>
							<div className="flex gap-1">
								<button
									type="button"
									onClick={() => setScale((i) => (i + 5 > 15 ? 5 : i + 5))}
								>
									{scale / 5}x
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
			<DebugScreen rom={rom} debug={chip8?.getDebug() ?? null} chip8={chip8} />
		</div>
	);
}
