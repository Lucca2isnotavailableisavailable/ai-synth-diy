// ============================================
// Web Audio Engine for SynthForge
// ============================================

import { ModuleInstance, Cable } from './types';
import { getModuleDefinition } from './modules';

// ============================================
// DSP Utilities
// ============================================

// PolyBLEP anti-aliasing function
function polyBlep(t: number, dt: number): number {
  if (t < dt) {
    const t_dt = t / dt;
    return t_dt + t_dt - t_dt * t_dt - 1;
  } else if (t > 1 - dt) {
    const t_dt = (t - 1) / dt;
    return t_dt * t_dt + t_dt + t_dt + 1;
  }
  return 0;
}

// ============================================
// Audio Processor Nodes
// ============================================

class VCOProcessor {
  phase = 0;
  frequency = 440;
  pulseWidth = 0.5;
  fmAmount = 0;
  
  process(
    output: { saw: Float32Array; square: Float32Array; triangle: Float32Array; sine: Float32Array },
    cvPitch: Float32Array | null,
    cvFM: Float32Array | null,
    cvPW: Float32Array | null,
    sampleRate: number,
    bufferSize: number,
    controls: Record<string, number>
  ) {
    const baseFreq = controls.frequency || 440;
    const fine = controls.fine || 0;
    const pw = controls.pw || 0.5;
    const fmAmt = controls['fm-amt'] || 0;
    
    for (let i = 0; i < bufferSize; i++) {
      // Calculate frequency with CV and fine tune
      let freq = baseFreq * Math.pow(2, fine / 1200); // fine tune in cents
      
      if (cvPitch && cvPitch[i] !== undefined) {
        freq *= Math.pow(2, cvPitch[i]); // 1V/Oct
      }
      
      if (cvFM && cvFM[i] !== undefined) {
        freq *= (1 + cvFM[i] * fmAmt);
      }
      
      const dt = freq / sampleRate;
      
      // Pulse width
      let currentPW = pw;
      if (cvPW && cvPW[i] !== undefined) {
        currentPW = Math.max(0.05, Math.min(0.95, pw + cvPW[i] * 0.5));
      }
      
      // Generate waveforms with anti-aliasing
      // Saw wave (with PolyBLEP)
      let saw = 2 * this.phase - 1;
      saw -= polyBlep(this.phase, dt);
      output.saw[i] = saw;
      
      // Square/Pulse wave (with PolyBLEP)
      let square = this.phase < currentPW ? 1 : -1;
      square += polyBlep(this.phase, dt);
      square -= polyBlep((this.phase + 1 - currentPW) % 1, dt);
      output.square[i] = square;
      
      // Triangle (integrated square, naive)
      output.triangle[i] = this.phase < 0.5
        ? 4 * this.phase - 1
        : 3 - 4 * this.phase;
      
      // Sine
      output.sine[i] = Math.sin(2 * Math.PI * this.phase);
      
      // Increment phase
      this.phase += dt;
      if (this.phase >= 1) this.phase -= 1;
    }
  }
}

class LFOProcessor {
  phase = 0;
  
  process(
    output: { saw: Float32Array; square: Float32Array; triangle: Float32Array; sine: Float32Array },
    cvRate: Float32Array | null,
    sampleRate: number,
    bufferSize: number,
    controls: Record<string, number>
  ) {
    const rate = controls.rate || 1;
    
    for (let i = 0; i < bufferSize; i++) {
      let freq = rate;
      if (cvRate && cvRate[i] !== undefined) {
        freq *= Math.pow(2, cvRate[i]);
      }
      
      const dt = freq / sampleRate;
      
      // LFO outputs are bipolar (-1 to 1) converted to unipolar CV (0 to 1) for some
      output.saw[i] = 2 * this.phase - 1;
      output.square[i] = this.phase < 0.5 ? 1 : -1;
      output.triangle[i] = this.phase < 0.5
        ? 4 * this.phase - 1
        : 3 - 4 * this.phase;
      output.sine[i] = Math.sin(2 * Math.PI * this.phase);
      
      this.phase += dt;
      if (this.phase >= 1) this.phase -= 1;
    }
  }
}

class VCFProcessor {
  lp = 0;
  bp = 0;
  hp = 0;
  
