# SynthForge - Modular Synthesizer Design & Prototyping Tool

## Overview

SynthForge is a desktop application for designing, simulating, and prototyping modular synthesizers. It provides a visual patching interface at the module level (like a real Eurorack system) with the ability to drill down into component-level circuitry for each module.

**Primary Goals:**
1. Design and simulate modular synth patches with accurate sound
2. View and edit component-level circuitry within each module
3. Export component lists (BOM) for building in real hardware
4. Real-time audio output for immediate feedback
5. Digital scope/analyzer for visualizing signals

---

## Tech Stack

### Frontend (UI)
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand (lightweight, performant)
- **Node Editor**: React Flow (for component-level view)
- **Styling**: Tailwind CSS (dark mode, minimal design)
- **Charts/Scope**: Custom Canvas-based (for performance)

### Backend (Desktop Shell + Audio Engine)
- **Desktop Framework**: Tauri 2.0 (Rust-based, lightweight, native performance)
- **Audio Engine**: Rust with CPAL (cross-platform audio I/O)
- **DSP**: Custom Rust DSP library with component behavioral models
- **File Format**: JSON for projects, TOML for component definitions

### Why This Stack?
- **Tauri over Electron**: 10x smaller bundle, better performance, Rust backend is perfect for real-time audio
- **Rust for Audio**: Zero-cost abstractions, no GC pauses, ideal for real-time DSP
- **React Flow**: Battle-tested node editor, perfect for both module patching and component wiring

---

## Architecture Layers

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           UI Layer (React + TypeScript)                   │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Rack View  │  │Module Detail│  │Scope/Meters │  │ Component       │  │
│  │  (Patching) │  │(Node Editor)│  │ (Canvas)    │  │ Browser/Library │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │Project Mgr  │  │ BOM Export  │  │  Settings   │  │  MIDI/Control   │  │
│  │ Save/Load   │  │             │  │             │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Tauri IPC (Commands + Events)
┌──────────────────────────────────────────────────────────────────────────┐
│                        Bridge Layer (Tauri Commands)                      │
│                                                                          │
│  • Audio Engine Control (start/stop, set sample rate)                    │
│  • Module Management (add/remove/connect modules)                        │
│  • Parameter Updates (component values, knob positions)                  │
│  • Scope Data Stream (waveform samples, FFT data)                        │
│  • File Operations (save/load projects, export BOM)                      │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        Audio Engine (Rust)                                │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      Module Graph Processor                         │  │
│  │  • Processes audio in blocks (256-512 samples)                     │  │
│  │  • Topological sort for correct processing order                   │  │
│  │  • Lock-free parameter updates from UI                             │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                    │                                      │
│           ┌────────────────────────┼────────────────────────┐            │
│           ▼                        ▼                        ▼            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │  Module DSP     │  │  Module DSP     │  │  Module DSP             │  │
│  │  (VCO, VCF...)  │  │  (VCA, Env...)  │  │  (Delay, Reverb...)     │  │
│  │                 │  │                 │  │                         │  │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────────────┐  │  │
│  │  │Component  │  │  │  │Component  │  │  │  │Component          │  │  │
│  │  │Simulation │  │  │  │Simulation │  │  │  │Simulation         │  │  │
│  │  │Models     │  │  │  │Models     │  │  │  │Models             │  │  │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────────────┘  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      Scope Data Capture                             │  │
│  │  • Ring buffer for waveform display                                 │  │
│  │  • FFT for spectrum analyzer                                        │  │
│  │  • RMS/Peak meters                                                  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    Component Library (Data Layer)                         │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Passive    │  │Semiconductors│  │   Op-Amps    │  │  IC Chips    │  │
│  │  Components  │  │              │  │              │  │              │  │
│  │              │  │              │  │              │  │              │  │
│  │ • Resistor   │  │ • Diode      │  │ • TL072      │  │ • CEM3340    │  │
│  │ • Capacitor  │  │ • LED        │  │ • TL074      │  │ • PT2399     │  │
│  │ • Inductor   │  │ • BJT        │  │ • LM358      │  │ • SSI2164    │  │
│  │ • Pot        │  │ • JFET       │  │ • LM13700    │  │ • 555        │  │
│  │              │  │ • MOSFET     │  │ • NE5532     │  │ • 4017       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐│
│  │                    Pre-built Module Templates                        ││
│  │  VCO, VCF, VCA, ADSR, LFO, Mixer, Sequencer, Delay, Reverb, etc.    ││
│  └──────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Component (Primitive Building Block)

