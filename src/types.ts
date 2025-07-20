export type Chip8Engine = {
	start(): void;
	stop(): void;
	step(): void;
	pause(): void;
	reset(opts?: RomOptions): void;
	isRunning(): boolean;
	loadROM(bytes: Uint8Array, options?: RomOptions): void;
	onFrame(callback: (frame: Uint8Array) => void): void;
	setKey(index: number, isDown: boolean): void;
	getMemory(): WebAssembly.Memory;
	getDebug(): Chip8Debug;
	getSoundTimer(): number;
	getOptions(): RomOptions;
	getKeyBuffer(): Uint8Array; // 16 bytes
	getError(): string | null;
};

export type Chip8Debug = {
	getPC(): number;
	getI(): number;
	getRegisters(): Uint8Array; // 16 bytes
	getStackPointer(): number;
	getDelayTimer(): number;
	getSoundTimer(): number;
	getROM(): Uint8Array | null;
	setOptions(options: RomOptions): void;
};

export type Chip8Exports = {
	init: () => void;
	tick: () => void;
	update_timers: () => void;
};

export type RomEntry = {
	name: string;
	path: string;
	description?: string;
	authors?: {
		name: string;
		email?: string;
		url?: string;
	}[];
	releaseDate?: string;
	event?: string;
	platform?: "chip8" | "schip" | "xochip";
	options?: RomOptions;
};

export type RomOptions = {
	blendColor?: string;
	loadStoreQuirks?: boolean | number;
	enableXO?: boolean;
	fillColor?: string;
	quietColor?: string;
	fillColor2?: string;
	buzzColor?: string;
	tickrate?: number | string;
	shiftQuirks?: boolean | number;
	backgroundColor?: string;
	vfOrderQuirks?: boolean | number;
	jumpQuirks?: boolean | number;
	screenRotation?: number;
	touchInputMode?: "swipe" | "none" | "gamepad" | "seg16" | string;
	logicQuirks?: boolean | number;
	fontStyle?: "octo" | "fish" | string;
	displayScale?: string | number;
	maxSize?: string | number;
	clipQuirks?: boolean | number;
	vBlankQuirks?: boolean | number;
};
