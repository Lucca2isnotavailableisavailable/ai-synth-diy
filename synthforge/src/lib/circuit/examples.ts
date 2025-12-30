// ============================================
// Example Circuits
// ============================================

import { Circuit, ComponentInstance, Wire } from './types';

// Helper to generate IDs
let idCounter = 0;
const genWireId = () => `wire_${idCounter++}`;

// Reset counter for each example
const resetIds = () => { idCounter = 0; };

// ============================================
// Simple Oscillator (Op-Amp Relaxation Oscillator)
// ============================================
export function createRelaxationOscillator(): Circuit {
  resetIds();
  
  const components: ComponentInstance[] = [
    // Power rails
    {
      id: 'vcc',
      type: 'vcc',
      params: { voltage: 12 },
      position: { x: 100, y: 50 },
      rotation: 0,
      state: {},
      pins: [],
    },
    {
      id: 'vee',
      type: 'vee',
      params: { voltage: -12 },
      position: { x: 100, y: 350 },
      rotation: 0,
      state: {},
      pins: [],
    },
    {
      id: 'gnd',
      type: 'ground',
      params: {},
      position: { x: 100, y: 200 },
      rotation: 0,
      state: {},
      pins: [],
    },
    // Op-amp as comparator/integrator
    {
      id: 'opamp1',
      type: 'opamp_tl072',
      params: { openLoopGain: 100000, slewRate: 13, outputSwing: 1.5 },
      position: { x: 300, y: 200 },
      rotation: 0,
      state: {},
      pins: [],
    },
    // Timing capacitor
    {
      id: 'c1',
      type: 'capacitor',
      params: { capacitance: 0.0000001 }, // 100nF
      position: { x: 200, y: 200 },
      rotation: 0,
      state: {},
      pins: [],
    },
    // Timing resistor
    {
      id: 'r1',
      type: 'resistor',
      params: { resistance: 10000 }, // 10k
      position: { x: 400, y: 150 },
      rotation: 0,
      state: {},
      pins: [],
    },
    // Feedback resistor 1
    {
      id: 'r2',
      type: 'resistor',
      params: { resistance: 10000 }, // 10k
      position: { x: 400, y: 250 },
      rotation: 0,
      state: {},
      pins: [],
    },
    // Feedback resistor 2
    {
      id: 'r3',
      type: 'resistor',
      params: { resistance: 10000 }, // 10k
      position: { x: 450, y: 200 },
      rotation: 0,
      state: {},
      pins: [],
    },
    // Audio output
    {
      id: 'out',
      type: 'audio_output',
      params: {},
      position: { x: 550, y: 200 },
      rotation: 0,
      state: {},
      pins: [],
    },
    // Scope probe
    {
      id: 'probe1',
      type: 'scope_probe',
      params: { channel: 1 },
      position: { x: 500, y: 150 },
      rotation: 0,
      state: {},
      pins: [],
    },
  ];
  
  const wires: Wire[] = [
    // Power connections
    { id: genWireId(), from: { componentId: 'vcc', pinId: 'vcc' }, to: { componentId: 'opamp1', pinId: 'vcc' } },
    { id: genWireId(), from: { componentId: 'vee', pinId: 'vee' }, to: { componentId: 'opamp1', pinId: 'vee' } },
    // Feedback network
    { id: genWireId(), from: { componentId: 'opamp1', pinId: 'out' }, to: { componentId: 'r1', pinId: 'a' } },
    { id: genWireId(), from: { componentId: 'r1', pinId: 'b' }, to: { componentId: 'c1', pinId: 'a' } },
    { id: genWireId(), from: { componentId: 'c1', pinId: 'a' }, to: { componentId: 'opamp1', pinId: 'in_neg' } },
    { id: genWireId(), from: { componentId: 'c1', pinId: 'b' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    // Hysteresis
    { id: genWireId(), from: { componentId: 'opamp1', pinId: 'out' }, to: { componentId: 'r2', pinId: 'a' } },
    { id: genWireId(), from: { componentId: 'r2', pinId: 'b' }, to: { componentId: 'opamp1', pinId: 'in_pos' } },
    { id: genWireId(), from: { componentId: 'opamp1', pinId: 'in_pos' }, to: { componentId: 'r3', pinId: 'a' } },
    { id: genWireId(), from: { componentId: 'r3', pinId: 'b' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    // Output
    { id: genWireId(), from: { componentId: 'opamp1', pinId: 'out' }, to: { componentId: 'out', pinId: 'tip' } },
    { id: genWireId(), from: { componentId: 'opamp1', pinId: 'out' }, to: { componentId: 'probe1', pinId: 'probe' } },
    { id: genWireId(), from: { componentId: 'out', pinId: 'sleeve' }, to: { componentId: 'gnd', pinId: 'gnd' } },
  ];
  
  return {
    id: 'relaxation_osc',
    name: 'Relaxation Oscillator',
    components,
    wires,
    nodes: [],
  };
}

// ============================================
// VCO using CEM3340
// ============================================
export function createCEM3340VCO(): Circuit {
  resetIds();
  
  const components: ComponentInstance[] = [
    // Power
    { id: 'vcc', type: 'vcc', params: { voltage: 12 }, position: { x: 50, y: 50 }, rotation: 0, state: {}, pins: [] },
    { id: 'vee', type: 'vee', params: { voltage: -12 }, position: { x: 50, y: 350 }, rotation: 0, state: {}, pins: [] },
    { id: 'gnd', type: 'ground', params: {}, position: { x: 50, y: 200 }, rotation: 0, state: {}, pins: [] },
    
    // The VCO chip
    {
      id: 'vco',
      type: 'ic_cem3340',
      params: { baseFreq: 8.175 }, // C0 = 8.175 Hz, so 5V CV = C5 = 261.6 Hz
      position: { x: 300, y: 200 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // CV Input (pitch)
    {
      id: 'cv_in',
      type: 'voltage_source',
      params: { dcVoltage: 5, acAmplitude: 0 }, // 5V = middle C
      position: { x: 150, y: 150 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // PW modulation source (LFO)
    {
      id: 'pw_lfo',
      type: 'voltage_source',
      params: { dcVoltage: 0, acAmplitude: 0.5, acFrequency: 0.5, waveform: 3 }, // Slow triangle LFO
      position: { x: 150, y: 250 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // Output
    { id: 'out', type: 'audio_output', params: {}, position: { x: 500, y: 200 }, rotation: 0, state: {}, pins: [] },
    
    // Scope probes
    { id: 'probe_saw', type: 'scope_probe', params: { channel: 1 }, position: { x: 450, y: 100 }, rotation: 0, state: {}, pins: [] },
    { id: 'probe_tri', type: 'scope_probe', params: { channel: 2 }, position: { x: 450, y: 150 }, rotation: 0, state: {}, pins: [] },
    { id: 'probe_pulse', type: 'scope_probe', params: { channel: 3 }, position: { x: 450, y: 200 }, rotation: 0, state: {}, pins: [] },
  ];
  
  const wires: Wire[] = [
    // Power
    { id: genWireId(), from: { componentId: 'vcc', pinId: 'vcc' }, to: { componentId: 'vco', pinId: 'vcc' } },
    { id: genWireId(), from: { componentId: 'vee', pinId: 'vee' }, to: { componentId: 'vco', pinId: 'vee' } },
    
    // CV -> VCO
    { id: genWireId(), from: { componentId: 'cv_in', pinId: 'pos' }, to: { componentId: 'vco', pinId: 'cv_exp' } },
    { id: genWireId(), from: { componentId: 'cv_in', pinId: 'neg' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    
    // PW modulation
    { id: genWireId(), from: { componentId: 'pw_lfo', pinId: 'pos' }, to: { componentId: 'vco', pinId: 'pw_cv' } },
    { id: genWireId(), from: { componentId: 'pw_lfo', pinId: 'neg' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    
    // Output (saw)
    { id: genWireId(), from: { componentId: 'vco', pinId: 'saw_out' }, to: { componentId: 'out', pinId: 'tip' } },
    { id: genWireId(), from: { componentId: 'out', pinId: 'sleeve' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    
    // Probes
    { id: genWireId(), from: { componentId: 'vco', pinId: 'saw_out' }, to: { componentId: 'probe_saw', pinId: 'probe' } },
    { id: genWireId(), from: { componentId: 'vco', pinId: 'tri_out' }, to: { componentId: 'probe_tri', pinId: 'probe' } },
    { id: genWireId(), from: { componentId: 'vco', pinId: 'pulse_out' }, to: { componentId: 'probe_pulse', pinId: 'probe' } },
  ];
  
  return {
    id: 'cem3340_vco',
    name: 'CEM3340/AS3340 VCO',
    components,
    wires,
    nodes: [],
  };
}

// ============================================
// OTA-based VCA (LM13700)
// ============================================
export function createOTAVCA(): Circuit {
  resetIds();
  
  const components: ComponentInstance[] = [
    // Power
    { id: 'vcc', type: 'vcc', params: { voltage: 12 }, position: { x: 50, y: 50 }, rotation: 0, state: {}, pins: [] },
    { id: 'vee', type: 'vee', params: { voltage: -12 }, position: { x: 50, y: 350 }, rotation: 0, state: {}, pins: [] },
    { id: 'gnd', type: 'ground', params: {}, position: { x: 50, y: 200 }, rotation: 0, state: {}, pins: [] },
    
    // The OTA
    {
      id: 'ota',
      type: 'ota_lm13700',
      params: { gmFactor: 19.2, useLinearizingDiodes: 1 },
      position: { x: 300, y: 200 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // Audio input (sine wave)
    {
      id: 'audio_in',
      type: 'voltage_source',
      params: { dcVoltage: 0, acAmplitude: 1, acFrequency: 440, waveform: 0 },
      position: { x: 150, y: 150 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // CV input (control voltage for gain)
    {
      id: 'cv_in',
      type: 'voltage_source',
      params: { dcVoltage: 2, acAmplitude: 2, acFrequency: 0.5, waveform: 3 }, // Tremolo effect
      position: { x: 150, y: 300 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // Iabc set resistor
    {
      id: 'r_iabc',
      type: 'resistor',
      params: { resistance: 10000 },
      position: { x: 250, y: 300 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // Output
    { id: 'out', type: 'audio_output', params: {}, position: { x: 500, y: 200 }, rotation: 0, state: {}, pins: [] },
    { id: 'probe1', type: 'scope_probe', params: { channel: 1 }, position: { x: 450, y: 150 }, rotation: 0, state: {}, pins: [] },
  ];
  
  const wires: Wire[] = [
    // Power
    { id: genWireId(), from: { componentId: 'vcc', pinId: 'vcc' }, to: { componentId: 'ota', pinId: 'vcc' } },
    { id: genWireId(), from: { componentId: 'vee', pinId: 'vee' }, to: { componentId: 'ota', pinId: 'vee' } },
    
    // Audio input to OTA
    { id: genWireId(), from: { componentId: 'audio_in', pinId: 'pos' }, to: { componentId: 'ota', pinId: 'in_pos' } },
    { id: genWireId(), from: { componentId: 'audio_in', pinId: 'neg' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    { id: genWireId(), from: { componentId: 'ota', pinId: 'in_neg' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    
    // CV to Iabc (via resistor)
    { id: genWireId(), from: { componentId: 'cv_in', pinId: 'pos' }, to: { componentId: 'r_iabc', pinId: 'a' } },
    { id: genWireId(), from: { componentId: 'r_iabc', pinId: 'b' }, to: { componentId: 'ota', pinId: 'iabc' } },
    { id: genWireId(), from: { componentId: 'cv_in', pinId: 'neg' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    
    // Output
    { id: genWireId(), from: { componentId: 'ota', pinId: 'out' }, to: { componentId: 'out', pinId: 'tip' } },
    { id: genWireId(), from: { componentId: 'out', pinId: 'sleeve' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    { id: genWireId(), from: { componentId: 'ota', pinId: 'out' }, to: { componentId: 'probe1', pinId: 'probe' } },
  ];
  
  return {
    id: 'ota_vca',
    name: 'LM13700 OTA VCA',
    components,
    wires,
    nodes: [],
  };
}

// ============================================
// PT2399 Delay
// ============================================
export function createPT2399Delay(): Circuit {
  resetIds();
  
  const components: ComponentInstance[] = [
    // Power
    { id: 'vcc', type: 'vcc', params: { voltage: 5 }, position: { x: 50, y: 50 }, rotation: 0, state: {}, pins: [] },
    { id: 'gnd', type: 'ground', params: {}, position: { x: 50, y: 300 }, rotation: 0, state: {}, pins: [] },
    
    // Audio input
    {
      id: 'audio_in',
      type: 'voltage_source',
      params: { dcVoltage: 0, acAmplitude: 0.5, acFrequency: 440, waveform: 1 }, // Square wave
      position: { x: 100, y: 150 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // The delay chip
    {
      id: 'delay',
      type: 'ic_pt2399',
      params: { minDelay: 0.03, maxDelay: 0.34 },
      position: { x: 300, y: 200 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // Delay time control (pot)
    {
      id: 'time_ctrl',
      type: 'voltage_source',
      params: { dcVoltage: 2.5, acAmplitude: 0 }, // Mid-range delay
      position: { x: 200, y: 250 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // Feedback resistor
    {
      id: 'r_fb',
      type: 'resistor',
      params: { resistance: 47000 }, // Sets feedback amount
      position: { x: 400, y: 150 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // Mix resistors
    {
      id: 'r_dry',
      type: 'resistor',
      params: { resistance: 10000 },
      position: { x: 200, y: 150 },
      rotation: 0,
      state: {},
      pins: [],
    },
    {
      id: 'r_wet',
      type: 'resistor',
      params: { resistance: 10000 },
      position: { x: 400, y: 200 },
      rotation: 0,
      state: {},
      pins: [],
    },
    
    // Output
    { id: 'out', type: 'audio_output', params: {}, position: { x: 500, y: 200 }, rotation: 0, state: {}, pins: [] },
    { id: 'probe1', type: 'scope_probe', params: { channel: 1 }, position: { x: 500, y: 150 }, rotation: 0, state: {}, pins: [] },
  ];
  
  const wires: Wire[] = [
    // Power
    { id: genWireId(), from: { componentId: 'vcc', pinId: 'vcc' }, to: { componentId: 'delay', pinId: 'vcc' } },
    { id: genWireId(), from: { componentId: 'gnd', pinId: 'gnd' }, to: { componentId: 'delay', pinId: 'gnd' } },
    
    // Audio input to delay
    { id: genWireId(), from: { componentId: 'audio_in', pinId: 'pos' }, to: { componentId: 'delay', pinId: 'in' } },
    { id: genWireId(), from: { componentId: 'audio_in', pinId: 'neg' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    
    // Delay time control
    { id: genWireId(), from: { componentId: 'time_ctrl', pinId: 'pos' }, to: { componentId: 'delay', pinId: 'r_ext' } },
    { id: genWireId(), from: { componentId: 'time_ctrl', pinId: 'neg' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    
    // Output (wet signal)
    { id: genWireId(), from: { componentId: 'delay', pinId: 'out' }, to: { componentId: 'out', pinId: 'tip' } },
    { id: genWireId(), from: { componentId: 'out', pinId: 'sleeve' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    { id: genWireId(), from: { componentId: 'delay', pinId: 'out' }, to: { componentId: 'probe1', pinId: 'probe' } },
  ];
  
  return {
    id: 'pt2399_delay',
    name: 'PT2399 Delay',
    components,
    wires,
    nodes: [],
  };
}

// ============================================
// Simple Sine Wave (Just a voltage source for testing)
// ============================================
export function createSimpleSine(): Circuit {
  resetIds();
  
  const components: ComponentInstance[] = [
    { id: 'gnd', type: 'ground', params: {}, position: { x: 100, y: 250 }, rotation: 0, state: {}, pins: [] },
    {
      id: 'src',
      type: 'voltage_source',
      params: { dcVoltage: 0, acAmplitude: 5, acFrequency: 440, waveform: 0 },
      position: { x: 200, y: 150 },
      rotation: 0,
      state: {},
      pins: [],
    },
    { id: 'out', type: 'audio_output', params: {}, position: { x: 350, y: 150 }, rotation: 0, state: {}, pins: [] },
    { id: 'probe', type: 'scope_probe', params: { channel: 1 }, position: { x: 350, y: 100 }, rotation: 0, state: {}, pins: [] },
  ];
  
  const wires: Wire[] = [
    { id: genWireId(), from: { componentId: 'src', pinId: 'pos' }, to: { componentId: 'out', pinId: 'tip' } },
    { id: genWireId(), from: { componentId: 'src', pinId: 'neg' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    { id: genWireId(), from: { componentId: 'out', pinId: 'sleeve' }, to: { componentId: 'gnd', pinId: 'gnd' } },
    { id: genWireId(), from: { componentId: 'src', pinId: 'pos' }, to: { componentId: 'probe', pinId: 'probe' } },
  ];
  
  return {
    id: 'simple_sine',
    name: 'Simple Sine Wave Test',
    components,
    wires,
    nodes: [],
  };
}

// ============================================
// Example Circuits List
// ============================================
export const exampleCircuits = [
  { id: 'simple_sine', name: 'Simple Sine Wave (Test)', factory: createSimpleSine },
  { id: 'cem3340_vco', name: 'CEM3340/AS3340 VCO', factory: createCEM3340VCO },
  { id: 'ota_vca', name: 'LM13700 OTA VCA', factory: createOTAVCA },
  { id: 'pt2399_delay', name: 'PT2399 Delay', factory: createPT2399Delay },
  { id: 'relaxation_osc', name: 'Op-Amp Relaxation Oscillator', factory: createRelaxationOscillator },
];
