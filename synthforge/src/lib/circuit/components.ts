// ============================================
// Component Definitions Library
// ============================================

import { ComponentDefinition, ComponentType } from './types';

// ============================================
// PASSIVE COMPONENTS
// ============================================

export const resistor: ComponentDefinition = {
  type: 'resistor',
  category: 'passive',
  name: 'Resistor',
  description: 'Standard resistor - limits current flow',
  pins: [
    { id: 'a', name: 'A', type: 'bidirectional' },
    { id: 'b', name: 'B', type: 'bidirectional' },
  ],
  defaultParams: { resistance: 10000 },
  paramLabels: {
    resistance: { label: 'Resistance', unit: 'Ω', min: 1, max: 10000000 },
  },
  symbol: 'R',
};

export const capacitor: ComponentDefinition = {
  type: 'capacitor',
  category: 'passive',
  name: 'Capacitor',
  description: 'Stores charge - blocks DC, passes AC. Higher freq = lower impedance',
  pins: [
    { id: 'a', name: '+', type: 'bidirectional' },
    { id: 'b', name: '-', type: 'bidirectional' },
  ],
  defaultParams: { capacitance: 0.0000001 }, // 100nF
  paramLabels: {
    capacitance: { label: 'Capacitance', unit: 'F', min: 1e-12, max: 0.01 },
  },
  symbol: 'C',
};

export const inductor: ComponentDefinition = {
  type: 'inductor',
  category: 'passive',
  name: 'Inductor',
  description: 'Stores energy in magnetic field - passes DC, blocks AC',
  pins: [
    { id: 'a', name: 'A', type: 'bidirectional' },
    { id: 'b', name: 'B', type: 'bidirectional' },
  ],
  defaultParams: { inductance: 0.001 }, // 1mH
  paramLabels: {
    inductance: { label: 'Inductance', unit: 'H', min: 1e-9, max: 1 },
  },
  symbol: 'L',
};

export const potentiometer: ComponentDefinition = {
  type: 'potentiometer',
  category: 'passive',
  name: 'Potentiometer',
  description: 'Variable resistor with wiper',
  pins: [
    { id: 'ccw', name: 'CCW', type: 'bidirectional' },
    { id: 'wiper', name: 'Wiper', type: 'bidirectional' },
    { id: 'cw', name: 'CW', type: 'bidirectional' },
  ],
  defaultParams: { 
    totalResistance: 10000,
    position: 0.5, // 0-1
    taper: 0, // 0 = linear, 1 = log, -1 = reverse log
  },
  paramLabels: {
    totalResistance: { label: 'Total R', unit: 'Ω', min: 100, max: 1000000 },
    position: { label: 'Position', unit: '', min: 0, max: 1 },
    taper: { label: 'Taper', unit: '', min: -1, max: 1 },
  },
  symbol: 'POT',
};

// ============================================
// SEMICONDUCTORS
// ============================================

export const diode: ComponentDefinition = {
  type: 'diode',
  category: 'semiconductor',
  name: 'Diode (1N4148)',
  description: 'Signal diode - conducts in one direction with ~0.6V drop',
  pins: [
    { id: 'anode', name: 'A', type: 'bidirectional' },
    { id: 'cathode', name: 'K', type: 'bidirectional' },
  ],
  defaultParams: {
    vForward: 0.6,
    saturationCurrent: 1e-14,
    idealityFactor: 1.0,
  },
  paramLabels: {
    vForward: { label: 'Vf', unit: 'V', min: 0.2, max: 1.0 },
    saturationCurrent: { label: 'Is', unit: 'A', min: 1e-16, max: 1e-10 },
    idealityFactor: { label: 'n', unit: '', min: 1, max: 2 },
  },
  symbol: 'D',
};

export const zener: ComponentDefinition = {
  type: 'zener',
  category: 'semiconductor',
  name: 'Zener Diode',
  description: 'Conducts in reverse at specific breakdown voltage',
  pins: [
    { id: 'anode', name: 'A', type: 'bidirectional' },
    { id: 'cathode', name: 'K', type: 'bidirectional' },
  ],
  defaultParams: {
    vForward: 0.6,
    vZener: 5.1,
    zenerResistance: 10,
  },
  paramLabels: {
    vForward: { label: 'Vf', unit: 'V', min: 0.2, max: 1.0 },
    vZener: { label: 'Vz', unit: 'V', min: 1.8, max: 200 },
    zenerResistance: { label: 'Rz', unit: 'Ω', min: 1, max: 1000 },
  },
  symbol: 'Z',
};

