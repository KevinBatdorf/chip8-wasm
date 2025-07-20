export const TIMER_INTERVAL = 1000 / 60; // 1000Hz @ 60 FPS
// Overridable ticks per frame
export const TICKS_PER_FRAME = 10;

// Quirk defaults
export const QUIRK_VF_RESET = 1; // VF reset on DXYN
export const QUIRK_MEMORY = 1; // Memory quirks enabled
export const QUIRK_DISPLAY_WAIT = 1; // Wait for display draw
export const QUIRK_CLIPPING = 1; // Clipping enabled
export const QUIRK_SHIFTING = 0; // Shifting disabled
export const QUIRK_JUMPING = 0; // Jumping disabled

export const FONT_ADDRESS = 0x000;
// ROM (3584 bytes)
export const ROM_LOAD_ADDRESS = 0x200;
export const MAX_ROM_ADDRESS = ROM_LOAD_ADDRESS + 3584 - 1;
// Display (64x32 = 2048 bits = 256 bytes)
export const DISPLAY_ADDRESS = MAX_ROM_ADDRESS + 1;
// Stack (16 levels × 2 bytes each)
export const STACK_ADDRESS = DISPLAY_ADDRESS + 256;
// Key buffer (16 keys)
export const KEY_BUFFER_ADDRESS = STACK_ADDRESS + 32;
// Timers
export const STACK_PTR_ADDRESS = KEY_BUFFER_ADDRESS + 16;
export const DELAY_TIMER_ADDRESS = STACK_PTR_ADDRESS + 1;
export const SOUND_TIMER_ADDRESS = DELAY_TIMER_ADDRESS + 1;
// Program counter (16-bit)
export const PC_ADDRESS = SOUND_TIMER_ADDRESS + 1;
// I register (16-bit)
export const I_ADDRESS = PC_ADDRESS + 2;
// General-purpose registers V0–VF (16 bytes)
export const REGISTERS_ADDRESS = I_ADDRESS + 2;
// Frame buffer for rendering
export const FRAME_BUFFER_ADDRESS = REGISTERS_ADDRESS + 16;
export const FX0A_VX_ADDRESS = FRAME_BUFFER_ADDRESS + 256;
// Quirks
export const DRAW_HAPPENED_ADDRESS = FX0A_VX_ADDRESS + 1;
export const COLLISION_HAPPENED_ADDRESS = DRAW_HAPPENED_ADDRESS + 1;
export const QUIRK_VF_RESET_ADDRESS = COLLISION_HAPPENED_ADDRESS + 1;
export const QUIRK_MEMORY_ADDRESS = QUIRK_VF_RESET_ADDRESS + 1;
export const QUIRK_DISPLAY_WAIT_ADDRESS = QUIRK_MEMORY_ADDRESS + 1;
export const QUIRK_CLIPPING_ADDRESS = QUIRK_DISPLAY_WAIT_ADDRESS + 1;
export const QUIRK_SHIFTING_ADDRESS = QUIRK_CLIPPING_ADDRESS + 1;
export const QUIRK_JUMPING_ADDRESS = QUIRK_SHIFTING_ADDRESS + 1;
// Configurable ticks
export const TICKS_PER_FRAME_ADDRESS = QUIRK_JUMPING_ADDRESS + 1;
