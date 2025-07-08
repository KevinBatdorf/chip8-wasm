import { type RefObject, forwardRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { getHighestZIndex } from "../lib/util";

type FloatingWindowProps = {
	label: string;
	top: number;
	left: number;
	width: number;
	height: number;
	setOpen: (open: boolean) => void;
	children: React.ReactNode;
	mountNode: HTMLElement;
};

export const FloatingWindow = forwardRef<HTMLDivElement, FloatingWindowProps>(
	({ label, top, left, width, height, setOpen, children, mountNode }, ref) => {
		useLayoutEffect(() => {
			const el = (ref as RefObject<HTMLDivElement>).current;
			if (!el) return;
			// Increase the z index to be highest of all windows
			const highestZIndex = getHighestZIndex();
			el.style.setProperty("z-index", `${highestZIndex + 1}`, "important");
		}, [ref]);

		return createPortal(
			<div>
				<div
					className="floating-window fixed bottom-0 right-0 z-50 flex max-h-full max-w-full flex-col border border-solid border-stone-300 font-jetbrains-mono shadow-2xl bg-stone-800 text-stone-50"
					style={{ top, left, width, height }}
					ref={ref}
				>
					<>
						<div className="flex flex-shrink-0 items-center justify-between p-1">
							<div
								data-handle
								draggable
								className="flex flex-grow cursor-grab items-center justify-between gap-1 p-0"
							>
								<DragButton />
								<h2 className="m-0 h-full flex-grow p-0 text-sm font-medium text-stone-50">
									{label}
								</h2>
							</div>
							<button
								type="button"
								className="relative z-10 border-0"
								onClick={() => setOpen(false)}
								aria-label="Close Debug Menu"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="20"
									height="20"
									aria-hidden="true"
									focusable="false"
									className="pointer-events-none"
								>
									<path
										fill="currentColor"
										d="m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z"
									/>
								</svg>
							</button>
						</div>
						<div className="relative z-50 flex min-h-0 flex-grow flex-col overflow-hidden">
							{children}
						</div>
						<div
							data-resize
							className="absolute -bottom-2 -right-2 z-50 h-6 w-6"
						>
							<div className="h-6 w-6 cursor-se-resize border border-l-0 border-t-0 border-solid border-transparent transition-colors duration-300 hover:border-stone-600 active:border-stone-600" />
						</div>
					</>
				</div>
			</div>,
			mountNode,
		);
	},
);

const DragButton = (props: React.HTMLProps<HTMLDivElement>) => (
	<div
		style={{ userSelect: "none" }}
		className="relative flex text-stone-50 hover:text-stone-700"
		{...props}
	>
		<div className="pointer-events-none text-stone-50">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				width="20"
				height="20"
				className="pointer-events-none"
				aria-hidden="true"
				focusable="false"
			>
				<path
					fill="currentColor"
					d="M8 7h2V5H8v2zm0 6h2v-2H8v2zm0 6h2v-2H8v2zm6-14v2h2V5h-2zm0 8h2v-2h-2v2zm0 6h2v-2h-2v2z"
				/>
			</svg>
		</div>
		<span className="sr-only">Drag to move</span>
	</div>
);
