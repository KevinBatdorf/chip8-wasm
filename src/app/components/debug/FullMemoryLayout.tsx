import clsx from "clsx";
import { useEffect, useRef } from "react";
import {
	DELAY_TIMER_OFFSET,
	DISPLAY_OFFSET,
	I_OFFSET,
	KEY_BUFFER_OFFSET,
	PC_OFFSET,
	REGISTERS_OFFSET,
	ROM_LOAD_ADDRESS,
	SOUND_TIMER_OFFSET,
	STACK_OFFSET,
	STACK_PTR_OFFSET,
	TIMER_INTERVAL,
} from "../../../core/constants";
import type { Chip8Debug, Chip8Engine } from "../../../runtime/engine";

type Props = {
	chip8?: Chip8Engine | null;
	debug: Chip8Debug | null;
};
export const FullMemoryLayout = ({ chip8, debug }: Props) => {
	const cellRefs = useRef<HTMLSpanElement[]>([]);
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!chip8 || !debug) return;
		let lastUpdate = performance.now();
		let rafId: number;
		const frame = (now: number) => {
			if (now - lastUpdate >= TIMER_INTERVAL) {
				lastUpdate = now;
				const mem = new Uint8Array(chip8.getMemory().buffer);
				// remove pc class
				const rom = debug?.getROM();
				const pc = debug.getPC();
				for (let i = 0x000; i < 0x1400; i++) {
					if (!cellRefs.current[i]) continue;
					// Check for rom
					const isRom =
						i >= ROM_LOAD_ADDRESS && i < ROM_LOAD_ADDRESS + (rom?.length ?? 0);
					const hasRomClass = cellRefs.current[i].classList.contains("rom");
					if (isRom && !hasRomClass) cellRefs.current[i].classList.add("rom");
					else if (!isRom && hasRomClass)
						cellRefs.current[i].classList.remove("rom");

					// Check for PC
					const hasPCClass = cellRefs.current[i].classList.contains("pc");
					if ([pc, pc + 1].includes(i) && !hasPCClass)
						cellRefs.current[i].classList.add("pc");
					else if (![pc, pc + 1].includes(i) && hasPCClass)
						cellRefs.current[i].classList.remove("pc");

					let value = mem[i].toString(16).padStart(2, "0").toUpperCase();
					value = value !== "00" ? value : "";
					if (cellRefs.current[i].textContent === value) continue;
					cellRefs.current[i].textContent = value;
				}
			}
			rafId = requestAnimationFrame(frame);
		};
		rafId = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(rafId);
	}, [chip8, debug]);

	const memory = chip8?.getMemory();
	if (!memory) return null;
	const buffer = new Uint8Array(memory.buffer).slice(0x000, 0x1400);
	if (cellRefs.current.length !== 0x1400) {
		cellRefs.current = Array(0x1400).fill(null);
	}

	return (
		<div ref={gridRef} className="font-mono text-xs flex flex-wrap gap-px px-2">
			{Array.from({ length: 0x1400 }).map((_, i) => {
				const loc = `0x${i.toString(16).padStart(4, "0")}`;
				const isReg = i >= REGISTERS_OFFSET && i < REGISTERS_OFFSET + 16;
				const isDisplay = i >= DISPLAY_OFFSET && i < DISPLAY_OFFSET + 256;
				const isKeyBuffer =
					i >= KEY_BUFFER_OFFSET && i < KEY_BUFFER_OFFSET + 16;
				const isStack = i >= STACK_OFFSET && i < STACK_OFFSET + 32;
				const isStackPtr = i === STACK_PTR_OFFSET;
				const isDelayTimer = i === DELAY_TIMER_OFFSET;
				const isSoundTimer = i === SOUND_TIMER_OFFSET;
				const isPC = i >= PC_OFFSET && i < PC_OFFSET + 2;
				const isI = i >= I_OFFSET && i < I_OFFSET + 2;
				const value = buffer[i].toString(16).padStart(2, "0").toUpperCase();
				return (
					<span
						key={loc}
						title={loc}
						data-index={i}
						ref={(el) => {
							if (!el) return;
							cellRefs.current[i] = el;
						}}
						className={clsx("cell", {
							register: isReg,
							display: isDisplay,
							keyBuffer: isKeyBuffer,
							stack: isStack,
							stackPtr: isStackPtr,
							delayTimer: isDelayTimer,
							soundTimer: isSoundTimer,
							pcRegister: isPC,
							iRegister: isI,
						})}
					>
						{value !== "00" ? value : ""}
					</span>
				);
			})}
		</div>
	);
};
