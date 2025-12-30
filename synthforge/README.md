# 🎛️ SynthForge

**Modular Synthesizer Design & Prototyping Tool**

SynthForge is a desktop application for designing, simulating, and prototyping modular synthesizers. Build your synth virtually with accurate audio simulation, then use the component values to build it in real life!

![SynthForge](https://via.placeholder.com/800x450/0f0f0f/00d4aa?text=SynthForge+Screenshot)

## ✨ Features

### 🎹 Module-Level Design
- **Visual Patch Cables**: Connect modules with draggable cables, just like a real Eurorack system
- **Pre-built Modules**: VCO, VCF, VCA, ADSR, LFO, Mixer, Delay, and more
- **Eurorack Standard**: Modules sized in HP (Horizontal Pitch) matching real hardware

### 🔧 Component-Level View
- **Expand Modules**: Click the "+" button to see internal circuitry
- **Edit Component Values**: Change resistors, capacitors, and see how it affects the sound
- **Component Library**: 900+ components including:
  - VCO chips (CEM3340/AS3340)
  - VCA chips (SSI2164)
  - Filter chips (CEM3320, SSM2044)
  - Delay chips (PT2399, BBD)
  - Op-amps, OTAs, transistors, and more

### 🎧 Real-Time Audio
- **Accurate Simulation**: Component value changes affect the sound correctly
- **Anti-aliased Oscillators**: PolyBLEP waveforms for clean sound
- **48kHz Sample Rate**: High-quality audio output

### 📊 Analysis Tools
- **Oscilloscope**: Real-time waveform display with adjustable time/volt divisions
- **Spectrum Analyzer**: See the frequency content of your signals (coming soon)
- **Voltage Meters**: Monitor CV and audio levels

### 💾 Project Management
- **Save/Load Projects**: Keep your designs organized
- **Export BOM**: Bill of Materials for purchasing components (coming soon)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Rust (for desktop build)
- macOS, Windows, or Linux

### Development (Web)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:1420
```

### Desktop Build (Tauri)

```bash
# Install Tauri CLI
npm install -D @tauri-apps/cli

# Build desktop app
npm run tauri:build
```

## 🎮 Usage

### Adding Modules
1. Click on modules in the **Library** panel (left sidebar)
2. Modules appear in the rack view

### Patching
1. **Drag from an output port** (colored ring on a module)
2. **Drop on an input port** of another module
3. Cable connects with a nice catenary curve!

### Controls
- **Knobs**: Click and drag up/down to adjust. Shift+drag for fine control.
- **Double-click knob**: Reset to default value

### Keyboard Shortcuts
- **Space**: Play/Stop audio engine
- **Delete/Backspace**: Remove selected modules or cables

### Viewing Components
- Click the **+** button on any module to see its internal circuit
- View and modify component values
- See exactly what parts you need for real-world build

## 📦 Module Library

| Module | Description | HP |
|--------|-------------|-----|
| **VCO** | Voltage Controlled Oscillator (AS3340 style) - Saw, Square, Triangle, Sine | 10 |
| **VCF** | Multimode Filter - LP, HP, BP | 8 |
| **VCA** | Voltage Controlled Amplifier | 6 |
| **ADSR** | Attack-Decay-Sustain-Release Envelope | 8 |
| **LFO** | Low Frequency Oscillator | 4 |
| **Mixer** | 4-channel mixer | 6 |
| **Noise** | White and Pink noise source | 4 |
| **Delay** | PT2399-style delay | 10 |
| **Clock** | BPM-based clock with divisions | 4 |
| **Scope** | Built-in oscilloscope | 12 |
| **Output** | Stereo output module | 6 |

## 🧩 Component Library

SynthForge includes an extensive component library for real-world builds:

- **Passive**: Resistors, Capacitors, Inductors, Potentiometers
- **Semiconductors**: Diodes, Transistors (BJT, JFET, MOSFET)
- **Op-Amps**: TL072, NE5532, OPA2134, and more
- **OTAs**: LM13700 (the synth workhorse!)
- **VCO Chips**: CEM3340, AS3340, V3340
- **VCA Chips**: SSI2164, V2164
- **Filter Chips**: CEM3320, AS3320, SSM2044
- **Delay Chips**: PT2399, MN3207, BBDs
- **Logic**: CD4017, 4051, 555 timers

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              React + TypeScript UI              │
│  (Rack View, Module Editor, Scope, Library)     │
├─────────────────────────────────────────────────┤
│              Zustand State Management           │
├─────────────────────────────────────────────────┤
│              Web Audio DSP Engine               │
│  (VCO, VCF, VCA, Envelope, Effects)            │
├─────────────────────────────────────────────────┤
│              Tauri (Desktop Shell)              │
│  (File system, Native audio - optional)         │
└─────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
synthforge/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── rack/          # Rack view (Module, Cable, Rack)
│   │   ├── scope/         # Oscilloscope
│   │   ├── library/       # Module library browser
│   │   └── ui/            # Common UI (Knob, Port, Header)
│   ├── stores/            # Zustand state stores
│   ├── lib/               # Core logic
│   │   ├── audioEngine.ts # Web Audio DSP
│   │   ├── modules.ts     # Module definitions
│   │   └── types.ts       # TypeScript types
│   └── styles/            # CSS
├── src-tauri/             # Rust desktop backend
└── data/                  # Component/module data (planned)
```

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **State**: Zustand
- **Audio**: Web Audio API (ScriptProcessor → AudioWorklet planned)
- **Desktop**: Tauri 2.0 (Rust)
- **Build**: Vite

### Building for Production

```bash
# Web only (deployable to any static host)
npm run build

# Desktop app (macOS/Windows/Linux)
npm run tauri:build
```

## 🗺️ Roadmap

- [x] Core module library (VCO, VCF, VCA, ADSR, LFO)
- [x] Visual patch cable system
- [x] Real-time audio engine
- [x] Oscilloscope display
- [x] Save/Load projects
- [ ] Spectrum analyzer
- [ ] Component-level node editor
- [ ] BOM export for purchasing
- [ ] More modules (Sequencer, Quantizer, S&H)
- [ ] MIDI input support
- [ ] AudioWorklet for better performance
- [ ] Module creation wizard

## 📄 License

MIT License - Feel free to use, modify, and distribute!

## 🙏 Acknowledgments

- Inspired by VCV Rack, Reaktor, and the DIY synth community
- Curtis/Alfa/Coolaudio for keeping synth chips alive
- The Eurorack standard for modular design
