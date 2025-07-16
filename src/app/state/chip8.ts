import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type Chip8State = {
	scale: number;
	setScale: (scale: number | ((prev: number) => number)) => void;
};

const defaults = {
	scale: 10,
};
export const useChip8Store = create<Chip8State>()(
	persist(
		devtools(
			(set) => ({
				...defaults,
				setScale: (scale) => {
					if (typeof scale === "function") {
						set(({ scale: s }) => ({ scale: scale(s) }));
						return;
					}
					set({ scale });
				},
			}),
			{ name: "Chip8" },
		),
		{ name: "chip8-store" },
	),
);
