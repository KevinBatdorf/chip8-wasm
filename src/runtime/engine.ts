import {
	DISPLAY_OFFSET,
	KEY_BUFFER_OFFSET,
	ROM_LOAD_ADDRESS,
	TICKS_PER_FRAME,
	TIMER_INTERVAL,
} from "../core/constants";

export type Chip8Engine = {
	start(): void;
	stop(): void;
	pause(): void;
	reset(): void;
	isRunning(): boolean;
	loadROM(bytes: Uint8Array): void;
	onFrame(callback: (frame: Uint8Array) => void): void;
	setKey(index: number, isDown: boolean): void;
	getMemory(): WebAssembly.Memory;
};

type Chip8Exports = {
	load_rom: (address: number, length: number) => void;
	init: () => void;
	tick: () => void;
	update_timers: () => void;
};

export const createChip8Engine = async (
	wasmBinary: Uint8Array,
): Promise<Chip8Engine> => {
	const memory = new WebAssembly.Memory({ initial: 1 });
	const { instance } = await WebAssembly.instantiate(wasmBinary, {
		env: { memory },
	});
	console.log("WASM byte length:", wasmBinary.byteLength);

	const exports = instance.exports as Chip8Exports;
	let frameCallback: ((frame: Uint8Array) => void) | null = null;
	let running = false;
	let lastUpdate = performance.now();
	let timerAccumulator = 0;

	const frame = (now: number) => {
		if (!running) return;
		const delta = now - lastUpdate;
		lastUpdate = now;
		timerAccumulator += delta;

		// Run the CHIP-8 tick
		for (let i = 0; i < TICKS_PER_FRAME; i++) exports.tick();

		// Handle timers
		while (timerAccumulator >= TIMER_INTERVAL) {
			exports.update_timers();
			timerAccumulator -= TIMER_INTERVAL;
		}

		// Notify callback renderer
		if (frameCallback) {
			const displayBuffer = new Uint8Array(
				memory.buffer,
				DISPLAY_OFFSET,
				64 * 32,
			);
			frameCallback(displayBuffer);
		}
		requestAnimationFrame(frame);
	};

	const start = () => {
		if (running) return;
		running = true;
		lastUpdate = performance.now();
		timerAccumulator = 0;
		requestAnimationFrame(frame);
	};
	const stop = () => {
		running = false;
	};
	const loadROM = (bytes: Uint8Array) => {
		stop();
		exports.init(); // Reset CHIP-8 state before loading ROM
		if (bytes.length > 4096) {
			throw new Error("ROM too large for CHIP-8 memory");
		}
		const memoryBuffer = new Uint8Array(memory.buffer);
		memoryBuffer.set(bytes, ROM_LOAD_ADDRESS);
		exports.load_rom(ROM_LOAD_ADDRESS, bytes.length);
	};
	const onFrame = (callback: (frame: Uint8Array) => void) => {
		if (typeof callback !== "function") {
			throw new Error("Frame callback must be a function");
		}
		frameCallback = callback;
	};
	const setKey = (index: number, isDown: boolean) => {
		if (index < 0 || index > 15) {
			throw new Error("Key index must be between 0 and 15");
		}
		const memoryBuffer = new Uint8Array(memory.buffer);
		memoryBuffer[KEY_BUFFER_OFFSET + index] = isDown ? 1 : 0;
	};
	return {
		start,
		stop,
		pause: stop,
		isRunning: () => running,
		reset: () => exports.init(),
		loadROM,
		onFrame,
		setKey,
		getMemory: () => memory,
	};
};
