// ============================================
// Module Definitions
// ============================================

import { ModuleDefinition } from './types';

// VCO Module (based on AS3340)
export const vcoModule: ModuleDefinition = {
  id: 'vco-3340',
  name: 'VCO',
  type: 'vco',
  hp: 10,
  inputs: [
    { id: 'cv-pitch', name: 'V/Oct', type: 'cv', direction: 'input' },
    { id: 'cv-fm', name: 'FM', type: 'cv', direction: 'input' },
    { id: 'cv-pw', name: 'PW', type: 'cv', direction: 'input' },
    { id: 'sync', name: 'Sync', type: 'audio', direction: 'input' },
  ],
  outputs: [
    { id: 'saw', name: 'Saw', type: 'audio', direction: 'output' },
    { id: 'square', name: 'Sq', type: 'audio', direction: 'output' },
    { id: 'triangle', name: 'Tri', type: 'audio', direction: 'output' },
    { id: 'sine', name: 'Sin', type: 'audio', direction: 'output' },
  ],
  controls: [
    { id: 'frequency', name: 'Freq', type: 'knob', min: 20, max: 20000, default: 440, value: 440, curve: 'exponential' },
    { id: 'fine', name: 'Fine', type: 'knob', min: -100, max: 100, default: 0, value: 0, curve: 'linear' },
    { id: 'pw', name: 'PW', type: 'knob', min: 0.05, max: 0.95, default: 0.5, value: 0.5, curve: 'linear' },
    { id: 'fm-amt', name: 'FM', type: 'knob', min: 0, max: 1, default: 0, value: 0, curve: 'linear' },
  ],
  components: [],
  internalConnections: [],
  color: '#2a5a3a',
};

// LFO Module
export const lfoModule: ModuleDefinition = {
  id: 'lfo-basic',
  name: 'LFO',
  type: 'lfo',
  hp: 4,
  inputs: [
    { id: 'cv-rate', name: 'Rate', type: 'cv', direction: 'input' },
  ],
  outputs: [
    { id: 'saw', name: 'Saw', type: 'cv', direction: 'output' },
    { id: 'square', name: 'Sq', type: 'cv', direction: 'output' },
    { id: 'triangle', name: 'Tri', type: 'cv', direction: 'output' },
    { id: 'sine', name: 'Sin', type: 'cv', direction: 'output' },
  ],
  controls: [
    { id: 'rate', name: 'Rate', type: 'knob', min: 0.01, max: 100, default: 1, value: 1, curve: 'exponential' },
  ],
  components: [],
  internalConnections: [],
  color: '#5a3a5a',
};

// VCF Module (State Variable Filter)
export const vcfModule: ModuleDefinition = {
  id: 'vcf-svf',
  name: 'VCF',
  type: 'vcf_multimode',
  hp: 8,
  inputs: [
    { id: 'audio-in', name: 'In', type: 'audio', direction: 'input' },
    { id: 'cv-cutoff', name: 'CV', type: 'cv', direction: 'input' },
    { id: 'cv-res', name: 'Res CV', type: 'cv', direction: 'input' },
  ],
  outputs: [
    { id: 'lowpass', name: 'LP', type: 'audio', direction: 'output' },
    { id: 'highpass', name: 'HP', type: 'audio', direction: 'output' },
    { id: 'bandpass', name: 'BP', type: 'audio', direction: 'output' },
  ],
  controls: [
    { id: 'cutoff', name: 'Cutoff', type: 'knob', min: 20, max: 20000, default: 1000, value: 1000, curve: 'exponential' },
    { id: 'resonance', name: 'Res', type: 'knob', min: 0, max: 0.99, default: 0, value: 0, curve: 'linear' },
    { id: 'cv-amt', name: 'CV Amt', type: 'knob', min: -1, max: 1, default: 0.5, value: 0.5, curve: 'linear' },
  ],
  components: [],
  internalConnections: [],
  color: '#3a4a6a',
};

