import { useLayoutEffect, useRef } from "react";
import { clamp, getHighestZIndex } from "../lib/util";

type Position = { x: number; y: number };

export const useDraggable = ({
	ref,
	open,
	initialPosition,
	onDragEnd,
}: {
	ref: React.RefObject<HTMLDivElement | null>;
	open: boolean;
	initialPosition: Position;
	onDragEnd: (x: number, y: number) => void;
}) => {
	const offset = useRef({ x: 0, y: 0 });
	const pointerIdRef = useRef<number | null>(null);
	const lastPosition = useRef<Position>({
		x: initialPosition.x,
		y: initialPosition.y,
	});

	useLayoutEffect(() => {
		const el = ref?.current;
		if (!el || !open) return;

		// keep in bounds
		const minX = 0;
		const minY = 0;
		const maxX = window.innerWidth - el.offsetWidth;
		const maxY = window.innerHeight - el.offsetHeight;
		const left = Number.parseFloat(el.style.left) || 0;
		const top = Number.parseFloat(el.style.top) || 0;
		const x = clamp(left, minX, maxX);
		const y = clamp(top, minY, maxY);

		if (left !== x || top !== y) {
			el.style.left = `${x}px`;
			el.style.top = `${y}px`;
		}
	}, [ref, open]);

	useLayoutEffect(() => {
		const el = ref?.current;
		if (!el || !open) return;

		const handle = el.querySelector("[data-handle]");
		if (!(handle instanceof HTMLElement)) return;

		el.style.position = "fixed";
		el.style.left = `${initialPosition.x}px`;
		el.style.top = `${initialPosition.y}px`;

		const onPointerDown = (e: PointerEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (pointerIdRef.current !== null) {
				return;
			}
			// Increase the z index to be highest of all windows
			const highestZIndex = getHighestZIndex();
			el.style.setProperty("z-index", `${highestZIndex + 1}`, "important");
			pointerIdRef.current = e.pointerId;
			handle.setPointerCapture(e.pointerId);
			offset.current = {
				x: e.clientX - el.offsetLeft,
				y: e.clientY - el.offsetTop,
			};
			document.addEventListener("pointermove", onPointerMove);
			document.addEventListener("pointerup", onPointerUp);
		};

		const onPointerMove = (e: PointerEvent) => {
			const minX = 0;
			const minY = 0;
			const maxX = window.innerWidth - handle.offsetWidth;
			const maxY = window.innerHeight - handle.offsetHeight;
			const x = clamp(e.clientX - offset.current.x, minX, maxX);
			const y = clamp(e.clientY - offset.current.y, minY, maxY);
			el.style.left = `${x}px`;
			el.style.top = `${y}px`;
			lastPosition.current = { x, y };
		};

		const onPointerUp = (e: PointerEvent) => {
			if (pointerIdRef.current !== e.pointerId) {
				return;
			}
			pointerIdRef.current = null;
			handle.releasePointerCapture(e.pointerId);
			document.removeEventListener("pointermove", onPointerMove);
			document.removeEventListener("pointerup", onPointerUp);
			onDragEnd(lastPosition.current.x, lastPosition.current.y);
		};

		const onBlur = () => onPointerUp(new PointerEvent("pointerup"));
		const onContextMenu = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			return false;
		};

		handle.addEventListener("pointerdown", onPointerDown);
		handle.addEventListener("contextmenu", onContextMenu);
		handle.addEventListener("blur", onBlur);

		return () => {
			handle.removeEventListener("pointerdown", onPointerDown);
			handle.removeEventListener("blur", onBlur);
			handle.removeEventListener("contextmenu", onContextMenu);
			document.removeEventListener("pointermove", onPointerMove);
			document.removeEventListener("pointerup", onPointerUp);
			if (pointerIdRef.current !== null) {
				handle.releasePointerCapture(pointerIdRef.current);
				pointerIdRef.current = null;
			}
		};
	}, [ref, open, initialPosition.x, initialPosition.y, onDragEnd]);
};
