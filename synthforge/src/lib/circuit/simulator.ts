// ============================================
// Circuit Simulator Engine
// ============================================
// Real-time circuit simulation using behavioral models

import { 
  ComponentInstance, 
  Circuit, 
} from './types';
import { componentLibrary } from './components';

// ============================================
// Component Behavioral Models
// ============================================


// Get voltage at a pin
function getPinVoltage(
  component: ComponentInstance,
  pinId: string,
  nodeVoltages: Map<string, number>,
  pinToNode: Map<string, string>
): number {
  const key = `${component.id}:${pinId}`;
  const nodeId = pinToNode.get(key);
  if (nodeId) {
    return nodeVoltages.get(nodeId) || 0;
  }
  return 0;
}

// Set voltage at a pin (for sources)
function setPinVoltage(
  component: ComponentInstance,
  pinId: string,
  voltage: number,
  nodeVoltages: Map<string, number>,
  pinToNode: Map<string, string>
): void {
  const key = `${component.id}:${pinId}`;
  const nodeId = pinToNode.get(key);
  if (nodeId) {
    nodeVoltages.set(nodeId, voltage);
  }
}


// ============================================
// Capacitor Model (State-based)
// ============================================
function processCapacitor(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  state: Record<string, number>,
  dt: number,
  pinToNode: Map<string, string>
): void {
  const C = comp.params.capacitance || 1e-7;
  
  const vA = getPinVoltage(comp, 'a', nodes, pinToNode);
  const vB = getPinVoltage(comp, 'b', nodes, pinToNode);
  const vCap = vA - vB;
  
  // Initialize state
  if (state.voltage === undefined) {
    state.voltage = 0;
  }
  
  // Capacitor voltage changes based on current (simplified)
  // In a proper simulator, we'd solve this with the rest of the circuit
  // For now, we model it as a low-pass filter effect
  const tau = C * 1000; // RC time constant (assuming 1k load)
  const alpha = dt / (tau + dt);
  
  state.voltage = state.voltage + alpha * (vCap - state.voltage);
}

// ============================================
// Diode Model (Shockley equation)
// ============================================
function processDiode(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  state: Record<string, number>,
  pinToNode: Map<string, string>
): void {
  const Vf = comp.params.vForward || 0.6;
  
  const vAnode = getPinVoltage(comp, 'anode', nodes, pinToNode);
  const vCathode = getPinVoltage(comp, 'cathode', nodes, pinToNode);
  const vDiode = vAnode - vCathode;
  
  // Simplified diode model with soft knee
  // Instead of exponential (which can explode), use tanh approximation
  const vNorm = (vDiode - Vf * 0.5) / (Vf * 0.3);
  const conduction = 0.5 * (1 + Math.tanh(vNorm));
  
  // Diode conducts when forward biased
  state.conducting = conduction;
  state.current = conduction * (vDiode / 100); // Simplified
}

// ============================================
// NPN Transistor Model (Ebers-Moll simplified)
// ============================================
function processNPN(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  state: Record<string, number>,
  pinToNode: Map<string, string>
): void {
  const beta = comp.params.beta || 150;
  const Vbe_on = comp.params.vbe || 0.65;
  
  const vBase = getPinVoltage(comp, 'base', nodes, pinToNode);
  const vCollector = getPinVoltage(comp, 'collector', nodes, pinToNode);
  const vEmitter = getPinVoltage(comp, 'emitter', nodes, pinToNode);
  
  const Vbe = vBase - vEmitter;
  const Vce = vCollector - vEmitter;
  
  // Check operating region
  let Ic = 0;
  let Ib = 0;
  
  if (Vbe < Vbe_on * 0.5) {
    // Cutoff
    state.region = 0;
    Ic = 0;
    Ib = 0;
  } else if (Vce > Vbe) {
    // Active region
    state.region = 1;
    // Exponential Ib-Vbe relationship (simplified with tanh)
    const vNorm = (Vbe - Vbe_on) / 0.1;
    Ib = Math.max(0, Math.tanh(vNorm) * 0.001); // Max ~1mA base current
    Ic = beta * Ib;
  } else {
    // Saturation
    state.region = 2;
    Ic = Vce / 0.2 * 0.01; // Limited by Vce(sat)
    Ib = Ic / beta;
  }
  
  state.Ic = Ic;
  state.Ib = Ib;
  state.Ie = Ic + Ib;
}