```typescript
interface Component {
  id: string;
  type: ComponentType;
  subtype?: string;           // e.g., "ceramic" for capacitor
  value: number;              // primary value (ohms, farads, etc.)
  unit: string;               // "Ω", "F", "H", etc.
  tolerance?: number;         // percentage
  package?: string;           // "0805", "DIP-8", "TO-92"
  manufacturer?: string;
  partNumber?: string;
  
  // For simulation
  model: ComponentModel;
  
  // Position in node editor
  position: { x: number; y: number };
  
  // Connection points
  pins: Pin[];
}

type ComponentType = 
  | 'resistor' | 'capacitor' | 'inductor' | 'potentiometer'
  | 'diode' | 'led' | 'zener'
  | 'transistor_npn' | 'transistor_pnp' | 'jfet_n' | 'jfet_p' | 'mosfet_n' | 'mosfet_p'
  | 'opamp' | 'ota'
  | 'ic_vco' | 'ic_vca' | 'ic_filter' | 'ic_delay' | 'ic_timer' | 'ic_logic'
  | 'jack' | 'switch' | 'header';
```

### Module (Eurorack-Level Block)

```typescript
interface Module {
  id: string;
  name: string;
  type: ModuleType;
  hp: number;                 // Eurorack width in HP (1 HP = 5.08mm)
  
  // High-level I/O for patching
  inputs: ModulePort[];
  outputs: ModulePort[];
  controls: ModuleControl[];  // Knobs, switches on panel
  
  // Internal circuitry
  components: Component[];
  internalConnections: Connection[];
  
  // Visual
  panelColor?: string;
  panelLayout: PanelLayout;
  
  // Simulation
  dspModule: string;          // Reference to Rust DSP module
  parameterMapping: ParameterMap[];
}

interface ModulePort {
  id: string;
  name: string;
  type: 'audio' | 'cv' | 'gate' | 'trigger';
  direction: 'input' | 'output';
  normalled?: string;         // Default connection if unpatched
}

interface ModuleControl {
  id: string;
  name: string;
  type: 'knob' | 'slider' | 'switch' | 'button';
  min: number;
  max: number;
  default: number;
  curve: 'linear' | 'logarithmic' | 'exponential';
}

type ModuleType = 
  | 'vco' | 'vco_complex' | 'lfo'
  | 'vcf_lowpass' | 'vcf_highpass' | 'vcf_bandpass' | 'vcf_multimode'
  | 'vca' | 'vca_dual'
  | 'envelope_adsr' | 'envelope_ad' | 'envelope_complex'
  | 'mixer' | 'attenuator' | 'multiple'
  | 'sequencer' | 'clock' | 'divider'
  | 'delay' | 'reverb' | 'distortion' | 'wavefolder'
  | 'noise' | 'sample_hold' | 'quantizer'
  | 'midi_cv' | 'output' | 'input'
  | 'scope' | 'custom';
```

### Patch (Connections Between Modules)

```typescript
interface Patch {
  id: string;
  name: string;
  
  modules: ModuleInstance[];
  cables: Cable[];
  
  // Global settings
  bpm?: number;
  masterVolume: number;
  
  // Metadata
  author?: string;
  created: Date;
  modified: Date;
  notes?: string;
}

interface ModuleInstance {
  id: string;
  moduleId: string;           // Reference to Module template
  position: { x: number; y: number };  // Position in rack
  controlValues: Record<string, number>;
  
  // Optional component value overrides
  componentOverrides?: Record<string, number>;
}

interface Cable {
  id: string;
  from: { moduleId: string; portId: string };
  to: { moduleId: string; portId: string };
  color?: string;
}
```

### Project (Complete Save File)

```typescript
interface Project {
  version: string;
  name: string;
  
  patch: Patch;
  
  // Custom modules created by user
  customModules: Module[];
  
  // Scope/analyzer settings
  scopeSettings: ScopeSettings;
  
  // Audio settings
  audioSettings: AudioSettings;
}
```

