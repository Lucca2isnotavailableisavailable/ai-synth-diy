import { create } from 'zustand';

interface AudioState {
  // Engine state
  isRunning: boolean;
  isInitialized: boolean;
  cpuLoad: number;
  sampleRate: number;
  
  // Scope data
  scopeData: Float32Array;
  scopeChannel2: Float32Array | null;
  spectrumData: Float32Array;
  
  // Meters
  outputLevel: number;
  outputPeak: number;
  
  // Audio context (for web audio fallback)
  audioContext: AudioContext | null;
  
  // Actions
  initialize: () => Promise<void>;
  start: () => void;
  stop: () => void;
  setScopeData: (data: Float32Array) => void;
  setSpectrumData: (data: Float32Array) => void;
  setOutputLevel: (level: number, peak: number) => void;
  setCpuLoad: (load: number) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial state
  isRunning: false,
  isInitialized: false,
  cpuLoad: 0,
  sampleRate: 48000,
  
  scopeData: new Float32Array(2048),
  scopeChannel2: null,
  spectrumData: new Float32Array(1024),
  
  outputLevel: 0,
  outputPeak: 0,
  
  audioContext: null,
  
  // Actions
  initialize: async () => {
    // For web version, we use Web Audio API
    // For Tauri, we'll use Rust audio engine via IPC
    try {
      const audioContext = new AudioContext({ sampleRate: 48000 });
      
      // Resume if suspended (autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      set({
        audioContext,
        sampleRate: audioContext.sampleRate,
        isInitialized: true,
      });
      
      console.log('Audio initialized:', audioContext.sampleRate, 'Hz');
    } catch (e) {
      console.error('Failed to initialize audio:', e);
    }
  },
  
  start: () => {
    const { audioContext, isInitialized } = get();
    if (!isInitialized || !audioContext) return;
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    set({ isRunning: true });
  },
  
  stop: () => {
    set({ isRunning: false });
  },
  
  setScopeData: (data) => {
    set({ scopeData: data });
  },
  
  setSpectrumData: (data) => {
    set({ spectrumData: data });
  },
  
  setOutputLevel: (level, peak) => {
    set({ outputLevel: level, outputPeak: peak });
  },
  
  setCpuLoad: (load) => {
    set({ cpuLoad: load });
  },
}));