// ============================================
// Op-Amp Model
// ============================================
function processOpAmp(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  state: Record<string, number>,
  dt: number,
  pinToNode: Map<string, string>
): void {
  const Aol = comp.params.openLoopGain || 100000;
  const slewRate = comp.params.slewRate || 13; // V/µs
  const outputSwing = comp.params.outputSwing || 1.5;
  
  const vPos = getPinVoltage(comp, 'in_pos', nodes, pinToNode);
  const vNeg = getPinVoltage(comp, 'in_neg', nodes, pinToNode);
  const vcc = getPinVoltage(comp, 'vcc', nodes, pinToNode) || 12;
  const vee = getPinVoltage(comp, 'vee', nodes, pinToNode) || -12;
  
  const vDiff = vPos - vNeg;
  
  // Ideal output
  let vOutIdeal = vDiff * Aol;
  
  // Clamp to rails
  const vMax = vcc - outputSwing;
  const vMin = vee + outputSwing;
  vOutIdeal = Math.max(vMin, Math.min(vMax, vOutIdeal));
  
  // Apply slew rate limiting
  if (state.vOut === undefined) state.vOut = 0;
  
  const maxDelta = slewRate * 1e6 * dt; // Convert V/µs to V/sample
  const delta = vOutIdeal - state.vOut;
  
  if (Math.abs(delta) > maxDelta) {
    state.vOut += Math.sign(delta) * maxDelta;
  } else {
    state.vOut = vOutIdeal;
  }
  
  // Set output node voltage
  setPinVoltage(comp, 'out', state.vOut, nodes, pinToNode);
}

// ============================================
// OTA (LM13700) Model
// ============================================
function processOTA(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  state: Record<string, number>,
  pinToNode: Map<string, string>
): void {
  const gmFactor = comp.params.gmFactor || 19.2;
  const inputLinRange = comp.params.inputLinRange || 0.025;
  const useLinDiodes = comp.params.useLinearizingDiodes || 1;
  
  const vPos = getPinVoltage(comp, 'in_pos', nodes, pinToNode);
  const vNeg = getPinVoltage(comp, 'in_neg', nodes, pinToNode);
  const Iabc = Math.abs(getPinVoltage(comp, 'iabc', nodes, pinToNode)) / 10000; // Convert voltage to current via 10k
  
  const vDiff = vPos - vNeg;
  
  // gm = 19.2 * Iabc (typical at room temp)
  const gm = gmFactor * Math.max(Iabc, 1e-9);
  
  // Apply input non-linearity
  let vDiffLimited: number;
  if (useLinDiodes > 0.5) {
    // With linearizing diodes - extended linear range
    vDiffLimited = Math.tanh(vDiff / (inputLinRange * 3)) * inputLinRange * 3;
  } else {
    // Without - tanh characteristic
    vDiffLimited = Math.tanh(vDiff / inputLinRange) * inputLinRange;
  }
  
  // Output current
  const Iout = gm * vDiffLimited;
  
  // Convert to voltage assuming load resistor (simplified)
  // In real circuit, this would depend on actual load
  state.Iout = Iout;
  state.vOut = Iout * 10000; // Assuming 10k load
  
  setPinVoltage(comp, 'out', state.vOut, nodes, pinToNode);
  
  // Buffer section
  const vBufIn = getPinVoltage(comp, 'buf_in', nodes, pinToNode);
  setPinVoltage(comp, 'buf_out', vBufIn, nodes, pinToNode); // Unity gain buffer
}

