import clsx from "clsx";
import { useEffect, useState } from "react";
import { type Chip8Engine, createChip8Engine } from "..";
import type { RomEntry } from "../types";
import { Chip8 } from "./components/Chip8";
import { DebugScreen } from "./components/DebugScreen";
import { ErrorMsg } from "./components/ErrorMsg";
import { Keyboard } from "./components/Keyboard";
import { RomDetails } from "./components/RomDetails";
import { RomSelect } from "./components/RomSelect";
import { SpeakerIcon } from "./components/SpeakerIcon";
import { getRom, getWasm } from "./helpers";
import { keyMap } from "./lib/keys";
import { useChip8Store } from "./state/chip8";

export default function App() {
	const [chip8, setChip8] = useState<Chip8Engine | null>(null);
	const [rom, setRom] = useState<RomEntry | null>(null);
	const [hovering, setHovering] = useState(false);
	const { scale, setScale, sound, setSound } = useChip8Store();

	useEffect(() => {
		getWasm("/chip8.wasm").then((wasmBinary) => {
			createChip8Engine(wasmBinary).then(setChip8);
		});
	}, []);

	useEffect(() => {
		if (!chip8 || !rom) return;
		getRom(rom.path).then((bytes) => {
			chip8.loadROM(bytes, rom.options);
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
					<div className="flex flex-col items-center gap-2">
						<h1 className="text-center mt-3">CHIP-8 Emulator</h1>
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://github.com/KevinBatdorf/chip8-wasm"
							className="text-xs text-gray-500 hover:text-fuchsia-500 transition-colors duration-200"
						>
							(GitHub)
						</a>
					</div>
					<pre
						className="flex flex-col gap-1 items-center p-2"
						onFocus={() => setHovering(true)}
						onBlur={() => setHovering(false)}
						onMouseEnter={() => setHovering(true)}
						onMouseMove={() => setHovering(true)}
					>
						<div
							className="flex justify-between w-full whitespace-break-spaces"
							style={{ maxWidth: 64 * scale }}
						>
							<RomDetails rom={rom} />
						</div>
						<Chip8
							rom={rom}
							scale={scale}
							chip8={chip8}
							onFrame={chip8?.onFrame}
						/>
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
							<div className="flex gap-4">
								<button
									type="button"
									onClick={() => {
										chip8?.reset();
										chip8?.start();
									}}
								>
									Reset
								</button>
								<button type="button" onClick={() => setSound(!sound)}>
									{sound ? "Mute" : "Unmute"}
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
					</pre>
					<div
						className="flex flex-col gap-2 justify-between flex-grow text-pretty items-center whitespace-break-spaces w-full mx-auto pb-2"
						style={{ maxWidth: 64 * scale }}
					>
						<ErrorMsg chip8={chip8} />
						<div className="flex flex-col items-center text-center gap-2">
							<div>Game Description:</div>
							<div>{rom?.description || "No description available"}</div>
						</div>
						<div className="flex flex-col items-center gap-2">
							<Keyboard chip8={chip8} />
							<p className="text-xs">
								Chip-8 Uses these keys, but each game has their own controls.
							</p>
						</div>
					</div>
				</div>
			</main>
			<DebugScreen rom={rom} debug={chip8?.getDebug() ?? null} chip8={chip8} />
			<div className="fixed top-0 right-0 p-2">
				<SpeakerIcon chip8={chip8} rom={rom} />
			</div>
		</div>
	);
}