  process(
    input: Float32Array,
    output: { lowpass: Float32Array; highpass: Float32Array; bandpass: Float32Array },
    cvCutoff: Float32Array | null,
    sampleRate: number,
    bufferSize: number,
    controls: Record<string, number>
  ) {
    const cutoff = controls.cutoff || 1000;
    const resonance = controls.resonance || 0;
    const cvAmt = controls['cv-amt'] || 0.5;
    
    for (let i = 0; i < bufferSize; i++) {
      let freq = cutoff;
      
      if (cvCutoff && cvCutoff[i] !== undefined) {
        freq *= Math.pow(2, cvCutoff[i] * cvAmt * 5); // CV amount scales
      }
      
      // Clamp frequency
      freq = Math.max(20, Math.min(freq, sampleRate * 0.45));
      
      // Filter coefficient
      const f = 2 * Math.sin(Math.PI * freq / sampleRate);
      const q = 1 - resonance;
      
      // State variable filter
      this.hp = input[i] - this.lp - q * this.bp;
      this.bp += f * this.hp;
      this.lp += f * this.bp;
      
      // Soft clip for resonance
      this.bp = Math.tanh(this.bp);
      
      output.lowpass[i] = this.lp;
      output.highpass[i] = this.hp;
      output.bandpass[i] = this.bp;
    }
  }
}

class VCAProcessor {
  process(
    input: Float32Array,
    output: Float32Array,
    cv: Float32Array | null,
    bufferSize: number,
    controls: Record<string, number>
  ) {
    const gain = controls.gain || 1;
    const cvAmt = controls['cv-amt'] || 1;
    
    for (let i = 0; i < bufferSize; i++) {
      let g = gain;
      
      if (cv && cv[i] !== undefined) {
        // CV is typically 0-1, modulates gain
        g *= cv[i] * cvAmt;
      }
      
      output[i] = input[i] * Math.max(0, g);
    }
  }
}

class ADSRProcessor {
  state: 'idle' | 'attack' | 'decay' | 'sustain' | 'release' = 'idle';
  value = 0;
  gateHigh = false;
  
  process(
    output: { env: Float32Array; inv: Float32Array },
    gate: Float32Array | null,
    sampleRate: number,
    bufferSize: number,
    controls: Record<string, number>
  ) {
    const attack = controls.attack || 0.01;
    const decay = controls.decay || 0.1;
    const sustain = controls.sustain || 0.7;
    const release = controls.release || 0.3;
    
    const attackRate = 1 / (attack * sampleRate);
    const decayRate = 1 / (decay * sampleRate);
    const releaseRate = 1 / (release * sampleRate);
    
    for (let i = 0; i < bufferSize; i++) {
      const gateValue = gate ? gate[i] : 0;
      const isGateHigh = gateValue > 0.5;
      
      // Gate edge detection
      if (isGateHigh && !this.gateHigh) {
        this.state = 'attack';
      } else if (!isGateHigh && this.gateHigh) {
        this.state = 'release';
      }
      this.gateHigh = isGateHigh;
      
      // State machine
      switch (this.state) {
        case 'attack':
          this.value += attackRate;
          if (this.value >= 1) {
            this.value = 1;
            this.state = 'decay';
          }
          break;
        case 'decay':
          this.value -= decayRate * (this.value - sustain);
          if (this.value <= sustain + 0.001) {
            this.value = sustain;
            this.state = 'sustain';
          }
          break;
        case 'sustain':
          this.value = sustain;
          break;
        case 'release':
          this.value -= releaseRate * this.value;
          if (this.value <= 0.001) {
            this.value = 0;
            this.state = 'idle';
          }
          break;
        case 'idle':
          this.value = 0;
          break;
      }
      
      output.env[i] = this.value;
      output.inv[i] = 1 - this.value;
    }
  }
}

class NoiseProcessor {
  // Pink noise filter state
  b0 = 0; b1 = 0; b2 = 0; b3 = 0; b4 = 0; b5 = 0; b6 = 0;
  
  process(
    output: { white: Float32Array; pink: Float32Array },
    bufferSize: number,
    controls: Record<string, number>
  ) {
    const level = controls.level || 1;
    
    for (let i = 0; i < bufferSize; i++) {
      // White noise
      const white = Math.random() * 2 - 1;
      output.white[i] = white * level;
      
      // Pink noise (Paul Kellet's algorithm)
      this.b0 = 0.99886 * this.b0 + white * 0.0555179;
      this.b1 = 0.99332 * this.b1 + white * 0.0750759;
      this.b2 = 0.96900 * this.b2 + white * 0.1538520;
      this.b3 = 0.86650 * this.b3 + white * 0.3104856;
      this.b4 = 0.55000 * this.b4 + white * 0.5329522;
      this.b5 = -0.7616 * this.b5 - white * 0.0168980;
      const pink = (this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362) * 0.11;
      this.b6 = white * 0.115926;
      
      output.pink[i] = pink * level;
    }
  }
}

