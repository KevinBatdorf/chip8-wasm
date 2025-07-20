import { useEffect, useRef } from "react";
import type { Chip8Engine, RomEntry } from "../../types";
import { useChip8Store } from "../state/chip8";

type Props = {
	chip8: Chip8Engine | null;
	rom: RomEntry | null;
	onFrame?: (callback: (frame: Uint8Array) => void) => void;
	scale?: number;
};
export const Chip8 = ({ rom, chip8, onFrame, scale = 10 }: Props) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { sound } = useChip8Store();

	useEffect(() => {
		if (!chip8) return;
		if (!canvasRef.current) return;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const imageData = ctx.createImageData(64, 32);
		const buffer = new Uint8ClampedArray(imageData.data.length);
		const audioCtx = new AudioContext();
		let oscillator: OscillatorNode | null = null;

		const { fillColor, backgroundColor } = rom?.options ?? {};
		const onColor = hexToNum(fillColor) ?? 0xf5f5f4;
		const offColor = hexToNum(backgroundColor) ?? 0x1c1917;

		onFrame?.((frame) => {
			const soundTimer = chip8.getSoundTimer();
			if (soundTimer > 0) {
				if (!sound) {
					oscillator?.stop();
					oscillator?.disconnect();
					oscillator = null;
					return;
				}
				if (!oscillator) {
					if (!sound) return;
					oscillator = audioCtx.createOscillator();
					const gain = audioCtx.createGain();
					gain.gain.value = 0.05;
					oscillator.frequency.value = 440;
					oscillator.type = "square";
					oscillator.connect(gain).connect(audioCtx.destination);
					oscillator.start();
				}
			} else if (oscillator) {
				oscillator.stop();
				oscillator.disconnect();
				oscillator = null;
			}
			for (let i = 0; i < 256; i++) {
				const byte = frame[i];
				for (let bit = 0; bit < 8; bit++) {
					const x = (i % 8) * 8 + bit;
					const y = i >> 3;
					const on = (byte & (0b10000000 >> bit)) !== 0;
					const index = (y * 64 + x) * 4;
					const color = on ? onColor : offColor;
					buffer[index + 0] = (color >> 16) & 0xff; // R
					buffer[index + 1] = (color >> 8) & 0xff; // G
					buffer[index + 2] = color & 0xff; // B
					buffer[index + 3] = 0xff; // A
				}
			}
			imageData.data.set(buffer);
			ctx.putImageData(imageData, 0, 0);
		});
	}, [onFrame, chip8, rom, sound]);

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

const hexToNum = (val: string | number | undefined) =>
	val && typeof val === "string" && val.startsWith("#")
		? parseInt(val.slice(1), 16)
		: typeof val === "number"
			? val
			: undefined;
