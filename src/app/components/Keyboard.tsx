import {
	type PointerEvent,
	type TouchEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import type { Chip8Engine } from "../../types";
import { keyMap } from "../lib/keys";

// biome-ignore format: keep structure
const defaultLayout = {
    Key1: "1", Key2: "2", Key3: "3", Key4: "4",
    KeyQ: "Q", KeyW: "W", KeyE: "E", KeyR: "R",
    KeyA: "A", KeyS: "S", KeyD: "D", KeyF: "F",
    KeyZ: "Z", KeyX: "X", KeyC: "C", KeyV: "V",
} as const;

type KeyCode = keyof typeof defaultLayout;

// CHIP-8 index: 0 1 2 3 4 5 6 7 8 9 A B C D E F
// CHIP-8 hex:   1 2 3 C 4 5 6 D 7 8 9 E A 0 B F
const chip8IndexToKeyCode: Record<number, KeyCode> = {
	0: "KeyX", // 0
	1: "Key1", // 1
	2: "Key2", // 2
	3: "Key3", // 3
	4: "KeyQ", // 4
	5: "KeyW", // 5
	6: "KeyE", // 6
	7: "KeyA", // 7
	8: "KeyS", // 8
	9: "KeyD", // 9
	10: "KeyZ", // A
	11: "KeyC", // B
	12: "Key4", // C
	13: "KeyR", // D
	14: "KeyF", // E
	15: "KeyV", // F
};

// Visual layout matches CHIP-8 keypad
// biome-ignore format: keep structure
const rows: KeyCode[][] = [
    ["Key1", "Key2", "Key3", "Key4"], // 1 2 3 C
    ["KeyQ", "KeyW", "KeyE", "KeyR"], // 4 5 6 D
    ["KeyA", "KeyS", "KeyD", "KeyF"], // 7 8 9 E
    ["KeyZ", "KeyX", "KeyC", "KeyV"], // A 0 B F
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
	const handleTouchUp = (e: TouchEvent<HTMLButtonElement>) => {
		if (!chip8) return;
		const button = e.currentTarget as HTMLButtonElement;
		chip8.setKey(keyMap[button.dataset.key as string], false);
	};
	const handleTouchDown = (e: TouchEvent<HTMLButtonElement>) => {
		if (!chip8) return;
		const button = e.currentTarget as HTMLButtonElement;
		chip8.setKey(keyMap[button.dataset.key as string], true);
	};
	const handlePointerUp = (e: PointerEvent) => {
		if (!chip8) return;
		e.preventDefault();
		const button = e.currentTarget as HTMLButtonElement;
		chip8.setKey(keyMap[button.dataset.key as string], false);
	};
	const handlePointerDown = (e: PointerEvent) => {
		if (!chip8) return;
		e.preventDefault();
		const button = e.currentTarget as HTMLButtonElement;
		chip8.setKey(keyMap[button.dataset.key as string], true);
	};

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
			const keyBuffer = chip8.getKeyBuffer(); // Array of 16 booleans
			// Clear all highlights first
			(Object.keys(defaultLayout) as KeyCode[]).forEach((code) => {
				const el = keyRefs.current[code];
				if (el) {
					el.style.background = "";
					el.style.color = "";
				}
			});
			// Highlight based on buffer and lookup
			for (let i = 0; i < 16; i++) {
				if (keyBuffer[i]) {
					const code = chip8IndexToKeyCode[i];
					const el = keyRefs.current[code];
					if (el) {
						el.style.background = "#1c1917";
						el.style.color = "#f5f5f4";
					}
				}
			}
			rafId = requestAnimationFrame(frame);
		};
		rafId = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(rafId);
	}, [chip8]);

	return (
		<pre className="flex flex-col gap-1 p-2 text-2xl font-mono md:text-sm">
			{rows.map((row) => (
				<div key={row.join(",")} className="flex gap-1">
					{row.map((code) => (
						<button
							key={code}
							data-key={layout[code].toLowerCase()}
							type="button"
							onPointerDown={handlePointerDown}
							onPointerUp={handlePointerUp}
							onPointerLeave={handlePointerUp}
							onPointerCancel={handlePointerUp}
							onTouchStart={handleTouchDown}
							onTouchEnd={handleTouchUp}
							onTouchCancel={handleTouchUp}
							onTouchMove={(e) => e.preventDefault()} // Prevent scrolling
							ref={(el) => {
								keyRefs.current[code] = el;
							}}
							className="inline-block min-w-[1.5em] text-center rounded transition-colors duration-100"
						>
							{layout[code].toUpperCase()}
						</button>
					))}
				</div>
			))}
		</pre>
	);
};
