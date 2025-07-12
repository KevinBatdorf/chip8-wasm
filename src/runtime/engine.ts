import {
	DELAY_TIMER_OFFSET,
	DISPLAY_OFFSET,
	I_OFFSET,
	KEY_BUFFER_OFFSET,
	PC_OFFSET,
	REGISTERS_OFFSET,
	ROM_LOAD_ADDRESS,
	SOUND_TIMER_OFFSET,
	STACK_PTR_OFFSET,
	TICKS_PER_FRAME,
	TIMER_INTERVAL,
} from "../core/constants";

export type Chip8Engine = {
	start(): void;
	stop(): void;
	step(): void;
	pause(): void;
	reset(): void;
	isRunning(): boolean;
	loadROM(bytes: Uint8Array): void;
	onFrame(callback: (frame: Uint8Array) => void): void;
	setKey(index: number, isDown: boolean): void;
	getMemory(): WebAssembly.Memory;
	getDebug(): Chip8Debug;
};

export type Chip8Debug = {
	getPC(): number;
	getI(): number;
	getRegisters(): Uint8Array; // 16 bytes
	getStackPointer(): number;
	getDelayTimer(): number;
	getSoundTimer(): number;
	getROM(): Uint8Array | null;
};

type Chip8Exports = {
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
	const exports = instance.exports as Chip8Exports;
	let frameCallback: ((frame: Uint8Array) => void) | null = null;
	let running = false;
	let rom: Uint8Array | null = null;
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
	const step = () => {
		exports.tick();
		exports.update_timers();
		if (frameCallback) {
			const displayBuffer = new Uint8Array(
				memory.buffer,
				DISPLAY_OFFSET,
				64 * 32,
			);
			frameCallback(displayBuffer);
		}
	};

	const loadROM = (bytes: Uint8Array) => {
		stop();
		exports.init(); // Reset CHIP-8 state before loading ROM
		if (bytes.length > 3584) {
			throw new Error("ROM too large for CHIP-8 memory");
		}
		rom = bytes;
		const memoryBuffer = new Uint8Array(memory.buffer);
		memoryBuffer.set(bytes, ROM_LOAD_ADDRESS);
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
	const debug: Chip8Debug = {
		getPC: () => new DataView(memory.buffer).getUint16(PC_OFFSET, true),
		getI: () => new DataView(memory.buffer).getUint16(I_OFFSET, true),
		getRegisters: () => new Uint8Array(memory.buffer, REGISTERS_OFFSET, 16),
		getStackPointer: () =>
			new DataView(memory.buffer).getUint8(STACK_PTR_OFFSET),
		getDelayTimer: () =>
			new DataView(memory.buffer).getUint8(DELAY_TIMER_OFFSET),
		getSoundTimer: () =>
			new DataView(memory.buffer).getUint8(SOUND_TIMER_OFFSET),
		getROM: () => (rom ? new Uint8Array(rom) : null),
	};

	return {
		start,
		stop,
		pause: stop,
		step,
		isRunning: () => running,
		reset: () => {
			exports.init();
			loadROM(rom || new Uint8Array());
		},
		loadROM,
		onFrame,
		setKey,
		getMemory: () => memory,
		getDebug: () => debug,
	};
};