export const led: ComponentDefinition = {
  type: 'led',
  category: 'semiconductor',
  name: 'LED',
  description: 'Light emitting diode',
  pins: [
    { id: 'anode', name: 'A', type: 'bidirectional' },
    { id: 'cathode', name: 'K', type: 'bidirectional' },
  ],
  defaultParams: {
    vForward: 2.0, // Red ~1.8V, Green ~2.1V, Blue ~3.2V
    typicalCurrent: 0.01, // 10mA
  },
  paramLabels: {
    vForward: { label: 'Vf', unit: 'V', min: 1.6, max: 3.5 },
    typicalCurrent: { label: 'If', unit: 'A', min: 0.001, max: 0.03 },
  },
  symbol: 'LED',
};

export const npnTransistor: ComponentDefinition = {
  type: 'npn',
  category: 'semiconductor',
  name: 'NPN Transistor (2N3904)',
  description: 'NPN bipolar junction transistor',
  pins: [
    { id: 'base', name: 'B', type: 'input' },
    { id: 'collector', name: 'C', type: 'bidirectional' },
    { id: 'emitter', name: 'E', type: 'bidirectional' },
  ],
  defaultParams: {
    beta: 150, // Current gain (hFE)
    vbe: 0.65, // Base-emitter voltage
    vcesat: 0.2, // Saturation voltage
    vaf: 100, // Early voltage
  },
  paramLabels: {
    beta: { label: 'β (hFE)', unit: '', min: 50, max: 1000 },
    vbe: { label: 'Vbe', unit: 'V', min: 0.5, max: 0.8 },
    vcesat: { label: 'Vce(sat)', unit: 'V', min: 0.1, max: 0.4 },
    vaf: { label: 'Early V', unit: 'V', min: 50, max: 500 },
  },
  symbol: 'NPN',
};

export const pnpTransistor: ComponentDefinition = {
  type: 'pnp',
  category: 'semiconductor',
  name: 'PNP Transistor (2N3906)',
  description: 'PNP bipolar junction transistor',
  pins: [
    { id: 'base', name: 'B', type: 'input' },
    { id: 'collector', name: 'C', type: 'bidirectional' },
    { id: 'emitter', name: 'E', type: 'bidirectional' },
  ],
  defaultParams: {
    beta: 150,
    vbe: 0.65,
    vcesat: 0.2,
    vaf: 100,
  },
  paramLabels: {
    beta: { label: 'β (hFE)', unit: '', min: 50, max: 1000 },
    vbe: { label: 'Vbe', unit: 'V', min: 0.5, max: 0.8 },
    vcesat: { label: 'Vce(sat)', unit: 'V', min: 0.1, max: 0.4 },
    vaf: { label: 'Early V', unit: 'V', min: 50, max: 500 },
  },
  symbol: 'PNP',
};

export const jfetN: ComponentDefinition = {
  type: 'jfet_n',
  category: 'semiconductor',
  name: 'N-JFET (2N5457)',
  description: 'N-channel JFET - voltage controlled resistor',
  pins: [
    { id: 'gate', name: 'G', type: 'input' },
    { id: 'drain', name: 'D', type: 'bidirectional' },
    { id: 'source', name: 'S', type: 'bidirectional' },
  ],
  defaultParams: {
    idss: 0.003, // 3mA
    vgsOff: -3, // Pinch-off voltage
    rds: 200, // On resistance
  },
  paramLabels: {
    idss: { label: 'Idss', unit: 'A', min: 0.0001, max: 0.02 },
    vgsOff: { label: 'Vgs(off)', unit: 'V', min: -8, max: -0.5 },
    rds: { label: 'Rds', unit: 'Ω', min: 50, max: 1000 },
  },
  symbol: 'JFET',
};

// ============================================
// OP-AMPS
// ============================================

