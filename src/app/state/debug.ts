import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type DebugState = {
	open: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	hideZeros: boolean; // hide zeros in memory buffer
	setOpen: (open: boolean) => void;
	setSize: (width: number, height: number) => void;
	setPosition: (x: number, y: number) => void;
	setHideZeros: (hide: boolean) => void;
};

const defaultPos = {
	open: false,
	x: 10,
	y: 10,
	width: 515,
	height: 600,
	hideZeros: false,
};
export const useDebugStore = create<DebugState>()(
	persist(
		devtools(
			(set) => ({
				...defaultPos,
				setOpen: (open) => {
					if (!open) return set(defaultPos);
					set({ open: true });
				},
				setSize: (width, height) => set({ width, height }),
				setPosition: (x, y) => set({ x, y }),
				setHideZeros: (hide) => set({ hideZeros: hide }),
			}),
			{ name: "Debug" },
		),
		{ name: "debug-store" },
	),
);