---

## Component Library (Comprehensive)

### Passive Components

| Type | Values | Notes |
|------|--------|-------|
| **Resistor** | E24 series (1Ω - 10MΩ) | 1%, 5% tolerance |
| **Capacitor (Ceramic)** | 1pF - 1µF | NPO, X7R |
| **Capacitor (Film)** | 100pF - 10µF | Polyester, Polypropylene |
| **Capacitor (Electrolytic)** | 1µF - 10000µF | Polarized |
| **Inductor** | 1µH - 100mH | For filters |
| **Potentiometer** | 1kΩ - 1MΩ | Linear (B), Log (A), Rev Log (C) |
| **Trimmer** | 100Ω - 1MΩ | For calibration |

### Diodes

| Part | Type | Use |
|------|------|-----|
| **1N4148** | Signal | General switching |
| **1N4001-1N4007** | Rectifier | Power supply |
| **1N5817-1N5819** | Schottky | Low drop |
| **LED** | Various colors | Indicators |
| **1N4728-1N4764** | Zener | Voltage reference |
| **BAT41/BAT85** | Schottky signal | Precision rectifier |

### Transistors

| Part | Type | Use |
|------|------|-----|
| **2N3904** | NPN | General purpose |
| **2N3906** | PNP | General purpose |
| **BC547/BC548** | NPN | Low noise |
| **BC557/BC558** | PNP | Low noise |
| **2N5088/2N5089** | NPN | High gain, low noise (VCAs) |
| **MPSA18** | NPN | Very high gain |
| **2N7000** | N-MOSFET | Switching |
| **BS170** | N-MOSFET | Switching |
| **2N5457** | N-JFET | Buffers, VCAs |
| **J201** | N-JFET | Guitar pedals |
| **2N5459** | N-JFET | Low noise |

### Operational Amplifiers

| Part | Pins | Characteristics | Use |
|------|------|-----------------|-----|
| **TL071** | Single | JFET, low noise | Audio |
| **TL072** | Dual | JFET, low noise | Standard synth op-amp |
| **TL074** | Quad | JFET, low noise | Standard synth op-amp |
| **TL081/82/84** | S/D/Q | JFET, faster | Audio |
| **LM358** | Dual | Single supply OK | Utility |
| **LM324** | Quad | Single supply OK | Utility |
| **NE5532** | Dual | Low noise, high current | High quality audio |
| **OPA2134** | Dual | Very low noise, FET | Premium audio |
| **LM833** | Dual | Low noise | Audio |
| **RC4558** | Dual | Classic (tube screamer) | Overdrive |
| **LM741** | Single | Classic, vintage | Educational |

### OTAs (Operational Transconductance Amplifiers)

| Part | Notes | Use |
|------|-------|-----|
| **LM13700** | Dual OTA with buffers | VCAs, VCFs, VCOs - THE synth chip |
| **LM13600** | Similar to 13700 | Legacy projects |
| **CA3080** | Single OTA (obsolete) | Vintage circuits |

### VCO Chips

| Part | Type | Notes |
|------|------|-------|
| **CEM3340** | Analog VCO | The classic! (Roland, Sequential) |
| **AS3340** | CEM3340 clone | Alfa - current production |
| **V3340** | CEM3340 clone | Coolaudio - current production |
| **CEM3394** | Complete voice | VCO+VCF+VCA (rare) |

### VCA Chips

| Part | Type | Notes |
|------|------|-------|
| **SSI2164** | Quad VCA | Modern, low noise |
| **V2164** | SSI2164 clone | Coolaudio |
| **CEM3360** | Dual VCA | Classic (obsolete) |
| **AS3360** | CEM3360 clone | Alfa |
| **LM13700** | Can be used as VCA | Discrete approach |

### Filter Chips

| Part | Type | Notes |
|------|------|-------|
| **CEM3320** | 4-pole VCF | Classic (Prophet 5) |
| **AS3320** | CEM3320 clone | Alfa |
| **SSM2044** | 4-pole VCF | Classic (Korg) |
| **SSI2144** | SSM2044 successor | Modern production |
| **LM13700** | OTA filter building block | DIY filters |

### Delay / Time-Based Effect Chips

