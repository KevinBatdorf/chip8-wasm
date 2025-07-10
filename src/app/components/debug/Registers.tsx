import { useEffect, useRef } from "react";
import { REGISTERS_OFFSET, TIMER_INTERVAL } from "../../../core/constants";
import type { Chip8Debug, Chip8Engine } from "../../../runtime/engine";

type Props = {
	chip8?: Chip8Engine | null;
	debug: Chip8Debug | null;
};

export const Registers = ({ chip8, debug }: Props) => {
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
				for (let i = 0; i < 16; i++) {
					if (!cellRefs.current[i]) continue;
					let value = mem[REGISTERS_OFFSET + i]
						.toString(16)
						.padStart(2, "0")
						.toUpperCase();
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
	const buffer = new Uint8Array(memory.buffer).slice(
		REGISTERS_OFFSET,
		REGISTERS_OFFSET + 16,
	);
	if (cellRefs.current.length !== 16) {
		cellRefs.current = Array(16).fill(null);
	}

	return (
		<div ref={gridRef} className="font-mono text-xs flex flex-wrap gap-px px-2">
			{Array.from({ length: 16 }).map((_, i) => {
				const loc = `V${i.toString(16).toUpperCase()}`;
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
						className="cell register"
					>
						{value !== "00" ? value : ""}
					</span>
				);
			})}
		</div>
	);
};