export const opampTL072: ComponentDefinition = {
  type: 'opamp_tl072',
  category: 'opamp',
  name: 'TL072 Op-Amp',
  description: 'JFET input op-amp - THE synth op-amp',
  pins: [
    { id: 'in_pos', name: 'IN+', type: 'input' },
    { id: 'in_neg', name: 'IN-', type: 'input' },
    { id: 'out', name: 'OUT', type: 'output' },
    { id: 'vcc', name: 'V+', type: 'power' },
    { id: 'vee', name: 'V-', type: 'power' },
  ],
  defaultParams: {
    openLoopGain: 100000,
    gbw: 3000000, // 3MHz
    slewRate: 13, // 13 V/µs
    inputBias: 30e-12, // 30pA (JFET input)
    inputOffset: 0.003, // 3mV
    outputSwing: 1.5, // Volts from rail
  },
  paramLabels: {
    openLoopGain: { label: 'Aol', unit: '', min: 10000, max: 10000000 },
    gbw: { label: 'GBW', unit: 'Hz', min: 100000, max: 100000000 },
    slewRate: { label: 'Slew', unit: 'V/µs', min: 0.5, max: 100 },
    inputOffset: { label: 'Vos', unit: 'V', min: 0, max: 0.01 },
    outputSwing: { label: 'Swing', unit: 'V', min: 0.5, max: 3 },
  },
  symbol: 'OP',
};

export const opampGeneric: ComponentDefinition = {
  type: 'opamp_generic',
  category: 'opamp',
  name: 'Generic Op-Amp',
  description: 'Ideal op-amp with configurable parameters',
  pins: [
    { id: 'in_pos', name: 'IN+', type: 'input' },
    { id: 'in_neg', name: 'IN-', type: 'input' },
    { id: 'out', name: 'OUT', type: 'output' },
    { id: 'vcc', name: 'V+', type: 'power' },
    { id: 'vee', name: 'V-', type: 'power' },
  ],
  defaultParams: {
    openLoopGain: 100000,
    gbw: 1000000,
    slewRate: 1,
    outputSwing: 1.0,
  },
  paramLabels: {
    openLoopGain: { label: 'Aol', unit: '', min: 100, max: 10000000 },
    gbw: { label: 'GBW', unit: 'Hz', min: 10000, max: 100000000 },
    slewRate: { label: 'Slew', unit: 'V/µs', min: 0.1, max: 1000 },
    outputSwing: { label: 'Swing', unit: 'V', min: 0, max: 5 },
  },
  symbol: 'OP',
};

// ============================================
// OTAs (Operational Transconductance Amplifiers)
// ============================================

export const otaLM13700: ComponentDefinition = {
  type: 'ota_lm13700',
  category: 'ota',
  name: 'LM13700 OTA',
  description: 'THE synth building block! Iout = gm × (V+ - V-), gm controlled by Iabc',
  pins: [
    { id: 'in_pos', name: 'IN+', type: 'input' },
    { id: 'in_neg', name: 'IN-', type: 'input' },
    { id: 'out', name: 'OUT', type: 'output' },
    { id: 'iabc', name: 'Iabc', type: 'input' }, // Control current
    { id: 'vcc', name: 'V+', type: 'power' },
    { id: 'vee', name: 'V-', type: 'power' },
    { id: 'buf_in', name: 'Buf In', type: 'input' }, // Buffer input
    { id: 'buf_out', name: 'Buf Out', type: 'output' }, // Buffer output
  ],
  defaultParams: {
    gmMax: 0.02, // 20 mS at 1mA Iabc
    gmFactor: 19.2, // gm ≈ 19.2 × Iabc (at room temp)
    inputLinRange: 0.025, // ±25mV linear input range
    useLinearizingDiodes: 1, // 0 or 1
  },
  paramLabels: {
    gmMax: { label: 'gm max', unit: 'S', min: 0.001, max: 0.1 },
    gmFactor: { label: 'gm/Iabc', unit: 'S/A', min: 15, max: 25 },
    inputLinRange: { label: 'Lin Range', unit: 'V', min: 0.01, max: 0.1 },
    useLinearizingDiodes: { label: 'Lin Diodes', unit: '', min: 0, max: 1 },
  },
  symbol: 'OTA',
};

// ============================================
// COMPARATORS
// ============================================