| Part | Type | Notes |
|------|------|-------|
| **PT2399** | Digital delay | Lo-fi, cheap, popular! |
| **MN3007** | BBD (1024 stages) | Analog delay |
| **MN3207** | BBD (1024 stages) | Common |
| **MN3005** | BBD (4096 stages) | Long delay |
| **V3207** | MN3207 clone | Coolaudio |
| **MN3101** | BBD clock driver | Required for MN BBDs |
| **V3102** | MN3101 clone | Coolaudio |
| **FV-1** | DSP multi-effects | Spin Semiconductor - reverb, delay, chorus |
| **Belton BTDR-1/2/3** | Spring reverb sim | Brick module |

### Timer / Clock ICs

| Part | Type | Notes |
|------|------|-------|
| **NE555** | Timer | Classic - LFO, clock |
| **NE556** | Dual 555 | Two timers |
| **LM331** | V/F converter | Precision VCO |
| **ICM7555** | CMOS 555 | Low power |

### Logic / Utility ICs

| Part | Type | Use |
|------|------|-----|
| **CD4017** | Decade counter | Sequencers |
| **CD4024** | 7-stage counter | Clock divider |
| **CD4040** | 12-stage counter | Clock divider |
| **CD4051** | 8-ch analog mux | Switching |
| **CD4052** | Dual 4-ch mux | Switching |
| **CD4053** | Triple 2-ch mux | Switching |
| **CD4066** | Quad analog switch | Routing |
| **74HC595** | Shift register | LED drivers |
| **74HC165** | Shift register | Input expansion |

### Comparators

| Part | Type | Notes |
|------|------|-------|
| **LM311** | Single | Standard |
| **LM339** | Quad | Open collector |
| **LM393** | Dual | Open collector |

### Voltage Regulators

| Part | Output | Notes |
|------|--------|-------|
| **L7805** | +5V | TO-220 |
| **L7812** | +12V | TO-220 |
| **L7912** | -12V | TO-220 |
| **L78L05** | +5V | TO-92 (100mA) |
| **LM317** | Adjustable + | 1.2-37V |
| **LM337** | Adjustable - | -1.2 to -37V |
| **TL431** | 2.5V reference | Precision |
| **LM4040** | Various | Precision reference |
| **AMS1117** | 3.3V/5V | Low dropout |

### Voltage References

| Part | Voltage | Notes |
|------|---------|-------|
| **TL431** | 2.5V (adj) | Shunt regulator |
| **LM4040** | 2.5V, 4.096V, 5V | Precision |
| **REF02** | 5V | High precision |

---

## DSP Simulation Approach

### Philosophy

We use **behavioral modeling** - mathematical models that capture the *sonic character* of circuits without simulating every electron. This allows:
- Real-time audio (essential for usability)
- Accurate sound when component values change
- Predictable CPU usage

### Component Simulation Models

#### Resistor
Simple scaling factor. Resistance affects:
- Filter cutoff frequencies (RC time constant)
- Gain (feedback resistors in op-amp circuits)
- Biasing and current limiting

#### Capacitor
```rust
// Simple 1-pole lowpass/highpass
// cutoff = 1 / (2 * PI * R * C)
struct CapacitorModel {
    capacitance: f32,  // Farads
    voltage: f32,      // State variable
}

impl CapacitorModel {
    fn process(&mut self, current: f32, dt: f32) -> f32 {
        // V = integral(I/C)dt
        self.voltage += (current / self.capacitance) * dt;
        self.voltage
    }
}
```

#### Op-Amp (Ideal)
```rust
struct OpAmpModel {
    gain: f32,           // Open-loop gain (huge, ~100000)
    slew_rate: f32,      // V/µs - limits high frequency response
    output_min: f32,     // Rail voltage
    output_max: f32,     // Rail voltage
    gbw: f32,            // Gain-bandwidth product
}
```

For feedback configurations (inverting, non-inverting), calculate closed-loop gain from resistor values.

#### OTA (LM13700)
```rust
struct OtaModel {
    transconductance: f32,  // gm, controlled by Iabc
    input_offset: f32,
    linearizing_diodes: bool,
}

impl OtaModel {
    fn process(&self, v_in_plus: f32, v_in_minus: f32, i_abc: f32) -> f32 {
        // Iout = gm * (V+ - V-)
        // gm ≈ 19.2 * Iabc (at room temp)
        let gm = 19.2 * i_abc;
        gm * (v_in_plus - v_in_minus).tanh()  // tanh for soft limiting
    }
}
```

