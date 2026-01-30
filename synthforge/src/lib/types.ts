// ============================================
// Core Types for SynthForge
// ============================================

// Signal Types
export type SignalType = 'audio' | 'cv' | 'gate' | 'trigger' | 'clock';

// Port Direction
export type PortDirection = 'input' | 'output';

// ============================================
// Component Types (Low-level circuit elements)
// ============================================

export type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'potentiometer'
  | 'diode'
  | 'led'
  | 'zener'
  | 'transistor_npn'
  | 'transistor_pnp'
  | 'jfet_n'
  | 'jfet_p'
  | 'mosfet_n'
  | 'mosfet_p'
  | 'opamp'
  | 'ota'
  | 'ic_vco'
  | 'ic_vca'
  | 'ic_filter'
  | 'ic_delay'
  | 'ic_timer'
  | 'ic_logic'
  | 'jack'
  | 'switch'
  | 'header';

export interface ComponentPin {
  id: string;
  name: string;
  type: 'power' | 'signal' | 'ground';
}

export interface Component {
  id: string;
  type: ComponentType;
  subtype?: string;
  name: string;
  value: number;
  unit: string;
  tolerance?: number;
  package?: string;
  manufacturer?: string;
  partNumber?: string;
  position: { x: number; y: number };
  pins: ComponentPin[];
  properties?: Record<string, number | string | boolean>;
}

// ============================================
// Module Types (Eurorack-level blocks)
// ============================================

export type ModuleType =
  | 'vco'
  | 'vco_complex'
  | 'lfo'
  | 'vcf_lowpass'
  | 'vcf_highpass'
  | 'vcf_bandpass'
  | 'vcf_multimode'
  | 'vca'
  | 'vca_dual'
  | 'envelope_adsr'
  | 'envelope_ad'
  | 'mixer'
  | 'attenuator'
  | 'multiple'
  | 'sequencer'
  | 'clock'
  | 'divider'
  | 'delay'
  | 'reverb'
  | 'distortion'
  | 'wavefolder'
  | 'noise'
  | 'sample_hold'
  | 'quantizer'
  | 'midi_cv'
  | 'output'
  | 'scope'
  | 'custom';

export interface ModulePort {
  id: string;
  name: string;
  type: SignalType;
  direction: PortDirection;
  normalled?: string;
}

export interface ModuleControl {
  id: string;
  name: string;
  type: 'knob' | 'slider' | 'switch' | 'button';
  min: number;
  max: number;
  default: number;
  value: number;
  curve: 'linear' | 'logarithmic' | 'exponential';
}

export interface ModuleDefinition {
  id: string;
  name: string;
  type: ModuleType;
  hp: number;
  inputs: ModulePort[];
  outputs: ModulePort[];
  controls: ModuleControl[];
  components: Component[];
  internalConnections: InternalConnection[];
  color?: string;
}

export interface InternalConnection {
  id: string;
  from: { componentId: string; pinId: string };
  to: { componentId: string; pinId: string };
}

// ============================================
// Module Instance (placed in rack)
// ============================================

export interface ModuleInstance {
  id: string;
  definitionId: string;
  position: { x: number; y: number };
  controlValues: Record<string, number>;
  componentOverrides?: Record<string, number>;
}

// ============================================
// Cable / Patch Connection
// ============================================

export interface Cable {
  id: string;
  from: {
    moduleId: string;
    portId: string;
  };
  to: {
    moduleId: string;
    portId: string;
  };
  color: string;
}

// ============================================
// Project / Patch
// ============================================

export interface Project {
  id: string;
  name: string;
  version: string;
  created: string;
  modified: string;
  author?: string;
  notes?: string;
  
  modules: ModuleInstance[];
  cables: Cable[];
  customModules: ModuleDefinition[];
  
  settings: ProjectSettings;
}

export interface ProjectSettings {
  sampleRate: number;
  bufferSize: number;
  masterVolume: number;
  bpm?: number;
}

// ============================================
// Audio Engine Types
// ============================================

export interface AudioEngineState {
  isRunning: boolean;
  sampleRate: number;
  bufferSize: number;
  cpuLoad: number;
}

export interface ScopeData {
  channel1: Float32Array;
  channel2?: Float32Array;
  sampleRate: number;
  triggerLevel: number;
}

export interface SpectrumData {
  frequencies: Float32Array;
  magnitudes: Float32Array;
}

// ============================================
// UI State Types
// ============================================

export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface SelectionState {
  selectedModules: string[];
  selectedCables: string[];
  selectedComponents: string[];
}

// ============================================
// Cable Colors
// ============================================

export const CABLE_COLORS = [
  '#ff6b6b', // Red
  '#ffa500', // Orange
  '#ffee00', // Yellow
  '#00ff88', // Green
  '#00ccff', // Cyan
  '#cc66ff', // Purple
  '#ff66cc', // Pink
  '#ffffff', // White
] as const;

export type CableColor = typeof CABLE_COLORS[number];
