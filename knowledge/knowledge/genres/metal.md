# Metal Production Guide

## Overview

Metal is characterized by aggressive distortion, powerful drums, and tight, precise performances. This guide covers production techniques across metal subgenres.

## Subgenres Covered

- **Thrash Metal** (Metallica, Slayer, Megadeth)
- **Progressive Metal** (Dream Theater, Tool, Opeth)
- **Djent** (Meshuggah, Periphery, Animals as Leaders)
- **Death Metal** (Death, Cannibal Corpse, Gojira)
- **Black Metal** (Mayhem, Emperor, Dimmu Borgir)
- **Doom Metal** (Black Sabbath, Electric Wizard)
- **Nu-Metal** (Korn, Deftones, Linkin Park)
- **Metalcore** (Killswitch Engage, Architects, Bring Me The Horizon)
- **Industrial Metal** (Rammstein, Nine Inch Nails, Ministry)

## Guitar Production

### Tone Fundamentals

**Signal Chain:**
```
Guitar → Noise Gate → Tube Screamer/OD → High Gain Amp → Cabinet IR → EQ → Compression
```

**Key Frequencies:**
| Frequency | Element | Action |
|-----------|---------|--------|
| 80-120 Hz | Low end thump | Cut on rhythm, keep on leads |
| 200-400 Hz | Mud, boxiness | CUT 3-6 dB (critical!) |
| 800-1200 Hz | Honk, nasal | Cut if harsh |
| 2-4 kHz | Bite, aggression | Boost 2-4 dB |
| 5-8 kHz | Presence, pick attack | Boost for clarity |
| 8-12 kHz | Fizz | Cut if harsh |

### Amp Settings by Subgenre

**Thrash Metal (Metallica, Megadeth)**
```
Amp: Mesa Boogie Mark series, Marshall JCM800
Gain: 6-7/10
Bass: 5-6
Mid: 5-6 (scooped for rhythm, boosted for leads)
Treble: 6-7
Presence: 6-7
```

**Djent (Meshuggah, Periphery)**
```
Amp: Axe-FX, Kemper, Neural DSP
Gain: 5-6/10 (less than you think!)
Bass: 4-5 (tight, not boomy)
Mid: 6-7 (crucial for djent)
Treble: 6-7
Focus: Tight low end, cutting mids
```

**Death Metal (Cannibal Corpse, Death)**
```
Amp: Peavey 5150, Mesa Dual Rectifier
Gain: 7-8/10
Bass: 5-6
Mid: 4-5
Treble: 6-7
Focus: Buzzsaw texture, palm mute clarity
```

**Black Metal (Mayhem, Emperor)**
```
Amp: Marshall, Peavey, Boss HM-2 for Swedish sound
Gain: 8-10/10 (wall of sound)
Bass: Low (thin is intentional)
Mid: Scooped or boosted depending on style
Treble: High (bright, cold)
Focus: Atmosphere, tremolo picking clarity
```

### Quad Tracking

Standard for heavy rhythm guitars:
```
1. Left 100% - Take 1
2. Right 100% - Take 2
3. Left 50-70% - Take 3 (different tone/amp)
4. Right 50-70% - Take 4 (different tone/amp)
```

**Pan positions:**
- Main rhythm: L100/R100
- Double tracks: L50-70/R50-70
- Leads: Center or L30/R30

### Recommended Plugins (Free/Paid)

**Amp Sims:**
- Neural DSP (Archetype series) - Premium
- Mercuriall Spark (free)
- Ignite Amps Emissary (free)
- LePou plugins (free)
- ML Sound Lab Amped Roots (free)

**Cabinet IRs:**
- OwnHammer
- ML Sound Lab
- Bogren Digital
- Nadir (free)

## Bass Production

### Tone Approach

Metal bass needs to cut through dense guitars while providing low-end foundation.

**Signal Chain:**
```
Bass → Compressor → Amp/DI blend → EQ → Saturation → Limiting
```

**DI + Amp Blend:**
```
DI: Clean, fundamental low end (100-200 Hz)
Amp: Grit, midrange presence (600-2000 Hz)
Blend: 50/50 to 70/30 DI/Amp
```

**EQ Guidelines:**
| Frequency | Action |
|-----------|--------|
| 40-80 Hz | Boost for sub weight |
| 100-200 Hz | Main body |
| 200-400 Hz | Cut for clarity |
| 700-1200 Hz | Boost for growl/presence |
| 2-4 kHz | Boost for string definition |

### Sidechain to Kick

Essential for tight low end:
```
1. Insert compressor on bass
2. Sidechain from kick drum
3. Ratio: 4:1, Attack: fast, Release: medium
4. 2-4 dB gain reduction on kick hits
```

## Drum Production

### Kick Drum

**Metal Kick Sound:**
```
Sample replacement/augmentation common
Attack: Clicky (2-5 kHz boost)
Body: Tight (100-150 Hz)
Sub: Controlled (40-80 Hz)
```

**EQ:**
- HPF: 30-40 Hz
- Cut: 300-500 Hz (boxiness)
- Boost: 60-80 Hz (thump)
- Boost: 2-5 kHz (click/beater)

**Compression:**
```
Ratio: 4:1 to 8:1
Attack: 10-30 ms (preserve click)
Release: 50-150 ms
Gain Reduction: 4-8 dB
```