#### VCO (CEM3340 / AS3340)
```rust
struct Vco3340Model {
    // Core parameters
    base_frequency: f32,
    // Waveform outputs
    saw_output: f32,
    pulse_output: f32,
    triangle_output: f32,
    // State
    phase: f32,
    sync_state: bool,
}

impl Vco3340Model {
    fn process(&mut self, cv_in: f32, pw_cv: f32, sync_in: f32, sample_rate: f32) -> VcoOutputs {
        // 1V/octave: freq = base_freq * 2^(cv_in)
        let frequency = self.base_frequency * 2.0_f32.powf(cv_in);
        
        // Anti-aliased waveform generation (PolyBLEP)
        let phase_inc = frequency / sample_rate;
        self.phase = (self.phase + phase_inc) % 1.0;
        
        // Generate waveforms with anti-aliasing
        let saw = self.poly_blep_saw(self.phase, phase_inc);
        let pulse = self.poly_blep_pulse(self.phase, phase_inc, pw_cv);
        let tri = self.triangle_from_saw(saw);
        
        VcoOutputs { saw, pulse, triangle: tri }
    }
}
```

#### VCF (State Variable Filter)
```rust
struct StateVariableFilter {
    cutoff: f32,
    resonance: f32,
    
    // State variables
    lowpass: f32,
    bandpass: f32,
    highpass: f32,
}

impl StateVariableFilter {
    fn process(&mut self, input: f32, cutoff_cv: f32, sample_rate: f32) -> FilterOutputs {
        // Calculate coefficient from cutoff frequency
        let freq = self.cutoff * 2.0_f32.powf(cutoff_cv);
        let f = 2.0 * (PI * freq / sample_rate).sin();
        let q = 1.0 - self.resonance.min(0.99);
        
        // State variable filter algorithm
        self.highpass = input - self.lowpass - q * self.bandpass;
        self.bandpass += f * self.highpass;
        self.lowpass += f * self.bandpass;
        
        FilterOutputs {
            lowpass: self.lowpass,
            bandpass: self.bandpass,
            highpass: self.highpass,
            notch: self.highpass + self.lowpass,
        }
    }
}
```

#### PT2399 Delay
```rust
struct Pt2399Model {
    buffer: Vec<f32>,
    write_pos: usize,
    delay_time: f32,      // Controlled by external RC
    feedback: f32,
    
    // PT2399 character
    sample_rate: f32,     // Internal ~44.1kHz max
    bit_depth_eff: f32,   // Effective ~16 bit but noisy
    lowpass_state: f32,   // Built-in filtering
}

impl Pt2399Model {
    fn process(&mut self, input: f32, delay_cv: f32) -> f32 {
        // Variable delay with interpolation
        let delay_samples = self.delay_time * delay_cv * self.sample_rate;
        let read_pos = /* interpolated read */;
        
        // Add PT2399 character (slight degradation, filtering)
        let delayed = self.read_interpolated(read_pos);
        let filtered = self.lowpass(delayed);
        let output = input + self.feedback * filtered;
        
        self.write(output);
        filtered
    }
}
```

---

## UI Design Specification

### Color Palette (Dark Mode)

