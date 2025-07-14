import { useEffect, useRef } from "react";

type Props = {
	onFrame?: (callback: (frame: Uint8Array) => void) => void;
	scale?: number;
};
export const Display = ({ onFrame, scale = 10 }: Props) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!canvasRef.current) return;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const imageData = ctx.createImageData(64, 32);
		const buffer = new Uint8ClampedArray(imageData.data.length);

		onFrame?.((frame) => {
			for (let i = 0; i < 256; i++) {
				const byte = frame[i];
				for (let bit = 0; bit < 8; bit++) {
					const x = (i % 8) * 8 + bit;
					const y = i >> 3;
					const on = (byte & (0b10000000 >> bit)) !== 0;
					const index = (y * 64 + x) * 4;
					const color = on ? 0xf5f5f4 : 0x1c1917;
					buffer[index + 0] = (color >> 16) & 0xff; // R
					buffer[index + 1] = (color >> 8) & 0xff; // G
					buffer[index + 2] = color & 0xff; // B
					buffer[index + 3] = 0xff; // A
				}
			}
			imageData.data.set(buffer);
			ctx.putImageData(imageData, 0, 0);
		});
	}, [onFrame]);

	return (
		<div className="">
			<canvas
				ref={canvasRef}
				id="screen"
				className="border border-gray-300 bg-stone-900"
				width={64}
				height={32}
				style={{
					width: 64 * scale,
					height: 32 * scale,
					imageRendering: "pixelated",
				}}
			/>
		</div>
	);
};
