// ============================================
// Application Constants
// ============================================

// Audio Settings
export const DEFAULT_SAMPLE_RATE = 48000;
export const DEFAULT_BUFFER_SIZE = 256;
export const MAX_POLYPHONY = 8;

// Eurorack Standard
export const HP_WIDTH_MM = 5.08;
export const HP_WIDTH_PX = 20; // Pixels per HP in UI
export const RAIL_HEIGHT_PX = 380;

// Voltage Standards
export const AUDIO_VOLTAGE_RANGE = 10; // ±5V = 10V peak-to-peak
export const CV_VOLTAGE_MIN = 0;
export const CV_VOLTAGE_MAX = 10;
export const GATE_VOLTAGE_LOW = 0;
export const GATE_VOLTAGE_HIGH = 5;

// 1V/Octave Standard
export const VOLTS_PER_OCTAVE = 1;
export const MIDDLE_C_VOLTAGE = 5; // C4 at 5V

// UI Constants
export const MODULE_GAP = 2;
export const PORT_SIZE = 20;
export const KNOB_SIZE = 40;

// Scope Settings
export const SCOPE_BUFFER_SIZE = 2048;
export const SCOPE_UPDATE_RATE = 60; // FPS
export const FFT_SIZE = 2048;

// Signal Type Colors
export const SIGNAL_COLORS = {
  audio: '#00d4aa',
  cv: '#ffaa00',
  gate: '#ff6b6b',
  trigger: '#ff6b6b',
  clock: '#9966ff',
} as const;

// Module Type Icons
export const MODULE_ICONS: Record<string, string> = {
  vco: '∿',
  lfo: '◠',
  vcf_lowpass: '⌇',
  vcf_highpass: '⌇',
  vcf_multimode: '⌇',
  vca: '▲',
  envelope_adsr: '⌐',
  mixer: '⊕',
  delay: '⟳',
  reverb: '∞',
  noise: '⁂',
  output: '◉',
  scope: '📊',
  clock: '⏱',
  sequencer: '▦',
};

// Default Module HP Sizes
export const DEFAULT_MODULE_HP: Record<string, number> = {
  vco: 10,
  lfo: 4,
  vcf_lowpass: 8,
  vcf_highpass: 8,
  vcf_multimode: 12,
  vca: 6,
  vca_dual: 8,
  envelope_adsr: 8,
  envelope_ad: 4,
  mixer: 6,
  attenuator: 2,
  multiple: 2,
  delay: 10,
  reverb: 10,
  noise: 4,
  output: 6,
  scope: 12,
  clock: 4,
  sequencer: 16,
};