// VCA Module
export const vcaModule: ModuleDefinition = {
  id: 'vca-basic',
  name: 'VCA',
  type: 'vca',
  hp: 6,
  inputs: [
    { id: 'audio-in', name: 'In', type: 'audio', direction: 'input' },
    { id: 'cv', name: 'CV', type: 'cv', direction: 'input' },
  ],
  outputs: [
    { id: 'audio-out', name: 'Out', type: 'audio', direction: 'output' },
  ],
  controls: [
    { id: 'gain', name: 'Gain', type: 'knob', min: 0, max: 2, default: 1, value: 1, curve: 'linear' },
    { id: 'cv-amt', name: 'CV', type: 'knob', min: 0, max: 1, default: 1, value: 1, curve: 'linear' },
  ],
  components: [],
  internalConnections: [],
  color: '#5a4a3a',
};

// ADSR Envelope
export const adsrModule: ModuleDefinition = {
  id: 'adsr-basic',
  name: 'ADSR',
  type: 'envelope_adsr',
  hp: 8,
  inputs: [
    { id: 'gate', name: 'Gate', type: 'gate', direction: 'input' },
    { id: 'trigger', name: 'Trig', type: 'trigger', direction: 'input' },
  ],
  outputs: [
    { id: 'env-out', name: 'Out', type: 'cv', direction: 'output' },
    { id: 'inv-out', name: 'Inv', type: 'cv', direction: 'output' },
  ],
  controls: [
    { id: 'attack', name: 'A', type: 'knob', min: 0.001, max: 10, default: 0.01, value: 0.01, curve: 'exponential' },
    { id: 'decay', name: 'D', type: 'knob', min: 0.001, max: 10, default: 0.1, value: 0.1, curve: 'exponential' },
    { id: 'sustain', name: 'S', type: 'knob', min: 0, max: 1, default: 0.7, value: 0.7, curve: 'linear' },
    { id: 'release', name: 'R', type: 'knob', min: 0.001, max: 10, default: 0.3, value: 0.3, curve: 'exponential' },
  ],
  components: [],
  internalConnections: [],
  color: '#6a5a3a',
};

// Mixer Module
export const mixerModule: ModuleDefinition = {
  id: 'mixer-4ch',
  name: 'Mixer',
  type: 'mixer',
  hp: 6,
  inputs: [
    { id: 'in-1', name: 'In 1', type: 'audio', direction: 'input' },
    { id: 'in-2', name: 'In 2', type: 'audio', direction: 'input' },
    { id: 'in-3', name: 'In 3', type: 'audio', direction: 'input' },
    { id: 'in-4', name: 'In 4', type: 'audio', direction: 'input' },
  ],
  outputs: [
    { id: 'mix-out', name: 'Out', type: 'audio', direction: 'output' },
  ],
  controls: [
    { id: 'level-1', name: '1', type: 'knob', min: 0, max: 1, default: 0.7, value: 0.7, curve: 'linear' },
    { id: 'level-2', name: '2', type: 'knob', min: 0, max: 1, default: 0.7, value: 0.7, curve: 'linear' },
    { id: 'level-3', name: '3', type: 'knob', min: 0, max: 1, default: 0.7, value: 0.7, curve: 'linear' },
    { id: 'level-4', name: '4', type: 'knob', min: 0, max: 1, default: 0.7, value: 0.7, curve: 'linear' },
  ],
  components: [],
  internalConnections: [],
  color: '#4a4a4a',
};

// Noise Module
export const noiseModule: ModuleDefinition = {
  id: 'noise-basic',
  name: 'Noise',
  type: 'noise',
  hp: 4,
  inputs: [],
  outputs: [
    { id: 'white', name: 'White', type: 'audio', direction: 'output' },
    { id: 'pink', name: 'Pink', type: 'audio', direction: 'output' },
  ],
  controls: [
    { id: 'level', name: 'Level', type: 'knob', min: 0, max: 1, default: 1, value: 1, curve: 'linear' },
  ],
  components: [],
  internalConnections: [],
  color: '#3a3a3a',
};

