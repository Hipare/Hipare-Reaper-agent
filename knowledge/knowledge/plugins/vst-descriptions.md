# VST Effect Descriptions for AI

## Purpose
This file maps VST plugin names to their functions, helping AI understand what each effect does.

## REAPER Built-in Effects (ReaPlugs)

| Plugin Name | Type | Finnish | Description | Common Use |
|------------|------|---------|-------------|------------|
| ReaEQ | EQ | Taajuuskorjain | Parametric equalizer, adjust frequencies | Cut mud, boost presence |
| ReaComp | Compressor | Kompressori | Dynamics control, reduce dynamic range | Even out vocals, punch |
| ReaXcomp | Multiband Comp | Multiband-kompressori | Frequency-band compression | Mastering, de-essing |
| ReaDelay | Delay | Viive | Echo/repeat effect | Depth, rhythm |
| ReaVerbate | Reverb | Kaiku | Room/space simulation | Ambience, depth |
| ReaVerb | Convolution Reverb | Konvoluutiokaiku | Realistic space using impulse responses | Natural rooms |
| ReaGate | Gate | Portti | Silence below threshold | Remove bleed, tighten |
| ReaLimit | Limiter | Limitteri | Prevent clipping, maximize loudness | Mastering |
| ReaFIR | FFT EQ/Dynamics | FFT-prosessori | Surgical EQ, noise reduction | Remove hum, match EQ |
| ReaTune | Tuner/Pitch | Viritin | Pitch correction, tuning | Vocal tuning |
| ReaPitch | Pitch Shift | Sävelkorkeuden siirto | Change pitch without tempo | Harmonies, effects |
| JS: Saturation | Saturation | Saturaatio | Harmonic distortion, warmth | Analog warmth |

## Common Free VST Effects

### Amp Simulators (Säröefektit / Vahvistinsimulaattorit)
| Plugin Name | Type | Description |
|------------|------|-------------|
| Ignite Emissary | Amp Sim | High-gain tube amp, metal/rock |
| Ignite NadIR | IR Loader | Cabinet impulse response loader |
| LePou Legion | Amp Sim | Marshall-style high gain |
| LePou Lecto | Amp Sim | Mesa Rectifier style |
| LePou HyBrit | Amp Sim | Clean/crunch Fender/Marshall hybrid |
| TSE 808 | Overdrive | Tube Screamer clone, tighten before amp |
| TSE X50 | Amp Sim | 5150-style high gain |

### Compressors (Kompressorit)
| Plugin Name | Type | Description |
|------------|------|-------------|
| TDR Kotelnikov | Mastering Comp | Transparent, clean compression |
| TDR Molotok | Character Comp | Colorful, punchy |
| Analog Obsession LALA | Optical Comp | LA-2A style, smooth |
| Analog Obsession Fetish | FET Comp | 1176 style, aggressive |
| DC1A | One-knob Comp | Simple, quick compression |

### Equalizers (Taajuuskorjaimet)
| Plugin Name | Type | Description |
|------------|------|-------------|
| TDR Nova | Dynamic EQ | EQ that reacts to signal, surgical |
| TDR SlickEQ | Semi-parametric | Vintage-style tonal shaping |
| MEqualizer | Parametric | General purpose EQ |
| PTEq-X | Pultec EQ | Vintage passive EQ style |

### Reverb (Kaiut)
| Plugin Name | Type | Description |
|------------|------|-------------|
| Valhalla Supermassive | Reverb/Delay | Massive, ambient reverbs |
| Dragonfly Reverb | Algorithmic | Hall, room, plate options |
| OrilRiver | Algorithmic | Natural rooms and halls |
| TAL-Reverb-4 | Plate | Vintage plate reverb |

### Delay (Viiveet)
| Plugin Name | Type | Description |
|------------|------|-------------|
| Valhalla Freq Echo | Analog Delay | Vintage echo with frequency shifting |
| TAL-Dub | Dub Delay | Reggae/dub style delay |

