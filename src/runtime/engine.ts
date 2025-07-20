import type { Chip8Engine } from "..";
import {
	DELAY_TIMER_ADDRESS,
	DISPLAY_ADDRESS,
	DRAW_HAPPENED_ADDRESS,
	FRAME_BUFFER_ADDRESS,
	FX0A_VX_ADDRESS,
	I_ADDRESS,
	KEY_BUFFER_ADDRESS,
	MAX_ROM_ADDRESS,
	PC_ADDRESS,
	QUIRK_CLIPPING,
	QUIRK_CLIPPING_ADDRESS,
	QUIRK_DISPLAY_WAIT,
	QUIRK_DISPLAY_WAIT_ADDRESS,
	QUIRK_JUMPING,
	QUIRK_JUMPING_ADDRESS,
	QUIRK_MEMORY,
	QUIRK_MEMORY_ADDRESS,
	QUIRK_SHIFTING,
	QUIRK_SHIFTING_ADDRESS,
	QUIRK_VF_RESET,
	QUIRK_VF_RESET_ADDRESS,
	REGISTERS_ADDRESS,
	ROM_LOAD_ADDRESS,
	SOUND_TIMER_ADDRESS,
	STACK_PTR_ADDRESS,
	TICKS_PER_FRAME,
	TICKS_PER_FRAME_ADDRESS,
	TIMER_INTERVAL,
} from "../core/constants";
import type { Chip8Debug, Chip8Exports, RomOptions } from "../types";