// ============================================
// Comparator Model
// ============================================
function processComparator(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  state: Record<string, number>,
  pinToNode: Map<string, string>
): void {
  const hysteresis = comp.params.hysteresis || 0.002;
  
  const vPos = getPinVoltage(comp, 'in_pos', nodes, pinToNode);
  const vNeg = getPinVoltage(comp, 'in_neg', nodes, pinToNode);
  const vcc = getPinVoltage(comp, 'vcc', nodes, pinToNode) || 12;
  
  const vDiff = vPos - vNeg;
  
  // Initialize state
  if (state.outputHigh === undefined) state.outputHigh = 0;
  
  // Hysteresis
  if (state.outputHigh > 0.5) {
    // Currently high - go low if vDiff < -hysteresis
    if (vDiff < -hysteresis) {
      state.outputHigh = 0;
    }
  } else {
    // Currently low - go high if vDiff > +hysteresis
    if (vDiff > hysteresis) {
      state.outputHigh = 1;
    }
  }
  
  // Open collector output (pulls to ground or floats)
  const vOut = state.outputHigh > 0.5 ? vcc : 0;
  setPinVoltage(comp, 'out', vOut, nodes, pinToNode);
}

// ============================================
// 555 Timer Model
// ============================================
function process555(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  state: Record<string, number>,
  pinToNode: Map<string, string>
): void {
  const vcc = getPinVoltage(comp, 'vcc', nodes, pinToNode) || 9;
  const vTrig = getPinVoltage(comp, 'trig', nodes, pinToNode);
  const vThresh = getPinVoltage(comp, 'thresh', nodes, pinToNode);
  const vReset = getPinVoltage(comp, 'reset', nodes, pinToNode);
  const vCtrl = getPinVoltage(comp, 'ctrl', nodes, pinToNode) || (vcc * 2/3);
  
  // Initialize flip-flop state
  if (state.ffState === undefined) state.ffState = 0;
  
  const thresholdUpper = vCtrl;
  const thresholdLower = vCtrl / 2;
  
  // Reset overrides everything
  if (vReset < 0.7) {
    state.ffState = 0;
  }
  // Trigger sets flip-flop
  else if (vTrig < thresholdLower) {
    state.ffState = 1;
  }
  // Threshold resets flip-flop
  else if (vThresh > thresholdUpper) {
    state.ffState = 0;
  }
  
  // Output
  const vOut = state.ffState > 0.5 ? vcc - 1.5 : 0.1;
  setPinVoltage(comp, 'out', vOut, nodes, pinToNode);
  
  // Discharge pin (open collector)
  const dischargeSink = state.ffState > 0.5 ? 0 : 1; // Low impedance when output low
  state.discharging = dischargeSink;
}

// ============================================
// PT2399 Delay Model
// ============================================
// Global delay buffers (can't store in state which only holds numbers)
const delayBuffers = new Map<string, Float32Array>();

function processPT2399(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  state: Record<string, number>,
  _dt: number,
  sampleRate: number,
  pinToNode: Map<string, string>
): void {
  const minDelay = comp.params.minDelay || 0.03;
  const maxDelay = comp.params.maxDelay || 0.34;
  
  // Get input
  const vIn = getPinVoltage(comp, 'in', nodes, pinToNode);
  
  // Delay time controlled by R_EXT pin (voltage divider typically)
  const vRext = getPinVoltage(comp, 'r_ext', nodes, pinToNode);
  const delayNorm = Math.max(0, Math.min(1, vRext / 5)); // 0-5V -> 0-1
  const delayTime = minDelay + delayNorm * (maxDelay - minDelay);
  
  // Initialize delay buffer
  const maxSamples = Math.ceil(maxDelay * sampleRate) + 1;
  const bufferKey = comp.id;
  
  if (!delayBuffers.has(bufferKey)) {
    delayBuffers.set(bufferKey, new Float32Array(maxSamples));
    state.writePos = 0;
  }
  
  const buffer = delayBuffers.get(bufferKey)!;
  buffer[state.writePos] = vIn;
  
  // Calculate read position
  const delaySamples = Math.floor(delayTime * sampleRate);
  let readPos = state.writePos - delaySamples;
  if (readPos < 0) readPos += maxSamples;
  
  // Read with linear interpolation
  const readPosFloor = Math.floor(readPos);
  const frac = readPos - readPosFloor;
  const sample1 = buffer[readPosFloor % maxSamples];
  const sample2 = buffer[(readPosFloor + 1) % maxSamples];
  const delayed = sample1 + frac * (sample2 - sample1);
  
  // Add some PT2399 character (subtle filtering)
  if (state.lpState === undefined) state.lpState = 0;
  state.lpState = state.lpState * 0.8 + delayed * 0.2;
  
  // Advance write position
  state.writePos = (state.writePos + 1) % maxSamples;
  
  // Output
  setPinVoltage(comp, 'out', state.lpState, nodes, pinToNode);
  
  // VRef is VCC/2
  const vcc = getPinVoltage(comp, 'vcc', nodes, pinToNode) || 5;
  setPinVoltage(comp, 'vref', vcc / 2, nodes, pinToNode);
}

