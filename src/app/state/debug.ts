import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type DebugState = {
	open: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	setOpen: (open: boolean) => void;
	setSize: (width: number, height: number) => void;
	setPosition: (x: number, y: number) => void;
};

const defaultPos = { open: false, x: 10, y: 10, width: 515, height: 600 };
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
			}),
			{ name: "Debug" },
		),
		{ name: "debug-store" },
	),
);