export const createChip8Engine = async (
	wasmBinary: Uint8Array,
): Promise<Chip8Engine> => {
	const memory = new WebAssembly.Memory({ initial: 1 });
	const random = () => Math.floor(Math.random() * 256);
	const { instance } = await WebAssembly.instantiate(wasmBinary, {
		env: { memory, random },
	});
	const exports = instance.exports as Chip8Exports;
	let frameCallback: ((frame: Uint8Array) => void) | null = null;
	let running = false;
	let errorMsg: string | null = null;
	let waitingForKey = false;
	let romBytes: Uint8Array | null = null;
	let options: RomOptions = {};
	let lastUpdate = performance.now();
	let timerAccumulator = 0;
	let rafId = 0;

	const frame = (now: number) => {
		if (!running) return;

		// Calculate time delta
		const delta = now - lastUpdate;
		lastUpdate = now;
		timerAccumulator += delta;

		// Handle timers
		while (timerAccumulator >= TIMER_INTERVAL) {
			exports.update_timers();
			timerAccumulator -= TIMER_INTERVAL;
		}

		// Run the CHIP-8 tick
		let mem = new Uint8Array(memory.buffer);
		for (let i = 0; i < mem[TICKS_PER_FRAME_ADDRESS]; i++) {
			if (!running || errorMsg) return;
			const mem = new Uint8Array(memory.buffer);
			waitingForKey = mem[FX0A_VX_ADDRESS] !== 0;
			if (waitingForKey) {
				rafId = requestAnimationFrame(frame);
				return; // Wait for key input
			}
			try {
				exports.tick();
			} catch (error) {
				console.error("Error during CHIP-8 tick:", error);
				errorMsg = error instanceof Error ? error.message : String(error);
				// TODO: surface this error in the UI
			}
		}
		updateFrameBuffer();

		mem = new Uint8Array(memory.buffer);
		// If the display wait quirk is enabled, this might be 1
		if (mem[DRAW_HAPPENED_ADDRESS]) {
			mem[DRAW_HAPPENED_ADDRESS] = 0; // Reset draw happened flag
		}

		// Notify callback renderer
		if (frameCallback) {
			const displayBuffer = new Uint8Array(memory.buffer, DISPLAY_ADDRESS, 256);
			frameCallback(displayBuffer);
		}
		rafId = requestAnimationFrame(frame);
	};

	const updateFrameBuffer = () => {
		const mem = new Uint8Array(memory.buffer);
		mem.copyWithin(
			DISPLAY_ADDRESS,
			FRAME_BUFFER_ADDRESS,
			FRAME_BUFFER_ADDRESS + 256,
		);
	};

	const start = () => {
		if (running) return;
		running = true;
		errorMsg = null;
		waitingForKey = false;
		lastUpdate = performance.now();
		timerAccumulator = 0;
		rafId = requestAnimationFrame(frame);
	};
	const stop = () => {
		running = false;
		waitingForKey = false;
		timerAccumulator = 0;
		cancelAnimationFrame(rafId);
	};
	const step = () => {
		if (waitingForKey || errorMsg) return;
		try {
			exports.tick();
		} catch (error) {
			console.error("Error during CHIP-8 step:", error);
			errorMsg = error instanceof Error ? error.message : String(error);
			// TODO: surface this error in the UI
		}
		const mem = new Uint8Array(memory.buffer);
		waitingForKey = mem[FX0A_VX_ADDRESS] !== 0;
		mem[DRAW_HAPPENED_ADDRESS] = 0;
		updateFrameBuffer();
		if (frameCallback) {
			const displayBuffer = new Uint8Array(
				memory.buffer,
				DISPLAY_ADDRESS,
				256, // 64x32 display = 256 bytes
			);
			frameCallback(displayBuffer);
		}
	};

	const reset = (opts: RomOptions) => {
		const run = running;
		exports.init();
		loadROM(romBytes || new Uint8Array(), opts ?? options);
		if (frameCallback) {
			const displayBuffer = new Uint8Array(memory.buffer, DISPLAY_ADDRESS, 256);
			frameCallback(displayBuffer);
		}
		if (run) start(); // Restart if it was running
	};

	const loadROM = (bytes: Uint8Array, options: RomOptions = {}) => {
		stop();
		errorMsg = null;
		exports.init(); // Reset CHIP-8 state before loading ROM
		if (bytes.length > MAX_ROM_ADDRESS - ROM_LOAD_ADDRESS + 1) {
			throw new Error("ROM too large for CHIP-8 memory");
		}
		setOptions(options);
		romBytes = bytes;
		const memoryBuffer = new Uint8Array(memory.buffer);
		memoryBuffer.set(bytes, ROM_LOAD_ADDRESS);
	};

	const setOptions = (romOpts: RomOptions) => {
		const opts = {
			tickrate: Number(romOpts.tickrate ?? TICKS_PER_FRAME),
			vfOrderQuirks: Number(romOpts.vfOrderQuirks ?? QUIRK_VF_RESET),
			loadStoreQuirks: Number(romOpts.loadStoreQuirks ?? QUIRK_MEMORY),
			vBlankQuirks: Number(romOpts.vBlankQuirks ?? QUIRK_DISPLAY_WAIT),
			clipQuirks: Number(romOpts.clipQuirks ?? QUIRK_CLIPPING),
			shiftQuirks: Number(romOpts.shiftQuirks ?? QUIRK_SHIFTING),
			jumpQuirks: Number(romOpts.jumpQuirks ?? QUIRK_JUMPING),
		};
		const mem = new Uint8Array(memory.buffer);
		mem[TICKS_PER_FRAME_ADDRESS] = Math.max(1, opts.tickrate);
		mem[QUIRK_VF_RESET_ADDRESS] = opts.vfOrderQuirks;
		mem[QUIRK_MEMORY_ADDRESS] = opts.loadStoreQuirks;
		mem[QUIRK_DISPLAY_WAIT_ADDRESS] = opts.vBlankQuirks;
		mem[QUIRK_CLIPPING_ADDRESS] = opts.clipQuirks;
		mem[QUIRK_SHIFTING_ADDRESS] = opts.shiftQuirks;
		mem[QUIRK_JUMPING_ADDRESS] = opts.jumpQuirks;
		options = opts;
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
		if (waitingForKey && !isDown) {
			// If waiting for a key press, set the FX0A_VX_ADDRESS to 0
			const VX = memoryBuffer[FX0A_VX_ADDRESS] & 0x0f; // Get the low nibble
			// Put the key index in VX
			memoryBuffer[REGISTERS_ADDRESS + VX] = index;
			// Clear the waiting state
			memoryBuffer[FX0A_VX_ADDRESS] = 0;
			waitingForKey = false;
		}
		memoryBuffer[KEY_BUFFER_ADDRESS + index] = isDown ? 1 : 0;
	};

	const debug: Chip8Debug = {
		getPC: () => new DataView(memory.buffer).getUint16(PC_ADDRESS, true),
		getI: () => new DataView(memory.buffer).getUint16(I_ADDRESS, true),
		getRegisters: () => new Uint8Array(memory.buffer, REGISTERS_ADDRESS, 16),
		getStackPointer: () =>
			new DataView(memory.buffer).getUint8(STACK_PTR_ADDRESS),
		getDelayTimer: () =>
			new DataView(memory.buffer).getUint8(DELAY_TIMER_ADDRESS),
		getSoundTimer: () =>
			new DataView(memory.buffer).getUint8(SOUND_TIMER_ADDRESS),
		getROM: () => (romBytes ? new Uint8Array(romBytes) : null),
		setOptions: (options: RomOptions) => reset(options),
	};

	return {
		start,
		stop,
		pause: stop,
		step,
		isRunning: () => running,
		reset,
		loadROM,
		onFrame,
		setKey,
		getMemory: () => memory,
		getDebug: () => debug,
		getOptions: () => options,
		getSoundTimer: () =>
			new DataView(memory.buffer).getUint8(SOUND_TIMER_ADDRESS),
		getError: () => errorMsg,
	};
};
