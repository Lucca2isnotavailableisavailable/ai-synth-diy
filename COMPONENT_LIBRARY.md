# SynthForge Component Library

A comprehensive catalog of components for modular synthesizer design.

---

## Table of Contents
1. [Passive Components](#passive-components)
2. [Diodes](#diodes)
3. [Transistors](#transistors)
4. [Operational Amplifiers](#operational-amplifiers)
5. [OTAs (Transconductance Amplifiers)](#otas)
6. [VCO Chips](#vco-chips)
7. [VCA Chips](#vca-chips)
8. [Filter Chips](#filter-chips)
9. [Delay & Time-Based FX Chips](#delay--time-based-fx-chips)
10. [Reverb Chips & Modules](#reverb-chips--modules)
11. [DSP / Multi-Effects Chips](#dsp--multi-effects-chips)
12. [Timer ICs](#timer-ics)
13. [Logic ICs](#logic-ics)
14. [Comparators](#comparators)
15. [Voltage Regulators](#voltage-regulators)
16. [Voltage References](#voltage-references)
17. [Analog Switches & Multiplexers](#analog-switches--multiplexers)
18. [Clock Generators & PLLs](#clock-generators--plls)
19. [Audio Codec ICs](#audio-codec-ics)
20. [Specialty Synth ICs](#specialty-synth-ics)

---

## Passive Components

### Resistors

| Value Range | Tolerance | Package | Use Case |
|-------------|-----------|---------|----------|
| 1Ω - 10MΩ | 1% | 0603, 0805 | Precision circuits |
| 1Ω - 10MΩ | 5% | 0805, through-hole | General use |

**Common synth values:** 1k, 2.2k, 4.7k, 10k, 22k, 47k, 100k, 220k, 470k, 1M

**Matched pairs needed for:** Exponential converters, differential inputs

### Capacitors

#### Ceramic (MLCC)
| Value Range | Dielectric | Use Case |
|-------------|------------|----------|
| 1pF - 100nF | C0G/NPO | Filter, timing (stable) |
| 100pF - 10µF | X7R | Decoupling, general |
| 1µF - 100µF | X5R/X7R | Bulk decoupling |

#### Film
| Value Range | Type | Use Case |
|-------------|------|----------|
| 100pF - 10µF | Polyester (Mylar) | Audio coupling |
| 100pF - 1µF | Polypropylene | High quality filters |
| 1nF - 100nF | Polystyrene | Precision timing |

#### Electrolytic
| Value Range | Type | Use Case |
|-------------|------|----------|
| 1µF - 10000µF | Aluminum | Power supply |
| 10µF - 1000µF | Low-ESR | PSU filtering |

### Potentiometers

| Value | Taper | Part Number Example | Use |
|-------|-------|---------------------|-----|
| 10kΩ | Linear (B) | Alpha 9mm | CV attenuators |
| 100kΩ | Linear (B) | Alpha 9mm | General |
| 10kΩ | Logarithmic (A) | Alpha 9mm | Volume controls |
| 100kΩ | Logarithmic (A) | Alpha 9mm | Filter cutoff |
| 50kΩ | Linear (B) | Bourns 3310 | Trimmers |

### Inductors

| Value | Use |
|-------|-----|
| 10µH - 100µH | EMI filtering |
| 100µH - 10mH | Audio inductors (rare in synths) |

---

## Diodes

### Signal Diodes
| Part | Type | Vf | Speed | Use |
|------|------|-----|-------|-----|
| **1N4148** | Silicon | 0.7V | 4ns | General switching |
| **1N914** | Silicon | 0.7V | 4ns | Same as 4148 |
| **BAT41** | Schottky | 0.35V | Fast | Precision rectifiers |
| **BAT85** | Schottky | 0.35V | Fast | Ring modulators |

### Rectifier Diodes
| Part | Vrrm | If | Use |
|------|------|-----|-----|
| **1N4001** | 50V | 1A | Light loads |
| **1N4004** | 400V | 1A | General |
| **1N4007** | 1000V | 1A | High voltage |
| **1N5817** | 20V | 1A | Schottky, low drop |
| **1N5819** | 40V | 1A | Schottky, low drop |

### Zener Diodes
| Part | Vz | Use |
|------|-----|-----|
| **1N4728A** | 3.3V | Voltage clipping |
| **1N4733A** | 5.1V | 5V reference |
| **1N4739A** | 9.1V | CV limiting |
| **1N4742A** | 12V | Rail protection |
| **1N4744A** | 15V | Gate clipping |

### LEDs
| Color | Vf | Part Example |
|-------|-----|--------------|
| Red | 1.8V | Standard 3mm/5mm |
| Green | 2.1V | Standard 3mm/5mm |
| Yellow | 2.0V | Standard 3mm/5mm |
| Blue | 3.2V | Standard 3mm/5mm |
| White | 3.2V | Standard 3mm/5mm |

---

## Transistors

### NPN Bipolar
| Part | hFE | Ic max | Use |
|------|-----|--------|-----|
| **2N3904** | 100-300 | 200mA | General purpose |
| **BC547B** | 200-450 | 100mA | Low noise |
| **BC548C** | 420-800 | 100mA | High gain |
| **2N5088** | 300-900 | 50mA | VCA, log converters |
| **2N5089** | 400-1200 | 50mA | Low noise, high gain |
| **MPSA18** | 500-1500 | 200mA | Very high gain |
| **BC550C** | 420-800 | 100mA | Low noise audio |

### PNP Bipolar
| Part | hFE | Ic max | Use |
|------|-----|--------|-----|
| **2N3906** | 100-300 | 200mA | General purpose |
| **BC557B** | 200-450 | 100mA | Complement to BC547 |
| **BC559C** | 420-800 | 100mA | Low noise audio |
| **BC560C** | 420-800 | 100mA | Low noise |
| **2N5087** | 250-800 | 50mA | Complement to 2N5088 |

### N-Channel JFET
| Part | Idss | Vgs(off) | Use |
|------|------|----------|-----|
| **2N5457** | 1-5mA | -0.5 to -6V | VCAs, buffers |
| **2N5458** | 2-9mA | -1 to -7V | Similar |
| **2N5459** | 4-16mA | -2 to -8V | Higher current |
| **J201** | 0.2-1mA | -0.3 to -1.5V | Guitar pedals |
| **J113** | 2-10mA | -0.5 to -3V | Analog switches |
| **BF245A** | 2-6.5mA | -0.4 to -4V | European equivalent |

### P-Channel JFET
| Part | Idss | Vgs(off) | Use |
|------|------|----------|-----|
| **J175** | 7-35mA | 1 to 5V | VCAs |
| **2N5460** | 1-5mA | 0.5 to 6V | Low current |

### N-Channel MOSFET
| Part | Vds | Id | Rds(on) | Use |
|------|-----|-----|---------|-----|
| **2N7000** | 60V | 200mA | 5Ω | Switching |
| **BS170** | 60V | 500mA | 5Ω | Switching |
| **IRFD110** | 100V | 1A | 0.6Ω | Higher current |

### P-Channel MOSFET
| Part | Vds | Id | Rds(on) | Use |
|------|-----|-----|---------|-----|
| **BS250** | -45V | -180mA | 14Ω | Switching |
| **VP2106** | -60V | -230mA | 14Ω | Switching |

### Matched Transistor Pairs (Critical for VCAs/Exponential Converters)
| Part | Type | Matching | Use |
|------|------|----------|-----|
| **THAT300** | NPN array | Vbe matched | Expo converters |
| **THAT320** | PNP array | Vbe matched | Expo converters |
| **SSM2210** | Dual NPN | <0.5mV Vbe | Obsolete but classic |
| **SSM2220** | Dual PNP | <0.5mV Vbe | Obsolete but classic |
| **DMMT3904W** | Dual NPN | Factory matched | Modern alternative |
| **DMMT3906W** | Dual PNP | Factory matched | Modern alternative |
| **BCM847** | Dual NPN | Factory matched | SMD option |

---

## Operational Amplifiers

### Standard Audio Op-Amps
| Part | Pins | GBW | Slew | Noise | Notes |
|------|------|-----|------|-------|-------|
| **TL071** | Single | 3MHz | 13V/µs | 18nV/√Hz | JFET, standard |
| **TL072** | Dual | 3MHz | 13V/µs | 18nV/√Hz | **THE synth op-amp** |
| **TL074** | Quad | 3MHz | 13V/µs | 18nV/√Hz | Quad version |
| **TL081** | Single | 3MHz | 13V/µs | 18nV/√Hz | Improved TL071 |
| **TL082** | Dual | 3MHz | 13V/µs | 18nV/√Hz | Improved TL072 |
| **TL084** | Quad | 3MHz | 13V/µs | 18nV/√Hz | Improved TL074 |

### Low Noise Op-Amps
| Part | Pins | GBW | Noise | Notes |
|------|------|-----|-------|-------|
| **NE5532** | Dual | 10MHz | 5nV/√Hz | High output current |
| **NE5534** | Single | 10MHz | 3.5nV/√Hz | Single version |
| **LM833** | Dual | 15MHz | 4.5nV/√Hz | Low noise |
| **OPA2134** | Dual | 8MHz | 8nV/√Hz | FET, premium |
| **OPA1678** | Dual | 8MHz | 4.2nV/√Hz | Modern, excellent |
| **OPA1612** | Dual | 40MHz | 1.1nV/√Hz | Very low noise |
| **OPA2604** | Dual | 20MHz | 10nV/√Hz | FET, audio |

### Single Supply Op-Amps
| Part | Pins | GBW | Notes |
|------|------|-----|-------|
| **LM358** | Dual | 1MHz | Classic single supply |
| **LM324** | Quad | 1MHz | Quad version |
| **MCP6002** | Dual | 1MHz | Rail-to-rail |
| **MCP6004** | Quad | 1MHz | Rail-to-rail |

### High Speed Op-Amps
| Part | Pins | GBW | Slew | Notes |
|------|------|-----|------|-------|
| **AD811** | Single | 140MHz | 2500V/µs | Video |
| **LT1364** | Dual | 70MHz | 1000V/µs | Fast audio |
| **OPA2674** | Dual | 50MHz | 450V/µs | Wideband |

### Vintage/Character Op-Amps
| Part | Notes |
|------|-------|
| **LM741** | The original, colored sound |
| **RC4558** | Classic (Tube Screamer) |
| **JRC4558** | JRC branded, sought after |
| **LM301** | Vintage, with comp cap |
| **µA741** | Fairchild vintage |

---

## OTAs

### Operational Transconductance Amplifiers
| Part | Type | Notes |
|------|------|-------|
| **LM13700** | Dual OTA | **THE synth OTA** - VCAs, VCFs, VCOs |
| **LM13600** | Dual OTA | Earlier version of 13700 |
| **CA3080** | Single OTA | Obsolete but classic |
| **CA3280** | Dual OTA | Obsolete |
| **NE5517** | Dual OTA | Alternative |

### OTA Applications
- Voltage Controlled Amplifiers (VCA)
- Voltage Controlled Filters (VCF)
- Voltage Controlled Oscillators (VCO)
- Voltage Controlled Panning
- Automatic Gain Control

---

## VCO Chips

### Dedicated VCO ICs
| Part | Type | Outputs | Notes |
|------|------|---------|-------|
| **CEM3340** | Analog VCO | Saw, Tri, Pulse | **THE VCO chip** (Curtis) |
| **AS3340** | CEM3340 clone | Saw, Tri, Pulse | Alfa - in production |
| **V3340** | CEM3340 clone | Saw, Tri, Pulse | Coolaudio - in production |
| **CEM3394** | Complete voice | - | VCO+VCF+VCA (rare/expensive) |

### Used In
- Roland SH-101
- Sequential Prophet 5
- Oberheim OB-X
- Memory Moog
- Countless Eurorack modules

### VCO Building Blocks
| Part | Use |
|------|-----|
| **LM13700** | Expo converter, integrator |
| **LM311** | Comparator for reset |
| **TL072** | Buffers, summers |
| **Matched NPNs** | Expo converter |

---

## VCA Chips

### Dedicated VCA ICs
| Part | Channels | Control | Notes |
|------|----------|---------|-------|
| **SSI2164** | 4 | Exponential | Modern, low noise |
| **V2164** | 4 | Exponential | Coolaudio clone |
| **CEM3360** | 2 | Linear/Expo | Obsolete |
| **AS3360** | 2 | Linear/Expo | Alfa clone |
| **THAT2162** | 2 | dB linear | Pro audio |
| **THAT2180** | 1 | dB linear | Pro audio |

### Discrete VCA Options
| Approach | Parts Needed |
|----------|--------------|
| OTA-based | LM13700 + resistors |
| JFET-based | 2N5457 + support |
| Matched BJT | 2N5088 pairs |

---

## Filter Chips

### Dedicated Filter ICs
| Part | Type | Poles | Notes |
|------|------|-------|-------|
| **CEM3320** | VCF | 4-pole | Classic Curtis (Prophet 5) |
| **AS3320** | VCF | 4-pole | Alfa clone |
| **SSM2044** | VCF | 4-pole | Korg, liquid sound |
| **SSI2144** | VCF | 4-pole | Modern SSM2044 |
| **SSM2040** | VCF | 4-pole | Earlier SSM |
| **IR3109** | VCF | 4-pole | Roland (Juno) |
| **BA662** | VCA/OTA | - | Roland clone chip |

### OTA-Based Filter Designs
- State Variable Filter (LM13700)
- Moog Ladder (4x OTA stages)
- Steiner-Parker (multiple topologies)
- MS-20 style (LM13700)

---

## Delay & Time-Based FX Chips

### Digital Delay
| Part | Type | Delay Range | Notes |
|------|------|-------------|-------|
| **PT2399** | Digital | 30-340ms | **Lo-fi classic!** Cheap, ubiquitous |
| **PT2395** | Digital | Echo/Reverb | Larger delay than 2399 |

### BBD (Bucket Brigade Device) - Analog Delay
| Part | Stages | Delay | Notes |
|------|--------|-------|-------|
| **MN3005** | 4096 | Long | Premium, expensive |
| **MN3007** | 1024 | Medium | Common |
| **MN3207** | 1024 | Medium | Very common |
| **MN3008** | 2048 | Long | Less common |
| **V3207** | 1024 | Medium | Coolaudio clone |
| **V3205** | 4096 | Long | Coolaudio clone |

### BBD Clock Drivers
| Part | For | Notes |
|------|-----|-------|
| **MN3101** | MN300x series | Original |
| **MN3102** | MN320x series | Original |
| **V3102** | V320x | Coolaudio clone |

### BBD Compander (Noise Reduction)
| Part | Notes |
|------|-------|
| **NE570** | DBX compander |
| **NE571** | Similar to 570 |
| **SA571** | Same as NE571 |
| **V571** | Coolaudio clone |

---

## Reverb Chips & Modules

### Digital Reverb ICs
| Part | Type | Notes |
|------|------|-------|
| **FV-1** | DSP | Spin Semi - THE reverb chip |
| **PT2395** | Echo IC | Simple reverb-ish |

### Spring Reverb Simulators (Brick Modules)
| Part | Type | Decay | Notes |
|------|------|-------|-------|
| **BTDR-1** | Digital | Short | Belton - 1 spring sim |
| **BTDR-2** | Digital | Medium | Belton - 2 spring sim |
| **BTDR-3** | Digital | Long | Belton - 3 spring sim |
| **BTDR-1H** | Digital | Short | High impedance version |
| **BTDR-2H** | Digital | Medium | High impedance version |
| **BTDR-3H** | Digital | Long | High impedance version |

### Actual Spring Tanks
| Part | Size | Notes |
|------|------|-------|
| **Accutronics Type 4** | Medium | Classic guitar amp |
| **Accutronics Type 8** | Long | Longer decay |
| **MOD Tanks** | Various | Budget options |

---

## DSP / Multi-Effects Chips

### Programmable DSP
| Part | Type | Algorithms | Notes |
|------|------|------------|-------|
| **FV-1** | Fixed-point DSP | 128 built-in | **THE FX DSP chip** |
| **FV-1b** | FV-1 variant | Same | Package variant |
| **EEPROM (24LC32)** | Storage | 8 custom programs | For FV-1 custom patches |

### FV-1 Features
- 8 built-in reverb/delay programs
- Load up to 8 custom programs from EEPROM
- Very easy to use (3 pots for parameters)
- Clean, professional quality

### Other DSP Options
| Part | Notes |
|------|-------|
| **Teensy + Audio Shield** | Arduino-compatible, powerful |
| **Daisy Seed** | Electrosmith, made for audio |
| **ESP32 + I2S DAC** | Budget option |

---

## Timer ICs

| Part | Channels | Notes |
|------|----------|-------|
| **NE555** | 1 | THE timer chip - LFO, clock |
| **NE556** | 2 | Dual 555 |
| **ICM7555** | 1 | CMOS 555 - low power |
| **ICM7556** | 2 | CMOS dual |
| **LM331** | 1 | V/F converter - precision VCO |
| **LM2917** | 1 | F/V converter - pitch tracking |

### 555 Applications
- LFO (low frequency oscillator)
- Clock generator
- Monostable (trigger to gate)
- PWM generator

---

## Logic ICs

### CMOS 4000 Series
| Part | Function | Use |
|------|----------|-----|
| **CD4001** | Quad NOR | Logic |
| **CD4011** | Quad NAND | Logic |
| **CD4013** | Dual D flip-flop | Clock divider |
| **CD4017** | Decade counter | Sequencers! |
| **CD4018** | Presettable counter | Dividers |
| **CD4020** | 14-stage counter | Binary dividers |
| **CD4024** | 7-stage counter | Clock dividers |
| **CD4040** | 12-stage counter | Clock dividers |
| **CD4046** | Phase locked loop | Clock sync |
| **CD4049** | Hex inverter | Wave shaping |
| **CD4051** | 8-ch analog mux | Step sequencer |
| **CD4052** | Dual 4-ch mux | Routing |
| **CD4053** | Triple 2-ch mux | Routing |
| **CD4066** | Quad analog switch | Switching |
| **CD4069** | Hex inverter | Logic |
| **CD4081** | Quad AND | Logic |
| **CD4094** | 8-bit shift register | LEDs |

### 74HC Series (Faster CMOS)
| Part | Function | Use |
|------|----------|-----|
| **74HC00** | Quad NAND | Fast logic |
| **74HC14** | Hex Schmitt | Square waves |
| **74HC74** | Dual D flip-flop | Dividers |
| **74HC165** | Parallel-in shift | Button reading |
| **74HC595** | Serial-out shift | LED driving |
| **74HC4051** | 8-ch mux | Fast switching |
| **74HC4067** | 16-ch mux | Many inputs |

---

## Comparators

| Part | Channels | Output | Notes |
|------|----------|--------|-------|
| **LM311** | 1 | Open collector | Standard |
| **LM393** | 2 | Open collector | Dual |
| **LM339** | 4 | Open collector | Quad |
| **LM2903** | 2 | Open collector | Wide voltage |
| **TLC3702** | 2 | Push-pull | Rail-to-rail |

### Applications
- Gate/trigger generation
- Waveform conversion (saw → square)
- Zero-crossing detection
- Window comparators

---

## Voltage Regulators

### Fixed Positive
| Part | Voltage | Current | Package |
|------|---------|---------|---------|
| **L7805** | +5V | 1.5A | TO-220 |
| **L7808** | +8V | 1.5A | TO-220 |
| **L7812** | +12V | 1.5A | TO-220 |
| **L7815** | +15V | 1.5A | TO-220 |
| **L78L05** | +5V | 100mA | TO-92 |
| **L78L12** | +12V | 100mA | TO-92 |

### Fixed Negative
| Part | Voltage | Current | Package |
|------|---------|---------|---------|
| **L7905** | -5V | 1.5A | TO-220 |
| **L7912** | -12V | 1.5A | TO-220 |
| **L7915** | -15V | 1.5A | TO-220 |
| **L79L05** | -5V | 100mA | TO-92 |
| **L79L12** | -12V | 100mA | TO-92 |

### Adjustable
| Part | Range | Current | Notes |
|------|-------|---------|-------|
| **LM317** | 1.2-37V | 1.5A | Positive |
| **LM337** | -1.2 to -37V | 1.5A | Negative |
| **LM317L** | 1.2-37V | 100mA | Low power |

### Low Dropout (LDO)
| Part | Voltage | Dropout | Notes |
|------|---------|---------|-------|
| **AMS1117-3.3** | 3.3V | 1.3V | Common |
| **AMS1117-5.0** | 5V | 1.3V | Common |
| **MCP1700** | Various | 200mV | Very low dropout |
| **LP2950** | 5V | 400mV | Low power |

---

## Voltage References

| Part | Voltage | Accuracy | Notes |
|------|---------|----------|-------|
| **TL431** | Adjustable (2.5V+) | 0.5% | Shunt reference |
| **LM4040-2.5** | 2.5V | 0.1% | Precision |
| **LM4040-4.096** | 4.096V | 0.1% | Nice for ADCs |
| **LM4040-5.0** | 5V | 0.1% | Precision |
| **REF02** | 5V | 0.3% | High precision |
| **REF03** | 2.5V | 0.6% | Precision |
| **LT1009** | 2.5V | 0.2% | Bandgap |

### Applications
- Expo converter reference
- ADC reference
- Precision CV offset

---

## Analog Switches & Multiplexers

### Analog Switches
| Part | Channels | Ron | Notes |
|------|----------|-----|-------|
| **CD4066** | 4 | 125Ω | Classic |
| **74HC4066** | 4 | 60Ω | Faster |
| **DG441** | 4 | 35Ω | Low Ron |
| **MAX4617** | 8 | 35Ω | 8 channels |
| **ADG441** | 4 | 35Ω | Low leakage |

### Multiplexers
| Part | Config | Notes |
|------|--------|-------|
| **CD4051** | 8:1 | Eurorack standard |
| **CD4052** | Dual 4:1 | Two sections |
| **CD4053** | Triple 2:1 | Three SPDT |
| **CD4067** | 16:1 | 16 channels |
| **74HC4051** | 8:1 | Fast version |
| **74HC4067** | 16:1 | Fast 16 ch |

---

## Clock Generators & PLLs

| Part | Type | Notes |
|------|------|-------|
| **CD4046** | PLL | Phase locked loop |
| **74HC4046** | PLL | Faster version |
| **LTC6903** | Oscillator | SPI controlled |
| **SI5351** | Clock gen | I2C, very precise |
| **MAX7375** | Oscillator | Simple fixed freq |

---

## Audio Codec ICs

### Stereo ADC/DAC Combos
| Part | Bits | Rate | Notes |
|------|------|------|-------|
| **PCM1808** | 24-bit | 96kHz | Budget ADC |
| **PCM5102** | 32-bit | 384kHz | Budget DAC |
| **CS4270** | 24-bit | 192kHz | Balanced |
| **WM8731** | 24-bit | 96kHz | Common choice |
| **WM8960** | 24-bit | 48kHz | With headphone amp |
| **PCM3168A** | 24-bit | 96kHz | 8-in/6-out |

---

## Specialty Synth ICs

### Complete Synth-on-Chip
| Part | Function | Notes |
|------|----------|-------|
| **CEM3394** | Voice chip | VCO+VCF+VCA (rare!) |
| **MT8870** | DTMF decoder | Telephone tones |
| **HT8950** | Voice changer | Pitch shift IC |
| **HT8950A** | Voice changer | Updated version |

### Noise Sources
| Part | Type | Notes |
|------|------|-------|
| **MM5837** | Digital noise | Obsolete |
| **Reverse-biased BJT** | Analog noise | 2N3904 base-emitter |

### Guitar-Specific ICs
| Part | Function | Notes |
|------|----------|-------|
| **MN3005** | BBD | Boss DM-2 delay |
| **MN3207** | BBD | Chorus, flanger |
| **SAD1024** | BBD | Reticon - vintage |
| **V3205** | BBD | Long delay clone |

---

## Eurorack Power Specifications

For reference when designing modules:

| Rail | Voltage | Current (typical) |
|------|---------|-------------------|
| +12V | +12V ±5% | 20-150mA per module |
| -12V | -12V ±5% | 10-50mA per module |
| +5V | +5V ±5% | 0-50mA (optional) |

### Power Connector (Eurorack Standard)
- 16-pin or 10-pin IDC
- Red stripe = -12V side
- ALWAYS double-check orientation!

---

## Where to Buy

### General Electronics
- **Mouser** - Huge selection, datasheets
- **Digikey** - Similar to Mouser
- **LCSC** - Budget, China-based
- **Tayda Electronics** - Budget, DIY focused

### Synth-Specific
- **Thonk** (UK) - Eurorack parts, kits
- **Modular Addict** (US) - Eurorack parts
- **Synthrotek** (US) - Kits, parts
- **Befaco** (Spain) - Kits, parts
- **Amazing Synth** - Alfa chips (AS3340, etc.)
- **Electric Druid** - PIC-based synth chips

### Obsolete/Vintage Parts
- **eBay** - CEM chips, SSM chips
- **Small Bear Electronics** - Guitar/synth parts
- **Cabintech** - Vintage ICs
- **UTSource** - Pulls and new-old-stock

---

*This library will be embedded in SynthForge for browsing and adding components to designs.*