// Delay Module (PT2399 style)
export const delayModule: ModuleDefinition = {
  id: 'delay-pt2399',
  name: 'Delay',
  type: 'delay',
  hp: 10,
  inputs: [
    { id: 'audio-in', name: 'In', type: 'audio', direction: 'input' },
    { id: 'cv-time', name: 'Time', type: 'cv', direction: 'input' },
  ],
  outputs: [
    { id: 'audio-out', name: 'Out', type: 'audio', direction: 'output' },
    { id: 'wet-out', name: 'Wet', type: 'audio', direction: 'output' },
  ],
  controls: [
    { id: 'time', name: 'Time', type: 'knob', min: 0.01, max: 1, default: 0.3, value: 0.3, curve: 'linear' },
    { id: 'feedback', name: 'Fdbk', type: 'knob', min: 0, max: 0.95, default: 0.3, value: 0.3, curve: 'linear' },
    { id: 'mix', name: 'Mix', type: 'knob', min: 0, max: 1, default: 0.5, value: 0.5, curve: 'linear' },
  ],
  components: [],
  internalConnections: [],
  color: '#3a5a6a',
};

// Output Module
export const outputModule: ModuleDefinition = {
  id: 'output-stereo',
  name: 'Output',
  type: 'output',
  hp: 6,
  inputs: [
    { id: 'left', name: 'L', type: 'audio', direction: 'input' },
    { id: 'right', name: 'R', type: 'audio', direction: 'input' },
  ],
  outputs: [],
  controls: [
    { id: 'volume', name: 'Vol', type: 'knob', min: 0, max: 1, default: 0.7, value: 0.7, curve: 'logarithmic' },
  ],
  components: [],
  internalConnections: [],
  color: '#5a3a3a',
};

// Scope Module
export const scopeModule: ModuleDefinition = {
  id: 'scope-dual',
  name: 'Scope',
  type: 'scope',
  hp: 12,
  inputs: [
    { id: 'ch1', name: 'CH1', type: 'audio', direction: 'input' },
    { id: 'ch2', name: 'CH2', type: 'audio', direction: 'input' },
  ],
  outputs: [],
  controls: [
    { id: 'time-div', name: 'Time', type: 'knob', min: 0.1, max: 100, default: 5, value: 5, curve: 'exponential' },
    { id: 'volt-div', name: 'V/Div', type: 'knob', min: 0.1, max: 10, default: 1, value: 1, curve: 'exponential' },
  ],
  components: [],
  internalConnections: [],
  color: '#2a3a2a',
};

// Clock Module
export const clockModule: ModuleDefinition = {
  id: 'clock-basic',
  name: 'Clock',
  type: 'clock',
  hp: 4,
  inputs: [
    { id: 'cv-rate', name: 'Rate', type: 'cv', direction: 'input' },
  ],
  outputs: [
    { id: 'clock-out', name: 'Clk', type: 'clock', direction: 'output' },
    { id: 'div-2', name: '/2', type: 'clock', direction: 'output' },
    { id: 'div-4', name: '/4', type: 'clock', direction: 'output' },
  ],
  controls: [
    { id: 'bpm', name: 'BPM', type: 'knob', min: 20, max: 300, default: 120, value: 120, curve: 'linear' },
  ],
  components: [],
  internalConnections: [],
  color: '#5a5a3a',
};

// All module definitions
export const moduleDefinitions: Record<string, ModuleDefinition> = {
  'vco-3340': vcoModule,
  'lfo-basic': lfoModule,
  'vcf-svf': vcfModule,
  'vca-basic': vcaModule,
  'adsr-basic': adsrModule,
  'mixer-4ch': mixerModule,
  'noise-basic': noiseModule,
  'delay-pt2399': delayModule,
  'output-stereo': outputModule,
  'scope-dual': scopeModule,
  'clock-basic': clockModule,
};

// Module categories for library browser
export const moduleCategories = [
  {
    id: 'oscillators',
    name: 'Oscillators',
    modules: ['vco-3340', 'lfo-basic', 'noise-basic'],
  },
  {
    id: 'filters',
    name: 'Filters',
    modules: ['vcf-svf'],
  },
  {
    id: 'amplifiers',
    name: 'Amplifiers',
    modules: ['vca-basic', 'mixer-4ch'],
  },
  {
    id: 'modulators',
    name: 'Modulators',
    modules: ['adsr-basic', 'lfo-basic'],
  },
  {
    id: 'effects',
    name: 'Effects',
    modules: ['delay-pt2399'],
  },
  {
    id: 'utility',
    name: 'Utility',
    modules: ['clock-basic', 'output-stereo', 'scope-dual'],
  },
];

export function getModuleDefinition(id: string): ModuleDefinition | undefined {
  return moduleDefinitions[id];
}