export const comparatorLM311: ComponentDefinition = {
  type: 'comparator_lm311',
  category: 'comparator',
  name: 'LM311 Comparator',
  description: 'Open collector output comparator',
  pins: [
    { id: 'in_pos', name: 'IN+', type: 'input' },
    { id: 'in_neg', name: 'IN-', type: 'input' },
    { id: 'out', name: 'OUT', type: 'output' },
    { id: 'gnd_e', name: 'GND/E', type: 'bidirectional' },
    { id: 'vcc', name: 'V+', type: 'power' },
    { id: 'vee', name: 'V-', type: 'power' },
  ],
  defaultParams: {
    hysteresis: 0.002, // 2mV
    responseTime: 200e-9, // 200ns
    satVoltage: 0.3,
  },
  paramLabels: {
    hysteresis: { label: 'Hysteresis', unit: 'V', min: 0, max: 0.1 },
    responseTime: { label: 'Response', unit: 's', min: 10e-9, max: 10e-6 },
    satVoltage: { label: 'Vsat', unit: 'V', min: 0.1, max: 1 },
  },
  symbol: 'CMP',
};

// ============================================
// ICs
// ============================================

export const ic555: ComponentDefinition = {
  type: 'ic_555',
  category: 'ic',
  name: '555 Timer',
  description: 'Classic timer IC - oscillator, monostable, PWM',
  pins: [
    { id: 'gnd', name: 'GND', type: 'power' },
    { id: 'trig', name: 'TRIG', type: 'input' },
    { id: 'out', name: 'OUT', type: 'output' },
    { id: 'reset', name: 'RESET', type: 'input' },
    { id: 'ctrl', name: 'CTRL', type: 'bidirectional' },
    { id: 'thresh', name: 'THRESH', type: 'input' },
    { id: 'disch', name: 'DISCH', type: 'output' },
    { id: 'vcc', name: 'VCC', type: 'power' },
  ],
  defaultParams: {},
  paramLabels: {},
  symbol: '555',
};

export const icPT2399: ComponentDefinition = {
  type: 'ic_pt2399',
  category: 'ic',
  name: 'PT2399 Delay',
  description: 'Echo/delay IC - 30ms to 340ms delay, lo-fi character',
  pins: [
    { id: 'vcc', name: 'VCC', type: 'power' },
    { id: 'gnd', name: 'GND', type: 'power' },
    { id: 'in', name: 'IN', type: 'input' },
    { id: 'out', name: 'OUT', type: 'output' },
    { id: 'r_ext', name: 'R_EXT', type: 'bidirectional' }, // Delay time control
    { id: 'vref', name: 'VREF', type: 'output' }, // Internal VCC/2 reference
  ],
  defaultParams: {
    minDelay: 0.03, // 30ms
    maxDelay: 0.34, // 340ms
    bitDepth: 14, // Effective bit depth (lo-fi)
    internalSampleRate: 44100,
  },
  paramLabels: {
    minDelay: { label: 'Min Delay', unit: 's', min: 0.01, max: 0.1 },
    maxDelay: { label: 'Max Delay', unit: 's', min: 0.2, max: 1 },
    bitDepth: { label: 'Bit Depth', unit: 'bits', min: 8, max: 16 },
  },
  symbol: 'PT2399',
};

export const icCEM3340: ComponentDefinition = {
  type: 'ic_cem3340',
  category: 'ic',
  name: 'CEM3340/AS3340 VCO',
  description: 'Precision VCO chip - saw, triangle, pulse outputs',
  pins: [
    { id: 'vcc', name: 'VCC', type: 'power' },
    { id: 'vee', name: 'VEE', type: 'power' },
    { id: 'cv_linear', name: 'CV Lin', type: 'input' },
    { id: 'cv_exp', name: 'CV Exp', type: 'input' },
    { id: 'pw_cv', name: 'PW CV', type: 'input' },
    { id: 'sync', name: 'SYNC', type: 'input' },
    { id: 'saw_out', name: 'SAW', type: 'output' },
    { id: 'tri_out', name: 'TRI', type: 'output' },
    { id: 'pulse_out', name: 'PULSE', type: 'output' },
    { id: 'freq_adj', name: 'FREQ', type: 'input' },
  ],
  defaultParams: {
    tempCoeff: 3300, // ppm/°C for expo converter
    freqRange: 10, // Octaves
    baseFreq: 1, // Hz at 0V CV
  },
  paramLabels: {
    tempCoeff: { label: 'Temp Coeff', unit: 'ppm/°C', min: 1000, max: 5000 },
    freqRange: { label: 'Range', unit: 'oct', min: 5, max: 15 },
    baseFreq: { label: 'Base Freq', unit: 'Hz', min: 0.1, max: 20 },
  },
  symbol: '3340',
};