**Trigger/Sample Blend:**
- Use triggered samples for consistency
- Blend with original for natural feel
- Common triggers: Steven Slate, GGD, Superior Drummer

### Snare Drum

**Metal Snare Characteristics:**
- Tight, controlled ring
- Punchy attack
- Present in dense mix

**EQ:**
- HPF: 80-100 Hz
- Boost: 150-200 Hz (body)
- Cut: 400-600 Hz (boxiness)
- Boost: 2-4 kHz (crack)
- Boost: 5-8 kHz (snare wires)

**Processing:**
- Gate to remove bleed
- Parallel compression for power
- Sample layering for consistency

### Toms

**EQ per tom:**
- HPF: 60-100 Hz (floor tom lower)
- Boost fundamental (80-200 Hz depending on tom)
- Cut mud (300-500 Hz)
- Boost attack (3-5 kHz)

### Overheads/Cymbals

**Approach depends on subgenre:**

*Modern Metal:*
- HPF: 500-1000 Hz (mainly cymbals)
- Close-mic cymbals separately
- Minimal room sound

*Traditional Metal:*
- HPF: 200-400 Hz
- More natural overhead balance
- Room mics for depth

### Drum Bus Processing

```
1. Glue compression (2-4 dB GR, slow attack)
2. EQ (subtle tonal shaping)
3. Parallel compression (heavy, blended)
4. Saturation (optional warmth)
```

## Vocals

### Harsh Vocals (Growls, Screams)

**Signal Chain:**
```
Mic → Preamp → HPF → Compression → EQ → Saturation → De-esser
```

**EQ:**
- HPF: 100-150 Hz
- Cut: 200-400 Hz (mud)
- Boost: 2-4 kHz (presence)
- Cut/De-ess: 5-8 kHz (harshness)

**Compression:**
```
Ratio: 6:1 to 10:1
Attack: Fast (5-15 ms)
Release: Medium (50-100 ms)
Heavy compression acceptable
```

### Clean Vocals in Metal

**EQ:**
- HPF: 80-120 Hz
- Cut: 200-300 Hz (if muddy)
- Boost: 3-5 kHz (presence)
- Boost: 10-12 kHz (air)

**Effects:**
- Plate reverb (short-medium)
- Delay (tempo-synced, filtered)
- Doubling for choruses

## Mix Bus

### Metal Master Bus Chain

```
1. EQ: Subtle high shelf boost (+1 dB @ 10 kHz)
2. Compression: 2:1, 2-3 dB GR, slow attack
3. Saturation: Subtle tape emulation
4. Limiter: -1 dBTP ceiling
```

### Target Loudness

| Subgenre | Target LUFS |
|----------|-------------|
| Modern Metal/Djent | -8 to -10 |
| Traditional Metal | -10 to -12 |
| Black Metal | -8 to -12 |
| Death Metal | -8 to -10 |
| Doom Metal | -12 to -14 |

## Subgenre-Specific Tips

### Djent

- **Guitars**: Less gain than expected, tight low end
- **Bass**: Prominent, often with drive
- **Drums**: Heavily processed, triggered kicks
- **Mix**: Very tight, precise, modern
- **Key artists**: Meshuggah, Periphery, Animals as Leaders, Monuments

### Progressive Metal

- **Dynamic range**: More than other metal subgenres
- **Clean sections**: Important contrast
- **Complex arrangements**: Clear instrument separation
- **Key artists**: Dream Theater, Tool, Opeth, Porcupine Tree

### Industrial Metal

- **Electronic elements**: Synths, samples, loops
- **Heavily processed**: Everything distorted
- **Rhythmic focus**: Driving, mechanical
- **Key artists**: Rammstein, Nine Inch Nails, Ministry

## Recommended Reference Tracks

| Subgenre | Track | Why |
|----------|-------|-----|
| Djent | Meshuggah - "Bleed" | Tight low end, precision |
| Prog | Dream Theater - "The Glass Prison" | Dynamic range, clarity |
| Thrash | Metallica - "Master of Puppets" | Classic tone balance |
| Death | Gojira - "Flying Whales" | Modern death sound |
| Metalcore | Architects - "Gravedigger" | Massive, modern |

## Common Mistakes

1. **Too much gain** - Less is more, clarity over fuzz
2. **Scooped mids** - Sounds good solo, disappears in mix
3. **Ignoring low-mid mud** - 200-400 Hz needs cutting
4. **Over-compressed drums** - Kills punch and dynamics
5. **Neglecting bass** - Foundation of heaviness
6. **Too much reverb** - Metal is tight and dry

## Reaper-Specific Workflow

1. Create folder tracks for organization (Drums, Guitars, Bass, Vocals)
2. Use track templates for consistent setup
3. Set up parallel compression buses
4. Use ReaGate for drum bleed control
5. ReaComp for glue compression
6. ReaEQ for surgical cuts

## Free Plugins for Metal

**Amp Sims:**
- Ignite Amps Emissary
- LePou Lecto, Legion
- ML Sound Lab Amped Roots

**Drums:**
- Steven Slate Drums Free
- MT Power Drumkit

**Effects:**
- TDR Nova (dynamic EQ)
- Analog Obsession plugins
- Ignite Amps NadIR (cab loader)
