import { useRef } from "react";
import type { Chip8Debug, Chip8Engine } from "../..";
import type { RomEntry } from "../../types";
import { useDraggable } from "../hooks/useDraggable";
import { usePortal } from "../hooks/usePortal";
import { useResizable } from "../hooks/useResizable";
import { useDebugStore } from "../state/debug";
import { FloatingWindow } from "./FloatingWindow";
import { Controls } from "./debug/Controls";
import { DelayTimer } from "./debug/DelayTimer";
import { DisplayBuffer } from "./debug/DisplayBuffer";
import { FullMemoryLayout } from "./debug/FullMemoryLayout";
import { I } from "./debug/I";
import { KeyBuffer } from "./debug/KeyBuffer";
import { KeyWait } from "./debug/KeyWait";
import { PC } from "./debug/PC";
import { Quirks } from "./debug/Quirks";
import { Registers } from "./debug/Registers";
import { SoundTimer } from "./debug/SoundTimer";
import { Stack } from "./debug/Stack";

type Props = {
	debug: Chip8Debug | null;
	chip8: Chip8Engine | null;
	rom: RomEntry | null;
};

export const DebugScreen = ({ debug, chip8, rom }: Props) => {
	const {
		x: top,
		y: left,
		width,
		height,
		open,
		hideZeros,
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
				<div className="flex flex-col gap-4 text-sm overflow-hidden h-full select-none">
					<div className="px-2.5 pt-px flex gap-4 justify-between flex-wrap">
						<Controls rom={rom} chip8={chip8} />
						<div className="flex flex-col justify-between gap-1">
							<div className="text-[11px]">Quirks</div>
							<Quirks chip8={chip8} debug={debug} rom={rom} />
						</div>
					</div>
					<div className="flex flex-col gap-4 overflow-y-auto overflow-x-scroll h-full cursor-default">
						<div className="flex flex-wrap gap-4 px-2.5">
							<div className="flex flex-col">
								<div className="">Registers</div>
								<Registers chip8={chip8} debug={debug} hideZeros={hideZeros} />
							</div>
							<div className="flex flex-col">
								<div className="">PC</div>
								<PC chip8={chip8} debug={debug} hideZeros={hideZeros} />
							</div>
							<div className="flex flex-col">
								<div className="">I</div>
								<I chip8={chip8} debug={debug} hideZeros={hideZeros} />
							</div>
						</div>
						<div className="flex flex-wrap gap-4 px-2.5">
							<div className="flex flex-col">
								<div className="">Keyboard</div>
								<KeyBuffer chip8={chip8} debug={debug} hideZeros={hideZeros} />
							</div>
							<div className="flex flex-col">
								<div className="">Wait</div>
								<KeyWait chip8={chip8} debug={debug} hideZeros={hideZeros} />
							</div>
							<div className="flex flex-col">
								<div className="">Delay</div>
								<DelayTimer chip8={chip8} debug={debug} hideZeros={hideZeros} />
							</div>
							<div className="flex flex-col">
								<div className="">Sound</div>
								<SoundTimer chip8={chip8} debug={debug} hideZeros={hideZeros} />
							</div>
						</div>
						<div className="flex flex-col px-2.5">
							<div className="">Stack</div>
							<Stack chip8={chip8} debug={debug} hideZeros={hideZeros} />
						</div>
						<div className="flex flex-col px-2.5">
							Display
							<DisplayBuffer
								chip8={chip8}
								debug={debug}
								hideZeros={hideZeros}
							/>
						</div>
						<div className="flex flex-col px-2.5 pb-6">
							<div className="">Memory Layout</div>
							<FullMemoryLayout
								chip8={chip8}
								debug={debug}
								hideZeros={hideZeros}
							/>
						</div>
					</div>
				</div>
			</FloatingWindow>
		</>
	);
};
