export const TIMER_INTERVAL = 1000 / 60; // 1000Hz @ 60 FPS
// Overridable ticks per frame
export const TICKS_PER_FRAME = 500 / 60; // ~8 ticks per frame at 60 FPS

export const FONT_ADDRESS = 0x000;
// ROM (3584 bytes)
export const ROM_LOAD_ADDRESS = 0x200;
// Display (64x32 = 2048 bits = 256 bytes)
export const DISPLAY_ADDRESS = 0x1000; // 0x1000–0x10FF
export const FRAME_BUFFER_ADDRESS = 0x1100; // 0x1100–0x11FF
// Stack (16 levels × 2 bytes each)
export const STACK_ADDRESS = 0x1200; // 0x1200–0x121F
// Key buffer (16 keys)
export const KEY_BUFFER_ADDRESS = STACK_ADDRESS + 0x20; // 0x1120–0x112F
// Timers
export const STACK_PTR_ADDRESS = KEY_BUFFER_ADDRESS + 0x10; // 0x1130
export const DELAY_TIMER_ADDRESS = STACK_PTR_ADDRESS + 0x01; // 0x1131
export const SOUND_TIMER_ADDRESS = DELAY_TIMER_ADDRESS + 0x01; // 0x1132
export const FX0A_VX_ADDRESS = SOUND_TIMER_ADDRESS + 0x01; // 0x1133
// Quirks
export const DRAW_HAPPENED_ADDRESS = FX0A_VX_ADDRESS + 0x01; // 0x1134
export const COLLISION_HAPPENED_ADDRESS = DRAW_HAPPENED_ADDRESS + 0x01; // 0x1135
export const QUIRK_VF_RESET_ADDRESS = COLLISION_HAPPENED_ADDRESS + 0x01; // 0x1136
export const QUIRK_MEMORY_ADDRESS = QUIRK_VF_RESET_ADDRESS + 0x01; // 0x1137
export const QUIRK_DISPLAY_WAIT_ADDRESS = QUIRK_MEMORY_ADDRESS + 0x01; // 0x1138
export const QUIRK_CLIPPING_ADDRESS = QUIRK_DISPLAY_WAIT_ADDRESS + 0x01; // 0x1139
export const QUIRK_SHIFTING_ADDRESS = QUIRK_CLIPPING_ADDRESS + 0x01; // 0x113A
export const QUIRK_JUMPING_ADDRESS = QUIRK_SHIFTING_ADDRESS + 0x01; // 0x113B
// Configurable ticks
export const TICKS_PER_FRAME_ADDRESS = QUIRK_JUMPING_ADDRESS + 0x01; // 0x113C
// Program counter (16-bit)
export const PC_ADDRESS = TICKS_PER_FRAME_ADDRESS + 0x01; // 0x113D
// I register (16-bit)
export const I_ADDRESS = PC_ADDRESS + 0x02; // 0x113F
// General-purpose registers V0–VF (16 bytes)
export const REGISTERS_ADDRESS = I_ADDRESS + 0x02; // 0x1141

// Quirk defaults
export const QUIRK_VF_RESET = 1; // VF reset on DXYN
export const QUIRK_MEMORY = 1; // Memory quirks enabled
export const QUIRK_DISPLAY_WAIT = 1; // Wait for display draw
export const QUIRK_CLIPPING = 1; // Clipping enabled
export const QUIRK_SHIFTING = 0; // Shifting disabled
export const QUIRK_JUMPING = 0; // Jumping disabled