class DelayProcessor {
  buffer: Float32Array;
  writePos = 0;
  maxDelaySamples: number;
  
  constructor(sampleRate: number, maxDelaySeconds: number = 2) {
    this.maxDelaySamples = Math.floor(sampleRate * maxDelaySeconds);
    this.buffer = new Float32Array(this.maxDelaySamples);
  }
  
  process(
    input: Float32Array,
    output: { out: Float32Array; wet: Float32Array },
    cvTime: Float32Array | null,
    sampleRate: number,
    bufferSize: number,
    controls: Record<string, number>
  ) {
    const time = controls.time || 0.3;
    const feedback = controls.feedback || 0.3;
    const mix = controls.mix || 0.5;
    
    for (let i = 0; i < bufferSize; i++) {
      let delayTime = time;
      if (cvTime && cvTime[i] !== undefined) {
        delayTime *= (1 + cvTime[i] * 0.5);
      }
      delayTime = Math.max(0.01, Math.min(delayTime, 1.9));
      
      const delaySamples = Math.floor(delayTime * sampleRate);
      let readPos = this.writePos - delaySamples;
      if (readPos < 0) readPos += this.maxDelaySamples;
      
      const delayed = this.buffer[readPos];
      const wet = delayed;
      
      // Write to buffer with feedback
      this.buffer[this.writePos] = input[i] + delayed * feedback;
      
      this.writePos++;
      if (this.writePos >= this.maxDelaySamples) {
        this.writePos = 0;
      }
      
      // Output
      output.wet[i] = wet;
      output.out[i] = input[i] * (1 - mix) + wet * mix;
    }
  }
}

class MixerProcessor {
  process(
    inputs: (Float32Array | null)[],
    output: Float32Array,
    bufferSize: number,
    controls: Record<string, number>
  ) {
    const levels = [
      controls['level-1'] || 0.7,
      controls['level-2'] || 0.7,
      controls['level-3'] || 0.7,
      controls['level-4'] || 0.7,
    ];
    
    for (let i = 0; i < bufferSize; i++) {
      let sum = 0;
      for (let ch = 0; ch < 4; ch++) {
        if (inputs[ch]) {
          sum += inputs[ch]![i] * levels[ch];
        }
      }
      output[i] = sum;
    }
  }
}

class ClockProcessor {
  phase = 0;
  div2State = false;
  div4State = false;
  div2Counter = 0;
  div4Counter = 0;
  
  process(
    output: { clock: Float32Array; div2: Float32Array; div4: Float32Array },
    sampleRate: number,
    bufferSize: number,
    controls: Record<string, number>
  ) {
    const bpm = controls.bpm || 120;
    const freq = bpm / 60; // Hz
    
    for (let i = 0; i < bufferSize; i++) {
      const dt = freq / sampleRate;
      this.phase += dt;
      
      // Clock output (high for first 50% of cycle)
      output.clock[i] = this.phase % 1 < 0.5 ? 1 : 0;
      
      // Rising edge detection for dividers
      if (this.phase >= 1) {
        this.phase -= 1;
        
        this.div2Counter++;
        if (this.div2Counter >= 2) {
          this.div2Counter = 0;
          this.div2State = !this.div2State;
        }
        
        this.div4Counter++;
        if (this.div4Counter >= 4) {
          this.div4Counter = 0;
          this.div4State = !this.div4State;
        }
      }
      
      output.div2[i] = this.div2State ? 1 : 0;
      output.div4[i] = this.div4State ? 1 : 0;
    }
  }
}

