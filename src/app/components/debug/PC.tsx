import { useEffect, useRef } from "react";
import { PC_OFFSET, TIMER_INTERVAL } from "../../../core/constants";
import type { Chip8Debug, Chip8Engine } from "../../../runtime/engine";

type Props = {
	chip8?: Chip8Engine | null;
	debug: Chip8Debug | null;
};

export const PC = ({ chip8, debug }: Props) => {
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
				for (let i = 0; i < 2; i++) {
					if (!cellRefs.current[i]) continue;
					const value = mem[PC_OFFSET + i]
						.toString(16)
						.padStart(2, "0")
						.toUpperCase();
					const curr = cellRefs.current[i].textContent;
					if (curr === value) continue;
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
			{Array.from({ length: 2 })
				.map((_, i) => {
					const loc = `V${i.toString(16).toUpperCase()}`;
					return (
						<span
							key={loc}
							title={loc}
							data-index={i}
							ref={(el) => {
								if (!el) return;
								cellRefs.current[i] = el;
							}}
							className="cell pcRegister"
						/>
					);
				})
				.toReversed()}
		</div>
	);
};
