// ============================================
// Circuit Simulation Types
// ============================================

// Component categories
export type ComponentCategory =
  | 'passive'
  | 'semiconductor'
  | 'opamp'
  | 'ota'
  | 'comparator'
  | 'ic'
  | 'source'
  | 'probe';

// All component types
export type ComponentType =
  // Passive
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'potentiometer'
  // Semiconductors
  | 'diode'
  | 'zener'
  | 'led'
  | 'npn'
  | 'pnp'
  | 'jfet_n'
  | 'jfet_p'
  | 'mosfet_n'
  | 'mosfet_p'
  // Op-amps
  | 'opamp_tl072'
  | 'opamp_tl074'
  | 'opamp_ne5532'
  | 'opamp_lm358'
  | 'opamp_generic'
  // OTAs
  | 'ota_lm13700'
  | 'ota_ca3080'
  // Comparators
  | 'comparator_lm311'
  | 'comparator_lm339'
  // ICs
  | 'ic_555'
  | 'ic_pt2399'
  | 'ic_cd4017'
  | 'ic_cd4051'
  | 'ic_cem3340'
  | 'ic_ssi2164'
  // Sources
  | 'voltage_source'
  | 'current_source'
  | 'cv_input'
  | 'audio_input'
  | 'ground'
  | 'vcc'
  | 'vee'
  // Probes/outputs
  | 'audio_output'
  | 'cv_output'
  | 'scope_probe';

// Pin types
export interface Pin {
  id: string;
  name: string;
  type: 'input' | 'output' | 'bidirectional' | 'power';
  voltage: number;
  current: number;
}

// Component definition (template)
export interface ComponentDefinition {
  type: ComponentType;
  category: ComponentCategory;
  name: string;
  description: string;
  pins: Omit<Pin, 'voltage' | 'current'>[];
  defaultParams: Record<string, number>;
  paramLabels: Record<string, { label: string; unit: string; min: number; max: number }>;
  symbol?: string; // SVG path or unicode symbol
}

// Component instance in a circuit
export interface ComponentInstance {
  id: string;
  type: ComponentType;
  params: Record<string, number>;
  position: { x: number; y: number };
  rotation: number; // 0, 90, 180, 270
  // Runtime state
  state: Record<string, number>;
  pins: Pin[];
}

// Wire connecting two pins
export interface Wire {
  id: string;
  from: { componentId: string; pinId: string };
  to: { componentId: string; pinId: string };
}

// A node in the circuit (junction of wires)
export interface CircuitNode {
  id: string;
  voltage: number;
  connectedPins: { componentId: string; pinId: string }[];
}

// Complete circuit
export interface Circuit {
  id: string;
  name: string;
  components: ComponentInstance[];
  wires: Wire[];
  nodes: CircuitNode[];
}

// Simulation state
export interface SimulationState {
  time: number;
  sampleRate: number;
  nodes: Map<string, number>; // nodeId -> voltage
  componentStates: Map<string, Record<string, number>>; // componentId -> state
}

// Probe data for visualization
export interface ProbeData {
  componentId: string;
  pinId: string;
  samples: Float32Array;
  min: number;
  max: number;
}
