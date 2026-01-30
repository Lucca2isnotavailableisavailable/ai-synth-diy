# 🔧 SynthForge

**Component-Level Synthesizer Circuit Design & Prototyping Tool**

SynthForge lets you design synthesizer circuits from real components - resistors, capacitors, op-amps, OTAs, VCO chips, delay ICs, and more. Build circuits visually, hear them in real-time, then use the component values to build in real hardware!

## ✨ Features

### 🔌 Component-Level Design
Build circuits from actual components:
- **Passive**: Resistors, Capacitors, Inductors, Potentiometers
- **Semiconductors**: Diodes, Zeners, LEDs, NPN/PNP Transistors, JFETs
- **Op-Amps**: TL072, NE5532, LM358, Generic
- **OTAs**: LM13700 (THE synth building block!)
- **Comparators**: LM311, LM339
- **ICs**: CEM3340/AS3340 VCO, SSI2164 VCA, PT2399 Delay, 555 Timer

### 🎨 Visual Circuit Editor
- **Drag & drop** components onto the canvas
- **Wire** pins together by clicking and dragging
- **Inspect** and modify component values in real-time
- **Grid snapping** for neat layouts

### 🎧 Real-Time Audio Simulation
- Hear your circuit as you build it
- Component value changes affect the sound correctly
- 48kHz sample rate, low latency

### 📊 Built-in Oscilloscope
- Real-time waveform display
- Adjustable time/volt divisions
- Multiple probe points

### 📋 Example Circuits Included
- **Simple Sine Wave** - Test your setup
- **CEM3340 VCO** - Classic synth oscillator chip
- **LM13700 OTA VCA** - Voltage controlled amplifier
- **PT2399 Delay** - Lo-fi digital delay
- **Op-Amp Relaxation Oscillator** - Built from basic components

## 🚀 Quick Start

```bash
cd synthforge

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:1420
```

## 🎮 How to Use

### Adding Components
1. Find the component in the **Component Browser** (left panel)
2. Click on it to enter **placement mode**
3. Click on the canvas to place it

### Wiring
1. Click on any pin (the small circles on components)
2. Click on another pin to connect them
3. Wires automatically route orthogonally

### Editing Values
1. Click on a component to select it
2. Use the **Inspector** (right panel) to adjust values
3. Drag sliders for quick changes

### Playing Audio
1. Load an example or build a circuit with:
   - A signal source (voltage source, VCO, etc.)
   - An **Audio Output** component connected to it
2. Click **▶ Play** (or press Space)
3. Hear your circuit!

## 📦 Component Library

### Passive Components
| Component | Description |
|-----------|-------------|
| Resistor | 1Ω - 10MΩ, limits current |
| Capacitor | 1pF - 10mF, stores charge, filters |
| Inductor | 1µH - 1H, stores magnetic energy |
| Potentiometer | Variable resistor with wiper |

### Semiconductors
| Component | Description |
|-----------|-------------|
| Diode (1N4148) | Signal diode, ~0.6V forward drop |
| Zener | Conducts in reverse at set voltage |
| LED | Light emitting diode |
| NPN (2N3904) | NPN transistor, β~150 |
| PNP (2N3906) | PNP transistor |
| N-JFET (2N5457) | Voltage-controlled resistor |

### Op-Amps
| Component | Description |
|-----------|-------------|
| TL072 | JFET input, THE synth op-amp |
| NE5532 | Low noise, high output current |
| LM358 | Single supply capable |
| Generic | Configurable parameters |

### OTAs
| Component | Description |
|-----------|-------------|
| **LM13700** | Dual OTA - VCAs, VCFs, VCOs! |
| CA3080 | Single OTA (legacy) |

### ICs
| Component | Description |
|-----------|-------------|
| **CEM3340/AS3340** | Precision VCO - saw, tri, pulse |
| **SSI2164** | Quad exponential VCA |
| **PT2399** | Digital delay, 30-340ms, lo-fi |
| 555 Timer | Oscillator, monostable, PWM |

### Sources & Probes
| Component | Description |
|-----------|-------------|
| Voltage Source | DC or AC waveforms |
| +12V / -12V Rails | Power supply |
| Ground | 0V reference |
| Audio Output | Connects to speakers |
| Scope Probe | Visualization point |

## 🔬 Circuit Simulation

SynthForge uses **behavioral models** for real-time audio:

### Op-Amp Model
- Open-loop gain (configurable)
- Slew rate limiting
- Rail-to-rail output limiting
- GBW product modeling

### OTA (LM13700) Model
- `Iout = gm × (V+ - V-)` where `gm ≈ 19.2 × Iabc`
- Linearizing diodes option
- Tanh soft limiting on input

### Transistor Models
- Ebers-Moll simplified
- Cutoff / Active / Saturation regions
- Beta (current gain) configurable

### VCO Chip (CEM3340) Model
- 1V/octave exponential response
- Saw, Triangle, Pulse outputs
- Pulse width CV

### Delay (PT2399) Model
- Variable delay time
- Built-in lowpass filtering
- Lo-fi character

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              React + TypeScript UI              │
│  (Circuit Editor, Component Browser, Scope)     │
├─────────────────────────────────────────────────┤
│              Zustand State Management           │
│  (Circuit, Components, Wires, Selection)        │
├─────────────────────────────────────────────────┤
│           Circuit Simulator Engine              │
│  (Behavioral Models, Node Voltage Solving)      │
├─────────────────────────────────────────────────┤
│              Web Audio API                      │
│  (ScriptProcessor → Real-time output)           │
└─────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
synthforge/
├── src/
│   ├── lib/
│   │   ├── circuit/
│   │   │   ├── types.ts        # Type definitions
│   │   │   ├── components.ts   # Component library
│   │   │   ├── simulator.ts    # Circuit solver
│   │   │   └── examples.ts     # Example circuits
│   │   └── circuitAudioEngine.ts
│   ├── components/
│   │   ├── circuit/            # Editor UI
│   │   │   ├── CircuitEditor.tsx
│   │   │   ├── ComponentNode.tsx
│   │   │   ├── CircuitWire.tsx
│   │   │   ├── ComponentBrowser.tsx
│   │   │   └── ComponentInspector.tsx
│   │   ├── scope/
│   │   └── ui/
│   ├── stores/
│   │   ├── circuitStore.ts     # Circuit state
│   │   └── audioStore.ts       # Audio state
│   └── App.tsx
└── package.json
```

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **State**: Zustand
- **Audio**: Web Audio API (ScriptProcessor)
- **Build**: Vite

### Building
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview
```

## 🗺️ Roadmap

- [x] Component library (R, C, op-amps, OTAs, ICs)
- [x] Circuit editor with visual wiring
- [x] Real-time audio simulation
- [x] Oscilloscope display
- [x] Example circuits
- [ ] More IC models (CD4017, CD4051, etc.)
- [ ] Subcircuit/module creation
- [ ] BOM export for purchasing
- [ ] SPICE netlist export
- [ ] Schematic view mode
- [ ] More filter topologies

## 📄 License

MIT License - Build synths, make noise!

## 🙏 Acknowledgments

- Curtis/Alfa/Coolaudio for keeping synth chips alive
- The DIY synth community
- Princeton Technology for the PT2399