export const icSSI2164: ComponentDefinition = {
  type: 'ic_ssi2164',
  category: 'ic',
  name: 'SSI2164 Quad VCA',
  description: '4-channel exponential VCA',
  pins: [
    { id: 'vcc', name: 'VCC', type: 'power' },
    { id: 'vee', name: 'VEE', type: 'power' },
    { id: 'in1', name: 'IN1', type: 'input' },
    { id: 'cv1', name: 'CV1', type: 'input' },
    { id: 'out1', name: 'OUT1', type: 'output' },
    { id: 'in2', name: 'IN2', type: 'input' },
    { id: 'cv2', name: 'CV2', type: 'input' },
    { id: 'out2', name: 'OUT2', type: 'output' },
    { id: 'in3', name: 'IN3', type: 'input' },
    { id: 'cv3', name: 'CV3', type: 'input' },
    { id: 'out3', name: 'OUT3', type: 'output' },
    { id: 'in4', name: 'IN4', type: 'input' },
    { id: 'cv4', name: 'CV4', type: 'input' },
    { id: 'out4', name: 'OUT4', type: 'output' },
  ],
  defaultParams: {
    dbPerVolt: 33, // dB per volt control
    feedthrough: -90, // dB feedthrough
  },
  paramLabels: {
    dbPerVolt: { label: 'dB/V', unit: 'dB/V', min: 20, max: 50 },
    feedthrough: { label: 'Feedthrough', unit: 'dB', min: -120, max: -60 },
  },
  symbol: '2164',
};

// ============================================
// SOURCES
// ============================================

export const voltageSource: ComponentDefinition = {
  type: 'voltage_source',
  category: 'source',
  name: 'Voltage Source',
  description: 'DC or AC voltage source',
  pins: [
    { id: 'pos', name: '+', type: 'output' },
    { id: 'neg', name: '-', type: 'output' },
  ],
  defaultParams: {
    dcVoltage: 0,
    acAmplitude: 0,
    acFrequency: 1000,
    waveform: 0, // 0=sine, 1=square, 2=saw, 3=triangle
  },
  paramLabels: {
    dcVoltage: { label: 'DC', unit: 'V', min: -15, max: 15 },
    acAmplitude: { label: 'AC Amp', unit: 'V', min: 0, max: 10 },
    acFrequency: { label: 'Freq', unit: 'Hz', min: 0.01, max: 20000 },
    waveform: { label: 'Wave', unit: '', min: 0, max: 3 },
  },
  symbol: 'V',
};

export const ground: ComponentDefinition = {
  type: 'ground',
  category: 'source',
  name: 'Ground',
  description: '0V reference',
  pins: [{ id: 'gnd', name: 'GND', type: 'bidirectional' }],
  defaultParams: {},
  paramLabels: {},
  symbol: 'GND',
};

export const vcc: ComponentDefinition = {
  type: 'vcc',
  category: 'source',
  name: '+12V Rail',
  description: 'Positive supply rail',
  pins: [{ id: 'vcc', name: '+12V', type: 'output' }],
  defaultParams: { voltage: 12 },
  paramLabels: {
    voltage: { label: 'Voltage', unit: 'V', min: 5, max: 18 },
  },
  symbol: '+V',
};

export const vee: ComponentDefinition = {
  type: 'vee',
  category: 'source',
  name: '-12V Rail',
  description: 'Negative supply rail',
  pins: [{ id: 'vee', name: '-12V', type: 'output' }],
  defaultParams: { voltage: -12 },
  paramLabels: {
    voltage: { label: 'Voltage', unit: 'V', min: -18, max: -5 },
  },
  symbol: '-V',
};

export const audioInput: ComponentDefinition = {
  type: 'audio_input',
  category: 'source',
  name: 'Audio Input Jack',
  description: 'External audio input',
  pins: [
    { id: 'tip', name: 'Tip', type: 'output' },
    { id: 'sleeve', name: 'Sleeve', type: 'bidirectional' },
  ],
  defaultParams: {},
  paramLabels: {},
  symbol: 'IN',
};