```css
:root {
  --bg-primary: #0f0f0f;      /* Main background */
  --bg-secondary: #1a1a1a;    /* Panels, cards */
  --bg-tertiary: #252525;     /* Elevated elements */
  
  --text-primary: #e0e0e0;    /* Main text */
  --text-secondary: #888888;  /* Labels, hints */
  --text-muted: #555555;      /* Disabled */
  
  --accent-primary: #00d4aa;  /* Primary actions, active */
  --accent-secondary: #0099ff;/* Secondary highlights */
  --accent-warning: #ffaa00;  /* Warnings */
  --accent-error: #ff4444;    /* Errors */
  
  /* Signal type colors */
  --signal-audio: #00d4aa;    /* Audio signals - teal */
  --signal-cv: #ffaa00;       /* CV signals - amber */
  --signal-gate: #ff6b6b;     /* Gate/trigger - red */
  --signal-clock: #9966ff;    /* Clock signals - purple */
  
  /* Cable colors */
  --cable-1: #ff6b6b;
  --cable-2: #ffa500;
  --cable-3: #ffee00;
  --cable-4: #00ff88;
  --cable-5: #00ccff;
  --cable-6: #cc66ff;
  --cable-7: #ff66cc;
  --cable-8: #ffffff;
}
```

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ≡ SynthForge                    Project: Untitled*     │ ▶ │ ■ │  CPU: 12% │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │                         RACK VIEW                                   │   │
│  │                    (Module Patching Area)                           │   │
│  │                                                                     │   │
│  │   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │   │
│  │   │      │  │      │  │      │  │      │  │      │  │      │       │   │
│  │   │ VCO  │──│ VCF  │──│ VCA  │──│ OUT  │  │SCOPE │  │ LFO  │       │   │
│  │   │  +   │  │  +   │  │  +   │  │      │  │      │  │  +   │       │   │
│  │   │      │  │      │  │      │  │      │  │      │  │      │       │   │
│  │   └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘       │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Library │ Inspector │ Scope │ BOM                                          │
│  ────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─ Component Library ──────────┐  ┌─ Scope ─────────────────────────────┐ │
│  │                              │  │                                     │ │
│  │  📁 Modules                  │  │    ╭──────────────────────────────╮ │ │
│  │    ├─ Oscillators            │  │    │   /\    /\    /\    /\      │ │ │
│  │    ├─ Filters                │  │    │  /  \  /  \  /  \  /  \     │ │ │
│  │    ├─ Amplifiers             │  │    │ /    \/    \/    \/    \    │ │ │
│  │    ├─ Envelopes              │  │    ╰──────────────────────────────╯ │ │
│  │    ├─ Effects                │  │                                     │ │
│  │    └─ Utility                │  │  CH1: VCO Out    Freq: 440 Hz       │ │
│  │                              │  │  Time: 5ms/div   Amp: 1V/div        │ │
│  │  📁 Components               │  │                                     │ │
│  │    ├─ Resistors              │  └─────────────────────────────────────┘ │
│  │    ├─ Capacitors             │                                          │
│  │    ├─ Op-Amps                │                                          │
│  │    ├─ ICs                    │                                          │
│  │    └─ ...                    │                                          │
│  │                              │                                          │
│  └──────────────────────────────┘                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Module Detail View (Expanded)

