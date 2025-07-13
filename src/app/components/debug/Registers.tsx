import { useEffect, useRef } from "react";
import { REGISTERS_OFFSET } from "../../../core/constants";
import type { Chip8Debug, Chip8Engine } from "../../../runtime/engine";

type Props = {
	chip8?: Chip8Engine | null;
	debug: Chip8Debug | null;
	hideZeros?: boolean;
};

export const Registers = ({ chip8, debug, hideZeros }: Props) => {
	const cellRefs = useRef<HTMLSpanElement[]>([]);
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!chip8 || !debug) return;
		let rafId: number;
		const frame = () => {
			const mem = new Uint8Array(chip8.getMemory().buffer);
			for (let i = 0; i < 16; i++) {
				if (!cellRefs.current[i]) continue;
				let value = mem[REGISTERS_OFFSET + i]
					.toString(16)
					.padStart(2, "0")
					.toUpperCase();
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
			{Array.from({ length: 16 }).map((_, i) => {
				const loc = i.toString(16).toUpperCase();
				return (
					<span
						key={loc}
						title={`V${loc}`}
						data-index={i}
						ref={(el) => {
							if (!el) return;
							cellRefs.current[i] = el;
						}}
						className="cell register"
					/>
				);
			})}
		</div>
	);
};
