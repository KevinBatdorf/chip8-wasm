import { useEffect, useRef } from "react";
import { FX0A_VX_ADDRESS } from "../../../core/constants";
import type { Chip8Debug, Chip8Engine } from "../../../types";

type Props = {
	chip8?: Chip8Engine | null;
	debug: Chip8Debug | null;
	hideZeros?: boolean;
};

export const KeyWait = ({ chip8, debug, hideZeros }: Props) => {
	const cellRef = useRef<HTMLSpanElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!chip8 || !debug) return;
		let rafId: number;
		const frame = () => {
			if (!cellRef.current) return;
			const mem = new Uint8Array(chip8.getMemory().buffer);
			let value = mem[FX0A_VX_ADDRESS]
				.toString(16)
				.padStart(2, "0")
				.toUpperCase();
			value = hideZeros && value === "00" ? "" : value;
			const curr = cellRef.current.textContent;
			if (curr !== value) {
				cellRef.current.textContent = value;
			}
			rafId = requestAnimationFrame(frame);
		};
		rafId = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(rafId);
	}, [chip8, debug, hideZeros]);

	return (
		<div ref={gridRef} className="font-mono text-xs flex flex-wrap gap-px">
			<span
				title={`0x${FX0A_VX_ADDRESS.toString(16).padStart(4, "0").toUpperCase()}`}
				ref={(el) => {
					if (!el) return;
					cellRef.current = el;
				}}
				className="cell keyWait"
			/>
		</div>
	);
};
