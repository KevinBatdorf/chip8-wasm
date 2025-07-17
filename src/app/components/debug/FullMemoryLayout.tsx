import clsx from "clsx";
import { useEffect, useRef } from "react";
import {
	DELAY_TIMER_ADDRESS,
	DISPLAY_ADDRESS,
	I_ADDRESS,
	KEY_BUFFER_ADDRESS,
	PC_ADDRESS,
	REGISTERS_ADDRESS,
	ROM_LOAD_ADDRESS,
	SOUND_TIMER_ADDRESS,
	STACK_ADDRESS,
	STACK_PTR_ADDRESS,
} from "../../../core/constants";
import type { Chip8Debug, Chip8Engine } from "../../../types";

type Props = {
	chip8?: Chip8Engine | null;
	debug: Chip8Debug | null;
	hideZeros: boolean;
};

const END_OF_MEMORY = REGISTERS_ADDRESS + 0x0f;

export const FullMemoryLayout = ({ chip8, debug, hideZeros }: Props) => {
	const cellRefs = useRef<HTMLSpanElement[]>([]);
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!chip8 || !debug) return;
		let rafId: number;
		const frame = () => {
			const mem = new Uint8Array(chip8.getMemory().buffer);
			// remove pc class
			const rom = debug?.getROM();
			const pc = debug.getPC();
			for (let i = 0x000; i < END_OF_MEMORY; i++) {
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
				value = hideZeros && value === "00" ? "" : value;
				const curr = cellRefs.current[i].textContent;
				if (curr === value) continue;
				cellRefs.current[i].textContent = value;
			}
			rafId = requestAnimationFrame(frame);
		};
		rafId = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(rafId);
	}, [chip8, debug, hideZeros]);

	return (
		<div ref={gridRef} className="font-mono text-xs flex flex-wrap gap-px">
			{Array.from({ length: END_OF_MEMORY })
				.map((_, i) => {
					const loc = `0x${i.toString(16).padStart(4, "0").toUpperCase()}`;
					const isReg = i >= REGISTERS_ADDRESS && i < END_OF_MEMORY;
					const isDisplay = i >= DISPLAY_ADDRESS && i < DISPLAY_ADDRESS + 256;
					const isKeyBuffer =
						i >= KEY_BUFFER_ADDRESS && i < KEY_BUFFER_ADDRESS + 16;
					const isStack = i >= STACK_ADDRESS && i < STACK_ADDRESS + 32;
					const isStackPtr = i === STACK_PTR_ADDRESS;
					const isDelayTimer = i === DELAY_TIMER_ADDRESS;
					const isSoundTimer = i === SOUND_TIMER_ADDRESS;
					const isPC = i >= PC_ADDRESS && i < PC_ADDRESS + 2;
					const isI = i >= I_ADDRESS && i < I_ADDRESS + 2;
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
						/>
					);
				})
				.slice(ROM_LOAD_ADDRESS, END_OF_MEMORY)}
		</div>
	);
};
