// ============================================
// Utility Functions
// ============================================

import { VOLTS_PER_OCTAVE } from './constants';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Convert voltage to frequency (1V/Oct standard)
 * @param voltage Input voltage
 * @param baseFreq Base frequency at 0V (default: middle C = 261.63 Hz)
 */
export function voltageToFrequency(voltage: number, baseFreq: number = 261.63): number {
  return baseFreq * Math.pow(2, voltage / VOLTS_PER_OCTAVE);
}

/**
 * Convert frequency to voltage (1V/Oct standard)
 */
export function frequencyToVoltage(frequency: number, baseFreq: number = 261.63): number {
  return Math.log2(frequency / baseFreq) * VOLTS_PER_OCTAVE;
}

/**
 * Convert MIDI note to frequency
 */
export function midiToFrequency(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

/**
 * Convert frequency to MIDI note
 */
export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440);
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Convert linear value to logarithmic (for audio controls)
 */
export function linearToLog(value: number, min: number, max: number): number {
  const minLog = Math.log(min);
  const maxLog = Math.log(max);
  const scale = (maxLog - minLog) / (max - min);
  return Math.exp(minLog + scale * (value - min));
}

/**
 * Convert logarithmic value to linear
 */
export function logToLinear(value: number, min: number, max: number): number {
  const minLog = Math.log(min);
  const maxLog = Math.log(max);
  const scale = (maxLog - minLog) / (max - min);
  return (Math.log(value) - minLog) / scale + min;
}

/**
 * Format frequency for display
 */
export function formatFrequency(freq: number): string {
  if (freq >= 1000) {
    return `${(freq / 1000).toFixed(2)} kHz`;
  }
  return `${freq.toFixed(1)} Hz`;
}

/**
 * Format voltage for display
 */
export function formatVoltage(voltage: number): string {
  if (Math.abs(voltage) < 0.001) {
    return `${(voltage * 1000000).toFixed(1)} µV`;
  }
  if (Math.abs(voltage) < 1) {
    return `${(voltage * 1000).toFixed(1)} mV`;
  }
  return `${voltage.toFixed(2)} V`;
}

/**
 * Format component value (resistor, capacitor, etc.)
 */
export function formatComponentValue(value: number, unit: string): string {
  const prefixes = [
    { threshold: 1e-12, prefix: 'p', divisor: 1e-12 },
    { threshold: 1e-9, prefix: 'n', divisor: 1e-9 },
    { threshold: 1e-6, prefix: 'µ', divisor: 1e-6 },
    { threshold: 1e-3, prefix: 'm', divisor: 1e-3 },
    { threshold: 1, prefix: '', divisor: 1 },
    { threshold: 1e3, prefix: 'k', divisor: 1e3 },
    { threshold: 1e6, prefix: 'M', divisor: 1e6 },
  ];

  for (let i = prefixes.length - 1; i >= 0; i--) {
    if (value >= prefixes[i].threshold) {
      const scaled = value / prefixes[i].divisor;
      const formatted = scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2);
      return `${formatted}${prefixes[i].prefix}${unit}`;
    }
  }

  return `${value}${unit}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Calculate RMS of audio buffer
 */
export function calculateRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * Calculate peak of audio buffer
 */
export function calculatePeak(buffer: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < buffer.length; i++) {
    const abs = Math.abs(buffer[i]);
    if (abs > peak) peak = abs;
  }
  return peak;
}

/**
 * Convert amplitude to decibels
 */
export function amplitudeToDb(amplitude: number): number {
  return 20 * Math.log10(Math.max(amplitude, 1e-10));
}

/**
 * Convert decibels to amplitude
 */
export function dbToAmplitude(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Get color for signal type
 */
export function getSignalColor(type: string): string {
  const colors: Record<string, string> = {
    audio: '#00d4aa',
    cv: '#ffaa00',
    gate: '#ff6b6b',
    trigger: '#ff6b6b',
    clock: '#9966ff',
  };
  return colors[type] || '#888888';
}
