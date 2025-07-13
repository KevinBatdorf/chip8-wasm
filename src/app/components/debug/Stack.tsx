import { useEffect, useRef } from "react";
import { STACK_OFFSET } from "../../../core/constants";
import type { Chip8Debug, Chip8Engine } from "../../../runtime/engine";

type Props = {
	chip8?: Chip8Engine | null;
	debug: Chip8Debug | null;
	hideZeros: boolean;
};

export const Stack = ({ chip8, debug, hideZeros }: Props) => {
	const cellRefs = useRef<HTMLSpanElement[]>([]);
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!chip8 || !debug) return;
		let rafId: number;
		const frame = () => {
			const mem = new Uint8Array(chip8.getMemory().buffer);
			const stackPtr = debug.getStackPointer();
			for (let i = 0; i < 32; i++) {
				const el = cellRefs.current[i];
				if (!el) continue;
				const addr = STACK_OFFSET + i;
				const hasSPtrCls = el.classList.contains("stackPtr");
				if ([stackPtr, stackPtr + 1].includes(i) && !hasSPtrCls)
					el.classList.add("stackPtr");
				else if (![stackPtr, stackPtr + 1].includes(i) && hasSPtrCls)
					el.classList.remove("stackPtr");
				let value = mem[addr].toString(16).padStart(2, "0").toUpperCase();
				value = hideZeros && value === "00" ? "" : value;
				const curr = el.textContent;
				if (curr === value) continue;
				el.textContent = value;
			}
			rafId = requestAnimationFrame(frame);
		};
		rafId = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(rafId);
	}, [chip8, debug, hideZeros]);

	return (
		<div ref={gridRef} className="font-mono text-xs flex flex-wrap gap-px">
			{Array.from({ length: 32 })
				.reduce((acc: [number, number][], _, i) => {
					if (i % 2 !== 0) return acc;
					const hi = STACK_OFFSET + i;
					const lo = STACK_OFFSET + i + 1;
					acc.push([lo, hi]);
					return acc;
				}, [])
				.flatMap(([first, second]) =>
					[first, second].map((addr) => {
						const loc = addr.toString(16).padStart(4, "0").toUpperCase();
						return (
							<span
								key={loc}
								title={`0x${loc}`}
								data-index={addr - STACK_OFFSET}
								ref={(el) => {
									if (!el) return;
									cellRefs.current[addr - STACK_OFFSET] = el;
								}}
								className="cell stack"
							/>
						);
					}),
				)}
		</div>
	);
};
