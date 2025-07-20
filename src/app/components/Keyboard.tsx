import { useEffect, useRef, useState } from "react";
import type { Chip8Engine } from "../../types";

// biome-ignore format: disable
const defaultLayout = {
  Key1: "1", Key2: "2", Key3: "3", Key4: "4",
  KeyQ: "Q", KeyW: "W", KeyE: "E", KeyR: "R",
  KeyA: "A", KeyS: "S", KeyD: "D", KeyF: "F",
  KeyZ: "Z", KeyX: "X", KeyC: "C", KeyV: "V",
} as const;

type KeyCode = keyof typeof defaultLayout;

// biome-ignore format: keep structure
const rows: KeyCode[][] = [
  ["Key1", "Key2", "Key3", "Key4"],
  ["KeyQ", "KeyW", "KeyE", "KeyR"],
  ["KeyA", "KeyS", "KeyD", "KeyF"],
  ["KeyZ", "KeyX", "KeyC", "KeyV"],
];

type Props = {
	chip8: Chip8Engine | null;
};

export const Keyboard = ({ chip8 }: Props) => {
	const [layout, setLayout] = useState<Record<KeyCode, string>>(defaultLayout);
	// biome-ignore format: keep structure
	const keyRefs = useRef<Record<KeyCode, HTMLSpanElement | null>>({
    Key1: null, Key2: null, Key3: null, Key4: null,
    KeyQ: null, KeyW: null, KeyE: null, KeyR: null,
    KeyA: null, KeyS: null, KeyD: null, KeyF: null,
    KeyZ: null, KeyX: null, KeyC: null, KeyV: null,
  });

	useEffect(() => {
		const nav = navigator as any;
		if (!nav.keyboard || !nav.keyboard.getLayoutMap) return;
		nav.keyboard
			.getLayoutMap()
			.then((layoutMap: any) => {
				const newLayout = {} as Record<KeyCode, string>;
				(Object.keys(defaultLayout) as KeyCode[]).forEach((code) => {
					newLayout[code] = layoutMap.get(code) || defaultLayout[code];
				});
				setLayout(newLayout);
			})
			.catch(() => setLayout(defaultLayout));
	}, []);

	useEffect(() => {
		if (!chip8) return;
		let rafId: number;
		const frame = () => {
			const keyBuffer = chip8.getKeyBuffer();
			(Object.keys(defaultLayout) as KeyCode[]).forEach((code, i) => {
				const el = keyRefs.current[code];
				if (!el) return;
				if (keyBuffer[i]) {
					el.style.background = "#1c1917";
					el.style.color = "#f5f5f4";
				} else {
					el.style.background = "";
					el.style.color = "";
				}
			});
			rafId = requestAnimationFrame(frame);
		};
		rafId = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(rafId);
	}, [chip8]);

	return (
		<pre style={{ fontFamily: "inherit" }}>
			{rows.map((row) => (
				<div key={row.join(",")} className="flex gap-1">
					{row.map((code) => (
						<span
							key={code}
							ref={(el) => {
								keyRefs.current[code] = el;
							}}
							className="inline-block min-w-[1.5em] text-center rounded transition-colors duration-100"
						>
							{layout[code].toUpperCase()}
						</span>
					))}
				</div>
			))}
		</pre>
	);
};