// ============================================
// CEM3340 VCO Model
// ============================================
function processCEM3340(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  state: Record<string, number>,
  dt: number,
  pinToNode: Map<string, string>
): void {
  const baseFreq = comp.params.baseFreq || 1;
  
  // CV inputs
  const cvExp = getPinVoltage(comp, 'cv_exp', nodes, pinToNode);
  const cvLin = getPinVoltage(comp, 'cv_linear', nodes, pinToNode);
  const pwCV = getPinVoltage(comp, 'pw_cv', nodes, pinToNode);
  const freqAdj = getPinVoltage(comp, 'freq_adj', nodes, pinToNode);
  
  // Calculate frequency (1V/octave exponential)
  const freq = baseFreq * Math.pow(2, cvExp + freqAdj / 1.2) * (1 + cvLin * 0.1);
  
  // Initialize phase
  if (state.phase === undefined) state.phase = 0;
  
  // Pulse width (0.05 to 0.95)
  const pw = Math.max(0.05, Math.min(0.95, 0.5 + pwCV * 0.4));
  
  // Advance phase
  const phaseInc = freq * dt;
  state.phase = (state.phase + phaseInc) % 1;
  
  // Generate waveforms
  // Saw (core waveform)
  const saw = 2 * state.phase - 1;
  
  // Triangle (from saw)
  const tri = state.phase < 0.5 
    ? 4 * state.phase - 1 
    : 3 - 4 * state.phase;
  
  // Pulse
  const pulse = state.phase < pw ? 1 : -1;
  
  // Scale to typical output levels (±5V)
  const scale = 5;
  setPinVoltage(comp, 'saw_out', saw * scale, nodes, pinToNode);
  setPinVoltage(comp, 'tri_out', tri * scale, nodes, pinToNode);
  setPinVoltage(comp, 'pulse_out', pulse * scale, nodes, pinToNode);
}

// ============================================
// SSI2164 Quad VCA Model
// ============================================
function processSSI2164(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  _state: Record<string, number>,
  pinToNode: Map<string, string>
): void {
  const dbPerVolt = comp.params.dbPerVolt || 33;
  
  // Process all 4 VCA channels
  for (let ch = 1; ch <= 4; ch++) {
    const vIn = getPinVoltage(comp, `in${ch}`, nodes, pinToNode);
    const vCV = getPinVoltage(comp, `cv${ch}`, nodes, pinToNode);
    
    // Exponential VCA: gain = 10^(cv * dB/V / 20)
    // For SSI2164, CV is typically 0V = unity, negative = attenuation
    const gainDb = vCV * dbPerVolt;
    const gain = Math.pow(10, gainDb / 20);
    
    // Clamp gain
    const clampedGain = Math.max(0, Math.min(10, gain));
    
    const vOut = vIn * clampedGain;
    setPinVoltage(comp, `out${ch}`, vOut, nodes, pinToNode);
  }
}

// ============================================
// Voltage Source Model
// ============================================
function processVoltageSource(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  _state: Record<string, number>,
  time: number,
  pinToNode: Map<string, string>
): void {
  const dcVoltage = comp.params.dcVoltage || 0;
  const acAmplitude = comp.params.acAmplitude || 0;
  const acFrequency = comp.params.acFrequency || 1000;
  const waveform = comp.params.waveform || 0;
  
  let acValue = 0;
  if (acAmplitude > 0) {
    const phase = (time * acFrequency) % 1;
    
    switch (Math.round(waveform)) {
      case 0: // Sine
        acValue = Math.sin(2 * Math.PI * phase) * acAmplitude;
        break;
      case 1: // Square
        acValue = (phase < 0.5 ? 1 : -1) * acAmplitude;
        break;
      case 2: // Saw
        acValue = (2 * phase - 1) * acAmplitude;
        break;
      case 3: // Triangle
        acValue = (phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase) * acAmplitude;
        break;
    }
  }
  
  const voltage = dcVoltage + acValue;
  setPinVoltage(comp, 'pos', voltage, nodes, pinToNode);
  setPinVoltage(comp, 'neg', 0, nodes, pinToNode);
}