// ============================================
// Audio Engine
// ============================================

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private isRunning = false;
  private sampleRate = 48000;
  private bufferSize = 2048;
  
  // Module processors
  private processors: Map<string, unknown> = new Map();
  
  // Module buffers
  private moduleOutputs: Map<string, Map<string, Float32Array>> = new Map();
  
  // Connections
  private modules: ModuleInstance[] = [];
  private cables: Cable[] = [];
  
  // Scope data callback
  private scopeCallback: ((data: Float32Array) => void) | null = null;
  
  // Output buffer for scope
  private scopeBuffer: Float32Array = new Float32Array(2048);
  private scopeWritePos = 0;
  
  async initialize(): Promise<void> {
    this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    this.sampleRate = this.audioContext.sampleRate;
    
    // Create script processor (deprecated but works everywhere)
    // In production, would use AudioWorklet
    this.scriptNode = this.audioContext.createScriptProcessor(this.bufferSize, 1, 2);
    
    this.scriptNode.onaudioprocess = (e) => this.processAudio(e);
    
    console.log('Audio engine initialized:', this.sampleRate, 'Hz');
  }
  
  start(): void {
    if (!this.audioContext || !this.scriptNode) return;
    
    this.scriptNode.connect(this.audioContext.destination);
    this.isRunning = true;
    console.log('Audio engine started');
  }
  
  stop(): void {
    if (!this.scriptNode) return;
    
    this.scriptNode.disconnect();
    this.isRunning = false;
    console.log('Audio engine stopped');
  }
  
  updatePatch(modules: ModuleInstance[], cables: Cable[]): void {
    this.modules = modules;
    this.cables = cables;
    
    // Create processors for new modules
    for (const module of modules) {
      if (!this.processors.has(module.id)) {
        this.createProcessor(module);
      }
    }
    
    // Remove processors for deleted modules
    for (const [id] of this.processors) {
      if (!modules.find(m => m.id === id)) {
        this.processors.delete(id);
        this.moduleOutputs.delete(id);
      }
    }
  }
  
  private createProcessor(module: ModuleInstance): void {
    const def = getModuleDefinition(module.definitionId);
    if (!def) return;
    
    let processor: unknown;
    
    switch (def.type) {
      case 'vco':
        processor = new VCOProcessor();
        break;
      case 'lfo':
        processor = new LFOProcessor();
        break;
      case 'vcf_multimode':
      case 'vcf_lowpass':
      case 'vcf_highpass':
        processor = new VCFProcessor();
        break;
      case 'vca':
        processor = new VCAProcessor();
        break;
      case 'envelope_adsr':
        processor = new ADSRProcessor();
        break;
      case 'noise':
        processor = new NoiseProcessor();
        break;
      case 'delay':
        processor = new DelayProcessor(this.sampleRate);
        break;
      case 'mixer':
        processor = new MixerProcessor();
        break;
      case 'clock':
        processor = new ClockProcessor();
        break;
      default:
        return;
    }
    
    this.processors.set(module.id, processor);
    
    // Create output buffers
    const outputs = new Map<string, Float32Array>();
    for (const output of def.outputs) {
      outputs.set(output.id, new Float32Array(this.bufferSize));
    }
    this.moduleOutputs.set(module.id, outputs);
  }
  
  private getInputBuffer(moduleId: string, portId: string): Float32Array | null {
    // Find cable connected to this input
    const cable = this.cables.find(
      c => c.to.moduleId === moduleId && c.to.portId === portId
    );
    
    if (!cable) return null;
    
    // Get output buffer from source module
    const sourceOutputs = this.moduleOutputs.get(cable.from.moduleId);
    if (!sourceOutputs) return null;
    
    return sourceOutputs.get(cable.from.portId) || null;
  }
  
  private processAudio(e: AudioProcessingEvent): void {
    const outputL = e.outputBuffer.getChannelData(0);
    const outputR = e.outputBuffer.getChannelData(1);
    const bufferSize = outputL.length;
    
    // Clear outputs
    outputL.fill(0);
    outputR.fill(0);
    
    // Process modules in order (simple for now, should do topological sort)
    for (const module of this.modules) {
      const def = getModuleDefinition(module.definitionId);
      if (!def) continue;
      
      const processor = this.processors.get(module.id);
      if (!processor) continue;
      
      const outputs = this.moduleOutputs.get(module.id);
      if (!outputs) continue;
      
      // Get control values (with defaults from definition)
      const controls: Record<string, number> = {};
      for (const control of def.controls) {
        controls[control.id] = module.controlValues[control.id] ?? control.default;
      }
      
      // Process based on module type
      switch (def.type) {
        case 'vco': {
          const vco = processor as VCOProcessor;
          const cvPitch = this.getInputBuffer(module.id, 'cv-pitch');
          const cvFM = this.getInputBuffer(module.id, 'cv-fm');
          const cvPW = this.getInputBuffer(module.id, 'cv-pw');
          
          vco.process(
            {
              saw: outputs.get('saw')!,
              square: outputs.get('square')!,
              triangle: outputs.get('triangle')!,
              sine: outputs.get('sine')!,
            },
            cvPitch,
            cvFM,
            cvPW,
            this.sampleRate,
            bufferSize,
            controls
          );
          break;
        }
        
        case 'lfo': {
          const lfo = processor as LFOProcessor;
          const cvRate = this.getInputBuffer(module.id, 'cv-rate');
          
          lfo.process(
            {
              saw: outputs.get('saw')!,
              square: outputs.get('square')!,
              triangle: outputs.get('triangle')!,
              sine: outputs.get('sine')!,
            },
            cvRate,
            this.sampleRate,
            bufferSize,
            controls
          );
          break;
        }
        
        case 'vcf_multimode':
        case 'vcf_lowpass':
        case 'vcf_highpass': {
          const vcf = processor as VCFProcessor;
          const input = this.getInputBuffer(module.id, 'audio-in');
          const cvCutoff = this.getInputBuffer(module.id, 'cv-cutoff');
          
          if (input) {
            vcf.process(
              input,
              {
                lowpass: outputs.get('lowpass')!,
                highpass: outputs.get('highpass')!,
                bandpass: outputs.get('bandpass')!,
              },
              cvCutoff,
              this.sampleRate,
              bufferSize,
              controls
            );
          }
          break;
        }
        
        case 'vca': {
          const vca = processor as VCAProcessor;
          const input = this.getInputBuffer(module.id, 'audio-in');
          const cv = this.getInputBuffer(module.id, 'cv');
          
          if (input) {
            vca.process(
              input,
              outputs.get('audio-out')!,
              cv,
              bufferSize,
              controls
            );
          }
          break;
        }
        
        case 'envelope_adsr': {
          const adsr = processor as ADSRProcessor;
          const gate = this.getInputBuffer(module.id, 'gate');
          
          adsr.process(
            {
              env: outputs.get('env-out')!,
              inv: outputs.get('inv-out')!,
            },
            gate,
            this.sampleRate,
            bufferSize,
            controls
          );
          break;
        }
        
        case 'noise': {
          const noise = processor as NoiseProcessor;
          
          noise.process(
            {
              white: outputs.get('white')!,
              pink: outputs.get('pink')!,
            },
            bufferSize,
            controls
          );
          break;
        }
        
        case 'delay': {
          const delay = processor as DelayProcessor;
          const input = this.getInputBuffer(module.id, 'audio-in');
          const cvTime = this.getInputBuffer(module.id, 'cv-time');
          
          if (input) {
            delay.process(
              input,
              {
                out: outputs.get('audio-out')!,
                wet: outputs.get('wet-out')!,
              },
              cvTime,
              this.sampleRate,
              bufferSize,
              controls
            );
          }
          break;
        }
        
        case 'mixer': {
          const mixer = processor as MixerProcessor;
          const inputs = [
            this.getInputBuffer(module.id, 'in-1'),
            this.getInputBuffer(module.id, 'in-2'),
            this.getInputBuffer(module.id, 'in-3'),
            this.getInputBuffer(module.id, 'in-4'),
          ];
          
          mixer.process(
            inputs,
            outputs.get('mix-out')!,
            bufferSize,
            controls
          );
          break;
        }
        
        case 'clock': {
          const clock = processor as ClockProcessor;
          
          clock.process(
            {
              clock: outputs.get('clock-out')!,
              div2: outputs.get('div-2')!,
              div4: outputs.get('div-4')!,
            },
            this.sampleRate,
            bufferSize,
            controls
          );
          break;
        }
        
        case 'output': {
          // Get audio from left/right inputs
          const left = this.getInputBuffer(module.id, 'left');
          const right = this.getInputBuffer(module.id, 'right');
          const volume = controls.volume || 0.7;
          
          for (let i = 0; i < bufferSize; i++) {
            if (left) outputL[i] += left[i] * volume;
            if (right) outputR[i] += right[i] * volume;
            // Mono if only left connected
            if (left && !right) outputR[i] = outputL[i];
          }
          break;
        }
        
        case 'scope': {
          // Capture scope data
          const ch1 = this.getInputBuffer(module.id, 'ch1');
          if (ch1) {
            for (let i = 0; i < bufferSize; i++) {
              this.scopeBuffer[this.scopeWritePos] = ch1[i];
              this.scopeWritePos = (this.scopeWritePos + 1) % this.scopeBuffer.length;
            }
            
            if (this.scopeCallback) {
              // Copy buffer starting from write position for continuous display
              const orderedBuffer = new Float32Array(this.scopeBuffer.length);
              for (let i = 0; i < this.scopeBuffer.length; i++) {
                orderedBuffer[i] = this.scopeBuffer[(this.scopeWritePos + i) % this.scopeBuffer.length];
              }
              this.scopeCallback(orderedBuffer);
            }
          }
          break;
        }
      }
    }
    
    // Soft clip output
    for (let i = 0; i < bufferSize; i++) {
      outputL[i] = Math.tanh(outputL[i]);
      outputR[i] = Math.tanh(outputR[i]);
    }
  }
  
  setScopeCallback(callback: (data: Float32Array) => void): void {
    this.scopeCallback = callback;
  }
  
  getSampleRate(): number {
    return this.sampleRate;
  }
  
  isActive(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