### Saturation/Distortion (Saturaatio/Särö)
| Plugin Name | Type | Description |
|------------|------|-------------|
| Softube Saturation Knob | Saturator | One-knob warmth |
| Analog Obsession CHANNEV | Channel Strip | Neve-style preamp + EQ |
| Camel Crusher | Distortion | Aggressive multiband distortion |

### Synths (Syntetisaattorit)
| Plugin Name | Type | Description |
|------------|------|-------------|
| Vital | Wavetable Synth | Modern sound design |
| Surge XT | Hybrid Synth | Versatile, powerful |
| Dexed | FM Synth | DX7 emulation |
| TAL-NoiseMaker | Analog Synth | Vintage analog sounds |

## Effect Type Keywords

When user says → They want this type:
| Finnish | English | Effect Type |
|---------|---------|-------------|
| särö | distortion | Amp sim, overdrive |
| kompura, kompressori | compressor | Compressor |
| kaiku | reverb | Reverb |
| viive, delay | delay | Delay |
| taajuuskorjain, EQ | equalizer | EQ |
| viritin | tuner | ReaTune |
| limitteri | limiter | ReaLimit |
| portti, gate | gate | ReaGate |
| lämpöä, warmth | saturation | Saturation |

## Common Effect Chains by Instrument

### Electric Guitar (Sähkökitara)
```
1. TSE 808 (tighten) → 2. Ignite Emissary (amp) → 3. NadIR (cabinet) → 4. ReaEQ (shape)
```

### Bass (Basso)
```
1. ReaEQ (HPF 40Hz) → 2. ReaComp (4:1) → 3. Saturation (optional)
```

### Vocals (Laulu)
```
1. ReaEQ (HPF 80Hz, presence 3-5kHz) → 2. ReaComp (3:1) → 3. ReaVerbate (send)
```

### Drums (Rummut)
```
Kick: ReaEQ (sub 60Hz, cut 300Hz) → ReaComp (fast attack)
Snare: ReaEQ (body 200Hz, crack 4kHz) → ReaComp
Overheads: ReaEQ (HPF 400Hz) → Light compression
```

## Settings Terminology

### Compressor Settings
| Setting | Finnish | Description |
|---------|---------|-------------|
| threshold | kynnys | Level where compression starts |
| ratio | suhde | Compression amount (2:1, 4:1) |
| attack | hyökkäys, atak | How fast compression engages |
| release | vapautus | How fast compression stops |
| makeup gain | lisävahvistus | Compensate for volume loss |

### EQ Settings
| Setting | Finnish | Description |
|---------|---------|-------------|
| gain | vahvistus | Boost or cut amount |
| frequency | taajuus | Which frequency to affect |
| Q/bandwidth | kaistanleveys | How wide the change |
| HPF | ylipäästö | Remove low frequencies |
| LPF | alipäästö | Remove high frequencies |

### Reverb Settings
| Setting | Finnish | Description |
|---------|---------|-------------|
| decay/time | kaikuaika | How long reverb lasts |
| pre-delay | esiviive | Gap before reverb |
| mix/wet | märkä | Amount of effect |
| damping | vaimennus | High frequency absorption |

## For AI: Effect Selection Logic

```
IF user wants "guitar tone" or "kitarasoundi":
  → Amp sim (Ignite Emissary) + Cabinet (NadIR) + EQ (ReaEQ)

IF user wants "tighter" or "tiukempi":
  → TSE 808 before amp OR faster attack compression

IF user wants "warmer" or "lämpimämpi":
  → Saturation (Softube Saturation Knob) OR boost 100-200Hz

IF user wants "more space" or "lisää tilaa":
  → Reverb (ReaVerbate/Valhalla Supermassive) OR Delay

IF user wants "punch" or "paukkua":
  → Compression with slow attack (30-50ms)

IF user wants "clarity" or "selkeyttä":
  → EQ boost 2-5kHz, cut 200-400Hz mud
```
