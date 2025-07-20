import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { RomEntry } from "../../types";

type Chip8State = {
	scale: number;
	sound: boolean;
	favorites: RomEntry["name"][];
	setScale: (scale: number | ((prev: number) => number)) => void;
	setSound: (sound: boolean) => void;
	toggleFavorite: (rom: RomEntry) => void;
};

const defaults = {
	scale: 10,
	sound: false,
	favorites: [
		"Glitch Ghost",
		"Slippery Slope",
		"down8",
		"Br8kout",
		"Cave Explorer",
		"Mini Lights Out",
	] as RomEntry["name"][],
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
				setSound: (sound) => set({ sound }),
				toggleFavorite: (rom) => {
					set((state) => {
						const favorites = state.favorites.some((f) => f === rom.name)
							? state.favorites.filter((f) => f !== rom.name)
							: [...state.favorites, rom.name];
						return { favorites };
					});
				},
			}),
			{ name: "Chip8" },
		),
		{ name: "chip8-store" },
	),
);
