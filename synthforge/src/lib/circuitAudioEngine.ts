// ============================================
// Circuit-based Audio Engine
// ============================================

import { circuitSimulator, CircuitSimulator } from './circuit/simulator';
import { Circuit } from './circuit/types';

export class CircuitAudioEngine {
  private audioContext: AudioContext | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private isRunning = false;
  private sampleRate = 48000;
  private bufferSize = 1024;
  
  // Scope data callback
  private scopeCallback: ((data: Float32Array) => void) | null = null;
  private scopeBuffer: Float32Array = new Float32Array(2048);
  private scopeWritePos = 0;
  
  // Reference to the simulator
  private simulator: CircuitSimulator = circuitSimulator;
  
  async initialize(): Promise<void> {
    this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    this.sampleRate = this.audioContext.sampleRate;
    this.simulator.setSampleRate(this.sampleRate);
    
    // Create script processor
    this.scriptNode = this.audioContext.createScriptProcessor(this.bufferSize, 1, 2);
    this.scriptNode.onaudioprocess = (e) => this.processAudio(e);
    
    console.log('Circuit audio engine initialized:', this.sampleRate, 'Hz');
  }
  
  setCircuit(circuit: Circuit): void {
    this.simulator.setCircuit(circuit);
  }
  
  start(): void {
    if (!this.audioContext || !this.scriptNode) return;
    
    this.scriptNode.connect(this.audioContext.destination);
    this.isRunning = true;
    console.log('Circuit audio engine started');
  }
  
  stop(): void {
    if (!this.scriptNode) return;
    
    this.scriptNode.disconnect();
    this.isRunning = false;
    this.simulator.reset();
    console.log('Circuit audio engine stopped');
  }
  
  private processAudio(e: AudioProcessingEvent): void {
    const outputL = e.outputBuffer.getChannelData(0);
    const outputR = e.outputBuffer.getChannelData(1);
    
    // Process circuit
    this.simulator.processBuffer(outputL, outputR);
    
    // Capture scope data
    for (let i = 0; i < outputL.length; i++) {
      this.scopeBuffer[this.scopeWritePos] = outputL[i] * 5; // Scale back to voltage
      this.scopeWritePos = (this.scopeWritePos + 1) % this.scopeBuffer.length;
    }
    
    // Send scope data
    if (this.scopeCallback) {
      const orderedBuffer = new Float32Array(this.scopeBuffer.length);
      for (let i = 0; i < this.scopeBuffer.length; i++) {
        orderedBuffer[i] = this.scopeBuffer[(this.scopeWritePos + i) % this.scopeBuffer.length];
      }
      this.scopeCallback(orderedBuffer);
    }
    
    // Soft clip output to prevent harsh clipping
    for (let i = 0; i < outputL.length; i++) {
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
  
  // Get voltage at a specific component pin (for UI display)
  getPinVoltage(componentId: string, pinId: string): number {
    return this.simulator.getPinVoltage(componentId, pinId);
  }
}

// Singleton instance
export const circuitAudioEngine = new CircuitAudioEngine();