export const cvInput: ComponentDefinition = {
  type: 'cv_input',
  category: 'source',
  name: 'CV Input Jack',
  description: 'Control voltage input',
  pins: [
    { id: 'tip', name: 'Tip', type: 'output' },
    { id: 'sleeve', name: 'Sleeve', type: 'bidirectional' },
  ],
  defaultParams: {
    defaultVoltage: 0, // When nothing connected
  },
  paramLabels: {
    defaultVoltage: { label: 'Default V', unit: 'V', min: -10, max: 10 },
  },
  symbol: 'CV',
};

// ============================================
// OUTPUTS / PROBES
// ============================================

export const audioOutput: ComponentDefinition = {
  type: 'audio_output',
  category: 'probe',
  name: 'Audio Output Jack',
  description: 'Audio output to speaker/DAC',
  pins: [
    { id: 'tip', name: 'Tip', type: 'input' },
    { id: 'sleeve', name: 'Sleeve', type: 'bidirectional' },
  ],
  defaultParams: {},
  paramLabels: {},
  symbol: 'OUT',
};

export const scopeProbe: ComponentDefinition = {
  type: 'scope_probe',
  category: 'probe',
  name: 'Scope Probe',
  description: 'Oscilloscope probe point',
  pins: [
    { id: 'probe', name: 'Probe', type: 'input' },
  ],
  defaultParams: {
    channel: 1,
  },
  paramLabels: {
    channel: { label: 'Channel', unit: '', min: 1, max: 4 },
  },
  symbol: 'SCOPE',
};

// ============================================
// Component Library Export
// ============================================

export const componentLibrary: Record<ComponentType, ComponentDefinition> = {
  // Passive
  resistor,
  capacitor,
  inductor,
  potentiometer,
  // Semiconductors
  diode,
  zener,
  led,
  npn: npnTransistor,
  pnp: pnpTransistor,
  jfet_n: jfetN,
  jfet_p: jfetN, // TODO: Add P-channel
  mosfet_n: npnTransistor, // TODO: Add MOSFET
  mosfet_p: pnpTransistor, // TODO: Add MOSFET
  // Op-amps
  opamp_tl072: opampTL072,
  opamp_tl074: opampTL072,
  opamp_ne5532: opampTL072,
  opamp_lm358: opampTL072,
  opamp_generic: opampGeneric,
  // OTAs
  ota_lm13700: otaLM13700,
  ota_ca3080: otaLM13700,
  // Comparators
  comparator_lm311: comparatorLM311,
  comparator_lm339: comparatorLM311,
  // ICs
  ic_555: ic555,
  ic_pt2399: icPT2399,
  ic_cd4017: ic555, // TODO
  ic_cd4051: ic555, // TODO
  ic_cem3340: icCEM3340,
  ic_ssi2164: icSSI2164,
  // Sources
  voltage_source: voltageSource,
  current_source: voltageSource, // TODO
  cv_input: cvInput,
  audio_input: audioInput,
  ground,
  vcc,
  vee,
  // Probes
  audio_output: audioOutput,
  cv_output: audioOutput,
  scope_probe: scopeProbe,
};

// Component categories for browser
export const componentCategories = [
  {
    id: 'passive',
    name: 'Passive Components',
    types: ['resistor', 'capacitor', 'inductor', 'potentiometer'] as ComponentType[],
  },
  {
    id: 'semiconductor',
    name: 'Semiconductors',
    types: ['diode', 'zener', 'led', 'npn', 'pnp', 'jfet_n'] as ComponentType[],
  },
  {
    id: 'opamp',
    name: 'Op-Amps',
    types: ['opamp_tl072', 'opamp_ne5532', 'opamp_generic'] as ComponentType[],
  },
  {
    id: 'ota',
    name: 'OTAs',
    types: ['ota_lm13700'] as ComponentType[],
  },
  {
    id: 'comparator',
    name: 'Comparators',
    types: ['comparator_lm311'] as ComponentType[],
  },
  {
    id: 'ic',
    name: 'ICs',
    types: ['ic_555', 'ic_pt2399', 'ic_cem3340', 'ic_ssi2164'] as ComponentType[],
  },
  {
    id: 'source',
    name: 'Sources & Power',
    types: ['voltage_source', 'cv_input', 'audio_input', 'vcc', 'vee', 'ground'] as ComponentType[],
  },
  {
    id: 'probe',
    name: 'Outputs & Probes',
    types: ['audio_output', 'scope_probe'] as ComponentType[],
  },
];
