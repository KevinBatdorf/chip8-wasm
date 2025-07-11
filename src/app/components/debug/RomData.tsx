import { useEffect, useRef, useState } from "react";
import { ROM_LOAD_ADDRESS, TIMER_INTERVAL } from "../../../core/constants";
import type { Chip8Debug, Chip8Engine } from "../../../runtime/engine";

type Props = {
	chip8?: Chip8Engine | null;
	debug: Chip8Debug | null;
};
export const RomData = ({ chip8, debug }: Props) => {
	const cellRefs = useRef<HTMLSpanElement[]>([]);
	const gridRef = useRef<HTMLDivElement>(null);
	const [buffer, setBuffer] = useState<Uint8Array>(new Uint8Array(0));

	useEffect(() => {
		if (!chip8 || !debug) return;
		let lastUpdate = performance.now();
		let rafId: number;
		const frame = (now: number) => {
			if (now - lastUpdate >= TIMER_INTERVAL) {
				lastUpdate = now;
				const mem = new Uint8Array(chip8.getMemory().buffer);
				const pc = debug.getPC();
				const romLength = debug?.getROM()?.length ?? 0;
				const buffer = new Uint8Array(mem.buffer).slice(
					ROM_LOAD_ADDRESS,
					ROM_LOAD_ADDRESS + romLength,
				);
				setBuffer(new Uint8Array(buffer.length));
				if (cellRefs.current.length !== romLength) {
					// Initialize cellRefs if not already done
					cellRefs.current = Array(romLength).fill(null);
				}
				for (let i = 0; i < romLength; i++) {
					if (!cellRefs.current[i]) continue;
					// Check for pc
					const hasPCClass = cellRefs.current[i].classList.contains("pc");
					const pcOffset = i + ROM_LOAD_ADDRESS;
					if ([pc, pc + 1].includes(pcOffset) && !hasPCClass)
						cellRefs.current[i].classList.add("pc");
					else if (![pc, pc + 1].includes(pcOffset) && hasPCClass)
						cellRefs.current[i].classList.remove("pc");
					let value = mem[ROM_LOAD_ADDRESS + i]
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

	return (
		<div ref={gridRef} className="font-mono text-xs flex flex-wrap gap-px">
			{Array.from({ length: buffer.length }).map((_, i) => {
				const loc = `0x${(ROM_LOAD_ADDRESS + i).toString(16).padStart(4, "0")}`;
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
						className="cell rom"
					>
						{value !== "00" ? value : ""}
					</span>
				);
			})}
		</div>
	);
};
