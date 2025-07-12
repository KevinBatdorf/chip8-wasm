import { useRef } from "react";
import type { Chip8Debug, Chip8Engine } from "../..";
import { useDraggable } from "../hooks/useDraggable";
import { usePortal } from "../hooks/usePortal";
import { useResizable } from "../hooks/useResizable";
import { useDebugStore } from "../state/debug";
import { FloatingWindow } from "./FloatingWindow";
import { Controls } from "./debug/Controls";
import { FullMemoryLayout } from "./debug/FullMemoryLayout";
import { PC } from "./debug/PC";
import { Registers } from "./debug/Registers";
import { Stack } from "./debug/Stack";

type Props = {
	rom?: { name: string; file: string } | null;
	debug: Chip8Debug | null;
	chip8: Chip8Engine | null;
};

export const DebugScreen = ({ debug, chip8, rom }: Props) => {
	const {
		x: top,
		y: left,
		width,
		height,
		open,
		setOpen,
		setPosition,
		setSize,
	} = useDebugStore();
	const ref = useRef<HTMLDivElement>(null);
	const mountNode = usePortal("debug-mount");
	useDraggable({
		ref,
		open,
		initialPosition: { x: top, y: left },
		onDragEnd: (x: number, y: number) => {
			setPosition(x, y);
		},
	});
	useResizable({
		ref,
		open,
		initialSize: { width, height },
		onResizeEnd: (width: number, height: number) => {
			setSize(width, height);
		},
	});

	if (!mountNode) return null;

	return (
		<>
			<button
				type="button"
				className="text-lg fixed z-40 bottom-2 right-2 leading-none hidden lg:block select-none"
				aria-label="Open Debug Screen"
				onClick={() => setOpen(!open)}
			>
				π
			</button>

			<FloatingWindow
				open={open}
				label="Secret Debug Screen"
				top={top}
				left={left}
				width={width}
				height={height}
				setOpen={setOpen}
				mountNode={mountNode}
				ref={ref}
			>
				<div className="flex flex-col gap-4 text-sm overflow-hidden h-full">
					<div className="px-2.5 mt-4">
						<Controls rom={rom} chip8={chip8} />
					</div>
					<div className="flex flex-col gap-4 overflow-y-auto overflow-x-scroll h-full cursor-default">
						<div className="flex flex-wrap gap-4 px-2.5">
							<div className="flex flex-col">
								<div className="">Registers</div>
								<Registers chip8={chip8} debug={debug} />
							</div>
							<div className="flex flex-col">
								<div className="">PC</div>
								<PC chip8={chip8} debug={debug} />
							</div>
						</div>
						<div className="flex flex-col px-2.5">
							<div className="">Stack</div>
							<Stack chip8={chip8} debug={debug} />
						</div>
						<div className="flex flex-col px-2.5 pb-6">
							<div className="">Memory Layout</div>
							<FullMemoryLayout chip8={chip8} debug={debug} />
						</div>
					</div>
				</div>
			</FloatingWindow>
		</>
	);
};