// ============================================
// Power Rails
// ============================================
function processVCC(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  pinToNode: Map<string, string>
): void {
  const voltage = comp.params.voltage || 12;
  setPinVoltage(comp, 'vcc', voltage, nodes, pinToNode);
}

function processVEE(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  pinToNode: Map<string, string>
): void {
  const voltage = comp.params.voltage || -12;
  setPinVoltage(comp, 'vee', voltage, nodes, pinToNode);
}

function processGround(
  comp: ComponentInstance,
  nodes: Map<string, number>,
  pinToNode: Map<string, string>
): void {
  setPinVoltage(comp, 'gnd', 0, nodes, pinToNode);
}

// ============================================
// Main Circuit Simulator Class
// ============================================

export class CircuitSimulator {
  private circuit: Circuit | null = null;
  private nodeVoltages: Map<string, number> = new Map();
  private componentStates: Map<string, Record<string, number>> = new Map();
  private pinToNode: Map<string, string> = new Map(); // "componentId:pinId" -> nodeId
  private time: number = 0;
  private sampleRate: number = 48000;
  
  
  setCircuit(circuit: Circuit): void {
    this.circuit = circuit;
    this.buildNodeMap();
    this.initializeStates();
    this.time = 0;
  }
  
  setSampleRate(rate: number): void {
    this.sampleRate = rate;
  }
  