When clicking the "+" button on a module:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Rack                    VCO Module - Component View              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Component Properties          │   Node Editor (Circuit View)              │
│   ─────────────────────────────│   ─────────────────────────────────────── │
│                                 │                                           │
│   Selected: R1                  │      ┌─────┐                              │
│   Type: Resistor                │      │AS3340│                             │
│   Value: 100kΩ                  │      │     ├──────┬──────┐               │
│   Tolerance: 1%                 │      │     │      │      │               │
│   Package: 0805                 │      └──┬──┘   ┌──┴──┐  ┌┴──┐            │
│                                 │         │      │ R1  │  │C1 │            │
│   [Change Value]                │         │      │100k │  │10n│            │
│                                 │      ┌──┴──┐   └──┬──┘  └┬──┘            │
│   Purchase Info:                │      │TL072│      │      │               │
│   - Mouser: 123-456            │      │  A  ├──────┴──────┘               │
│   - DigiKey: ABC-123           │      └─────┘                              │
│                                 │                                           │
│   BOM Entry:                    │                                           │
│   1x 100kΩ 0805 1%             │                                           │
│                                 │                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
synthforge/
├── src-tauri/                    # Rust backend
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs              # Tauri entry point
│   │   ├── lib.rs               # Library exports
│   │   ├── audio/               # Audio engine
│   │   │   ├── mod.rs
│   │   │   ├── engine.rs        # Main audio processor
│   │   │   ├── graph.rs         # Module graph management
│   │   │   └── scope.rs         # Scope data capture
│   │   ├── dsp/                 # DSP modules
│   │   │   ├── mod.rs
│   │   │   ├── oscillator.rs
│   │   │   ├── filter.rs
│   │   │   ├── amplifier.rs
│   │   │   ├── envelope.rs
│   │   │   ├── effects.rs
│   │   │   └── components/      # Low-level component models
│   │   │       ├── mod.rs
│   │   │       ├── resistor.rs
│   │   │       ├── capacitor.rs
│   │   │       ├── opamp.rs
│   │   │       ├── ota.rs
│   │   │       └── transistor.rs
│   │   ├── commands/            # Tauri IPC commands
│   │   │   ├── mod.rs
│   │   │   ├── audio.rs
│   │   │   ├── project.rs
│   │   │   └── modules.rs
│   │   └── state.rs             # App state management
│   └── tauri.conf.json
│
├── src/                         # React frontend
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Main app component
│   ├── components/
│   │   ├── rack/                # Rack view components
│   │   │   ├── Rack.tsx
│   │   │   ├── Module.tsx
│   │   │   ├── Cable.tsx
│   │   │   └── Port.tsx
│   │   ├── editor/              # Component node editor
│   │   │   ├── NodeEditor.tsx
│   │   │   ├── ComponentNode.tsx
│   │   │   └── Wire.tsx
│   │   ├── scope/               # Scope and meters
│   │   │   ├── Oscilloscope.tsx
│   │   │   ├── SpectrumAnalyzer.tsx
│   │   │   └── VuMeter.tsx
│   │   ├── library/             # Component browser
│   │   │   ├── Library.tsx
│   │   │   ├── ModuleList.tsx
│   │   │   └── ComponentList.tsx
│   │   ├── inspector/           # Property inspector
│   │   │   └── Inspector.tsx
│   │   └── ui/                  # Shared UI components
│   │       ├── Knob.tsx
│   │       ├── Slider.tsx
│   │       ├── Button.tsx
│   │       └── Panel.tsx
│   ├── stores/                  # Zustand stores
│   │   ├── projectStore.ts
│   │   ├── audioStore.ts
│   │   └── uiStore.ts
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAudio.ts
│   │   ├── useTauri.ts
│   │   └── useScope.ts
│   ├── lib/                     # Utilities
│   │   ├── types.ts             # TypeScript types
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
│
├── data/                        # Component and module data
│   ├── components/
│   │   ├── passive.toml         # Resistors, caps, etc.
│   │   ├── semiconductors.toml  # Diodes, transistors
│   │   ├── opamps.toml
│   │   └── ics.toml             # VCO chips, delays, etc.
│   └── modules/
│       ├── vco_3340.toml        # AS3340-based VCO
│       ├── vcf_svf.toml         # State variable filter
│       ├── vca_2164.toml        # SSI2164 VCA
│       └── ...
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Project setup (Tauri + React + TypeScript)
- [ ] Basic UI layout with dark theme
- [ ] Simple audio engine (sine wave test)
- [ ] One working module (VCO with saw/square/triangle)
- [ ] Basic rack view with module placement
- [ ] Simple oscilloscope display
- [ ] Save/load projects

### Phase 2: Core Modules
- [ ] VCO module (AS3340-based)
- [ ] VCF module (state variable filter)
- [ ] VCA module (SSI2164-based)
- [ ] ADSR envelope
- [ ] LFO
- [ ] Mixer
- [ ] Audio output module
- [ ] Cable patching between modules

### Phase 3: Component View
- [ ] Node editor for internal circuitry
- [ ] Component library browser
- [ ] Component property inspector
- [ ] Ability to modify component values
- [ ] See circuit schematic per module

### Phase 4: Advanced Features
- [ ] More modules (sequencer, delay, reverb, etc.)
- [ ] Spectrum analyzer
- [ ] BOM export
- [ ] Module creation wizard
- [ ] Custom module saving
- [ ] MIDI input support

### Phase 5: Polish
- [ ] Performance optimization
- [ ] Comprehensive component library
- [ ] User documentation
- [ ] Example patches
- [ ] Module preset library

---

## Questions / Decisions Needed

1. **Sample rate**: 44.1kHz or 48kHz default?
2. **Buffer size**: 256 or 512 samples? (latency vs stability tradeoff)
3. **Eurorack voltage standards**: ±5V audio, 0-10V CV, 0-5V gates?
4. **Module format**: Start with specific classic designs or generic?

---

*This document will evolve as we build. Ready to start Phase 1!*
