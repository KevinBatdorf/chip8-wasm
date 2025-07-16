export const TIMER_INTERVAL = 1000 / 60; // 1000Hz @ 60 FPS
export const TICKS_PER_FRAME = 8; // 30 FPS

export const FONT_OFFSET = 0x000;
// ROM (3584 bytes)
export const ROM_LOAD_ADDRESS = 0x200;
// Display (64x32 = 2048 bits = 256 bytes)
export const DISPLAY_OFFSET = 0x1000; // 0x1000–0x10FF
// Stack (16 levels × 2 bytes each)
export const STACK_OFFSET = 0x1100; // 0x1100–0x111F
// Key buffer (16 keys)
export const KEY_BUFFER_OFFSET = STACK_OFFSET + 0x20; // 0x1120–0x112F
// Timers
export const STACK_PTR_OFFSET = KEY_BUFFER_OFFSET + 0x10; // 0x1130
export const DELAY_TIMER_OFFSET = STACK_PTR_OFFSET + 0x01; // 0x1131
export const SOUND_TIMER_OFFSET = DELAY_TIMER_OFFSET + 0x01; // 0x1132
export const FX0A_VX_OFFSET = SOUND_TIMER_OFFSET + 0x01; // 0x1133
// Program counter (16-bit)
export const PC_OFFSET = FX0A_VX_OFFSET + 0x01; // 0x1134
// I register (16-bit)
export const I_OFFSET = PC_OFFSET + 0x02; // 0x1136
// General-purpose registers V0–VF (16 bytes)
export const REGISTERS_OFFSET = I_OFFSET + 0x02; // 0x1138–0x1147
