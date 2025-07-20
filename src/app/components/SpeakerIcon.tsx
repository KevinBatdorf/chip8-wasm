import { useEffect, useState } from "react";
import type { Chip8Engine, RomEntry } from "../../types";

type Props = { chip8: Chip8Engine | null; rom: RomEntry | null };

export const SpeakerIcon = ({ chip8, rom }: Props) => {
	const buzzColor =
		rom?.options?.buzzColor ?? rom?.options?.fillColor ?? "#E12BFB";
	const [active, setActive] = useState(false);

	useEffect(() => {
		if (!chip8) return;
		let rafId: number;
		const check = () => {
			setActive(chip8.getSoundTimer() !== 0);
			rafId = requestAnimationFrame(check);
		};
		rafId = requestAnimationFrame(check);
		return () => cancelAnimationFrame(rafId);
	}, [chip8]);

	return (
		<div className="text-stone-500">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke={active ? buzzColor : "currentColor"}
				className="size-6"
				style={{
					transform: active ? "scale(1.25)" : "scale(1)",
					transition: "transform 0.15s, stroke 0.15s",
				}}
			>
				<title>Speaker</title>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
				/>
			</svg>
		</div>
	);
};
