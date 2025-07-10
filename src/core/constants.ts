export const TIMER_INTERVAL = 1000 / 60; // 1000Hz @ 60 FPS
export const TICKS_PER_FRAME = 16; // 60 FPS

export const ROM_LOAD_ADDRESS = 0x200;
export const DISPLAY_OFFSET = 0x1000;
export const KEY_BUFFER_OFFSET = 0x1100;
export const STACK_OFFSET = 0x1200;
export const STACK_PTR_OFFSET = 0x1300;
export const DELAY_TIMER_OFFSET = 0x1301;
export const SOUND_TIMER_OFFSET = 0x1302;
export const PC_OFFSET = 0x1303;
export const I_OFFSET = 0x1305;
export const REGISTERS_OFFSET = 0x1307; // V0 to VF (16 bytes)
