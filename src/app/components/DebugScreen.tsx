import clsx from "clsx";
import { useRef } from "react";
import { type Chip8Debug, ROM_LOAD_ADDRESS } from "../..";
import { useDraggable } from "../hooks/useDraggable";
import { usePortal } from "../hooks/usePortal";
import { useResizable } from "../hooks/useResizable";
import { useDebugStore } from "../state/debug";
import { FloatingWindow } from "./FloatingWindow";

type Props = {
	memory: Uint8Array;
	debug?: Chip8Debug;
	romData?: Uint8Array | null;
};

export const DebugScreen = ({ memory, romData, debug }: Props) => {
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
				className="text-lg fixed z-40 bottom-2 right-2 leading-none hidden lg:block"
				aria-label="Open Debug Screen"
				onClick={() => setOpen(!open)}
			>
				π
			</button>

			{open ? (
				<FloatingWindow
					label="Debug Screen"
					top={top}
					left={left}
					width={width}
					height={height}
					setOpen={setOpen}
					mountNode={mountNode}
					ref={ref}
				>
					<div className="flex flex-col h-full text-sm">
						<div className="p-2">controls</div>
						<div className="flex flex-col overflow-hidden flex-grow">
							<div className="px-2">Memory Layout</div>
							<MemoryLayout memory={memory} romData={romData} debug={debug} />
						</div>
					</div>
				</FloatingWindow>
			) : null}
		</>
	);
};

type MemoryLayoutProps = {
	memory: Uint8Array;
	romData?: Uint8Array | null;
	debug?: Chip8Debug;
};
const MemoryLayout = ({ memory, romData, debug }: MemoryLayoutProps) => {
	return (
		<div className="font-mono text-xs flex flex-wrap gap-px overflow-x-hidden overflow-y-auto px-2 pb-6">
			{[...memory].map((byte, i) => {
				const loc = `0x${i.toString(16).padStart(4, "0")}`;
				const byteStr = byte.toString(16).padStart(2, "0");
				const defaultStyles =
					"rounded-sm p-0.5 leading-none cursor-default select-none";
				if (!romData || !debug) {
					return (
						<span
							key={loc}
							className={`${defaultStyles} bg-stone-200 text-stone-800`}
						>
							{byteStr}
						</span>
					);
				}

				const isRomByte =
					i >= ROM_LOAD_ADDRESS && i < ROM_LOAD_ADDRESS + romData.length;
				const isPC = i === debug.getPC();

				return (
					<span
						key={loc}
						title={loc}
						className={clsx(defaultStyles, {
							"bg-stone-200 text-stone-800": !isRomByte,
							"bg-blue-200 text-stone-900": isRomByte,
							"bg-yellow-500 text-stone-900": isPC,
						})}
					>
						{byteStr}
					</span>
				);
			})}
		</div>
	);
};