  private buildNodeMap(): void {
    if (!this.circuit) return;
    
    this.pinToNode.clear();
    this.nodeVoltages.clear();
    
    // Create a node for each connected group of pins
    // Using union-find for efficiency
    const parent: Map<string, string> = new Map();
    
    const find = (x: string): string => {
      if (!parent.has(x)) parent.set(x, x);
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x)!));
      }
      return parent.get(x)!;
    };
    
    const union = (x: string, y: string): void => {
      const px = find(x);
      const py = find(y);
      if (px !== py) {
        parent.set(px, py);
      }
    };
    
    // Union pins connected by wires
    for (const wire of this.circuit.wires) {
      const key1 = `${wire.from.componentId}:${wire.from.pinId}`;
      const key2 = `${wire.to.componentId}:${wire.to.pinId}`;
      union(key1, key2);
    }
    
    // Build pinToNode map
    const nodeIds: Map<string, string> = new Map();
    let nodeCounter = 0;
    
    for (const comp of this.circuit.components) {
      const def = componentLibrary[comp.type];
      if (!def) continue;
      
      for (const pinDef of def.pins) {
        const key = `${comp.id}:${pinDef.id}`;
        const root = find(key);
        
        if (!nodeIds.has(root)) {
          nodeIds.set(root, `node_${nodeCounter++}`);
        }
        
        this.pinToNode.set(key, nodeIds.get(root)!);
      }
    }
    
    // Initialize all node voltages to 0
    for (const nodeId of nodeIds.values()) {
      this.nodeVoltages.set(nodeId, 0);
    }
  }
  
  private initializeStates(): void {
    if (!this.circuit) return;
    
    this.componentStates.clear();
    
    for (const comp of this.circuit.components) {
      this.componentStates.set(comp.id, {});
    }
  }
  
  // Process one sample
  processSample(): number {
    if (!this.circuit) return 0;
    
    const dt = 1 / this.sampleRate;
    
    // Process components in order (sources first, then others)
    // This is a simplified approach - a real simulator would do iterative solving
    
    // 1. Process voltage sources and power rails (set node voltages)
    for (const comp of this.circuit.components) {
      const state = this.componentStates.get(comp.id) || {};
      
      switch (comp.type) {
        case 'voltage_source':
          processVoltageSource(comp, this.nodeVoltages, state, this.time, this.pinToNode);
          break;
        case 'vcc':
          processVCC(comp, this.nodeVoltages, this.pinToNode);
          break;
        case 'vee':
          processVEE(comp, this.nodeVoltages, this.pinToNode);
          break;
        case 'ground':
          processGround(comp, this.nodeVoltages, this.pinToNode);
          break;
      }
      
      this.componentStates.set(comp.id, state);
    }
    
    // 2. Process active components (op-amps, OTAs, transistors, ICs)
    for (const comp of this.circuit.components) {
      const state = this.componentStates.get(comp.id) || {};
      
      switch (comp.type) {
        case 'opamp_tl072':
        case 'opamp_tl074':
        case 'opamp_ne5532':
        case 'opamp_lm358':
        case 'opamp_generic':
          processOpAmp(comp, this.nodeVoltages, state, dt, this.pinToNode);
          break;
          
        case 'ota_lm13700':
        case 'ota_ca3080':
          processOTA(comp, this.nodeVoltages, state, this.pinToNode);
          break;
          
        case 'comparator_lm311':
        case 'comparator_lm339':
          processComparator(comp, this.nodeVoltages, state, this.pinToNode);
          break;
          
        case 'npn':
          processNPN(comp, this.nodeVoltages, state, this.pinToNode);
          break;
          
        case 'diode':
        case 'zener':
        case 'led':
          processDiode(comp, this.nodeVoltages, state, this.pinToNode);
          break;
          
        case 'ic_555':
          process555(comp, this.nodeVoltages, state, this.pinToNode);
          break;
          
        case 'ic_pt2399':
          processPT2399(comp, this.nodeVoltages, state, dt, this.sampleRate, this.pinToNode);
          break;
          
        case 'ic_cem3340':
          processCEM3340(comp, this.nodeVoltages, state, dt, this.pinToNode);
          break;
          
        case 'ic_ssi2164':
          processSSI2164(comp, this.nodeVoltages, state, this.pinToNode);
          break;
          
        case 'capacitor':
          processCapacitor(comp, this.nodeVoltages, state, dt, this.pinToNode);
          break;
      }
      
      this.componentStates.set(comp.id, state);
    }
    
    // 3. Get audio output
    let audioOut = 0;
    for (const comp of this.circuit.components) {
      if (comp.type === 'audio_output') {
        audioOut = getPinVoltage(comp, 'tip', this.nodeVoltages, this.pinToNode);
        break;
      }
    }
    
    // Advance time
    this.time += dt;
    
    // Scale output (-5V to +5V -> -1 to +1)
    return audioOut / 5;
  }
  
  // Process a buffer of samples
  processBuffer(outputL: Float32Array, outputR: Float32Array): void {
    for (let i = 0; i < outputL.length; i++) {
      const sample = this.processSample();
      outputL[i] = sample;
      outputR[i] = sample;
    }
  }
  
  // Get voltage at a specific node (for scope)
  getNodeVoltage(nodeId: string): number {
    return this.nodeVoltages.get(nodeId) || 0;
  }
  
  // Get voltage at a component pin
  getPinVoltage(componentId: string, pinId: string): number {
    const key = `${componentId}:${pinId}`;
    const nodeId = this.pinToNode.get(key);
    if (nodeId) {
      return this.nodeVoltages.get(nodeId) || 0;
    }
    return 0;
  }
  
  // Get all probe data for scope
  getProbeData(): Map<string, number> {
    const probes = new Map<string, number>();
    
    if (!this.circuit) return probes;
    
    for (const comp of this.circuit.components) {
      if (comp.type === 'scope_probe') {
        const voltage = getPinVoltage(comp, 'probe', this.nodeVoltages, this.pinToNode);
        probes.set(comp.id, voltage);
      }
    }
    
    return probes;
  }
  
  // Reset simulation
  reset(): void {
    this.time = 0;
    this.initializeStates();
    for (const nodeId of this.nodeVoltages.keys()) {
      this.nodeVoltages.set(nodeId, 0);
    }
  }
  
  getTime(): number {
    return this.time;
  }
}

// Singleton instance
export const circuitSimulator = new CircuitSimulator();
