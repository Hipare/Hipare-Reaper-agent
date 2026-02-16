# Vocalist Sounds - Free VST Recreation Guide

## Overview

Vocal production is crucial for any song. This guide covers famous vocalists and their signature production styles, with free plugin chains to recreate them.

---

## Jens Kidman (Meshuggah)

### Signature Sound
- Aggressive, rhythmic shouting
- Synced with guitar stabs
- Dry, present mix placement
- Minimal effects

### Recording Approach
- Close mic (SM7B style)
- Minimal room sound
- Tight compression

### Free VST Chain
```
1. ReaGate (tight gate for silence between phrases)
2. TDR Kotelnikov (compression)
3. ReaEQ
4. Saturation
```

### REAPER Processing
```
ReaEQ:
- HPF at 120 Hz (remove rumble)
- Cut 200-400 Hz (-3 dB) - reduce mud
- Boost 2-4 kHz (+3-4 dB) - presence/aggression
- Boost 5-8 kHz (+2 dB) - articulation

ReaComp:
- Ratio: 8:1 (heavy)
- Attack: 5-10 ms (fast)
- Release: 100 ms
- 6-10 dB gain reduction

Saturation:
- Softube Saturation Knob (moderate)
- Adds grit and aggression
```

### Tips
- Vocal rhythmically locked to riffs
- Dry mix, minimal reverb
- Double track for thickness (optional)
- Key songs: "Bleed", "Rational Gaze"

---

## Thom Yorke (Radiohead)

### Signature Sound
- Ethereal, falsetto
- Heavy effects processing
- Pitch manipulation
- Vulnerable, emotional delivery

### Free VST Chain
```
1. ReaComp (gentle)
2. ReaEQ
3. TAL-Chorus-LX
4. Valhalla Supermassive (essential!)
5. ReaDelay
```

### REAPER Processing
```
ReaEQ:
- HPF at 100 Hz
- Slight cut at 300-400 Hz
- Gentle boost at 3-5 kHz (presence)
- High shelf boost at 10 kHz (air)

ReaComp:
- Ratio: 3:1
- Attack: 20 ms
- Release: auto
- Gentle, 4-6 dB GR

Effects:
- TAL-Chorus-LX (subtle widening)
- Valhalla Supermassive:
  - Mode: Large reverb
  - Mix: 30-40%
  - Long decay (3-5s)
- ReaDelay:
  - Tempo sync
  - Low feedback
  - Filtered repeats
```

### Tips
- Falsetto for emotional moments
- Layer vocals with effects
- Automate reverb (more on choruses)
- Key songs: "Nude", "No Surprises", "Videotape"

---

## Billie Eilish

### Signature Sound
- Intimate, whispered vocals
- ASMR-like close mic technique
- Heavy low-end in voice
- Minimal, sparse arrangements

### Free VST Chain
```
1. ReaComp (heavy for consistency)
2. ReaEQ (proximity effect boost)
3. ReaDelay (subtle)
4. Dragonfly Reverb (room, short)
```

### REAPER Processing
```
ReaEQ:
- BOOST 100-200 Hz (+3-4 dB) - proximity warmth
- HPF at 60 Hz only (keep bass)
- Cut 400-600 Hz (-2 dB)
- Gentle presence boost 4-6 kHz
- Roll off above 12 kHz (intimate)

ReaComp:
- Ratio: 6:1
- Attack: 5 ms (fast)
- Release: 100 ms
- Heavy compression for whisper dynamics
- 8-12 dB GR

Reverb:
- Very subtle room
- Short decay (0.5-1s)
- Keep intimate
```

### Tips
- Sing CLOSE to microphone
- Whisper technique
- Multitrack layers (double/triple)
- Pan duplicates for width
- Key songs: "Bad Guy", "When the Party's Over"

---

## Adele

### Signature Sound
- Powerful, emotional belting
- Clear, present in mix
- Natural dynamics preserved
- Minimal processing, maximum emotion

### Free VST Chain
```
1. TDR Kotelnikov (transparent compression)
2. ReaEQ
3. ReaDelay (subtle slapback)
4. Dragonfly Reverb (hall)
```

### REAPER Processing
```
ReaEQ:
- HPF at 80-100 Hz
- Slight cut at 200-300 Hz
- Boost 2-4 kHz (+2-3 dB) - presence
- Boost 8-12 kHz (+1-2 dB) - air

TDR Kotelnikov:
- Ratio: 3:1
- Slow attack (30-50 ms) - preserve dynamics
- Auto release
- Gentle, 3-5 dB GR
- KEEP DYNAMICS!

Reverb:
- Dragonfly Hall
- Decay: 1.5-2s
- Mix: 15-25%
```

### Tips
- PRESERVE natural dynamics
- Don't over-compress
- Let emotion come through
- Key songs: "Someone Like You", "Hello"

---

## Mike Patton (Faith No More / Mr. Bungle)

### Signature Sound
- Extreme vocal range (6 octaves)
- Screaming to crooning
- Experimental techniques
- Heavy processing on effect parts

### Free VST Chain
```
Clean:
1. ReaComp (moderate)
2. ReaEQ

Aggressive:
1. Analog Obsession (distortion)
2. Heavy compression
3. Pitch effects (Graillon 2)
```

### REAPER Processing
```
Multiple parallel tracks:

CLEAN VOCAL:
ReaEQ:
- Standard vocal EQ
- Presence boost at 3-5 kHz

ReaComp:
- 4:1 ratio
- Moderate settings

AGGRESSIVE VOCAL:
Analog Obsession preamp (pushed)
ReaComp (heavy, 8:1)
Graillon 2 (pitch manipulation)

Blend both to taste
```

### Tips
- Multiple vocal channels for different sounds
- Automate between clean and dirty
- Key songs: "Epic", "Midlife Crisis"

---

## Björk

### Signature Sound
- Unique, theatrical delivery
- Heavy electronic processing
- Unconventional production
- Voice as instrument

### Free VST Chain
```
1. ReaComp
2. ReaEQ
3. Graillon 2 (pitch effects)
4. Valhalla Supermassive
5. Granular effects
```

### REAPER Processing
```
ReaEQ:
- Varies per song
- Often boosted highs
- Unusual EQ choices

Effects:
- Heavy reverb on certain words
- Pitch manipulation
- Granular processing
- Automate everything

Use: Graillon 2 for pitch shifting
Use: Valhalla Supermassive for massive spaces
```

### Tips
- Voice = instrument, not just lyrics
- Experiment with processing
- Key songs: "Army of Me", "Hyperballad"

---

## Ozzy Osbourne (Black Sabbath)

### Signature Sound
- Nasally, mid-focused voice
- Distinctive vibrato
- Double-tracked
- Room reverb

### Free VST Chain
```
1. ReaComp (moderate)
2. ReaEQ (midrange focus)
3. OrilRiver (room reverb)
4. ReaDelay (double-tracking effect)
```

### REAPER Processing
```
ReaEQ:
- HPF at 100 Hz
- Boost 800 Hz - 1.5 kHz (+3 dB) - nasal character
- Cut 200-300 Hz
- Moderate presence (3-5 kHz)

ReaComp:
- Ratio: 4:1
- Medium settings
- 4-6 dB GR

Reverb:
- Room or chamber
- Medium decay (1-1.5s)
- Blend 20-30%

Double-tracking:
- Record twice, pan L/R
- Or use short delay (10-30 ms)
```

### Tips
- Embrace the nasal quality
- Double track for thickness
- Key songs: "Iron Man", "War Pigs"

---

## Lana Del Rey

### Signature Sound
- Dreamy, nostalgic production
- Breathy delivery
- Heavy reverb
- Cinematic feel

### Free VST Chain
```
1. ReaComp (moderate)
2. ReaEQ (warm, vintage)
3. Valhalla Supermassive (essential!)
4. TAL-Chorus-LX
```

### REAPER Processing
```
ReaEQ:
- HPF at 80 Hz
- Boost 100-200 Hz (+2 dB) - warmth
- Cut 3-5 kHz (-1-2 dB) - reduce harshness
- Roll off above 10 kHz (vintage)

ReaComp:
- Ratio: 3:1
- Moderate settings
- Smooth, not aggressive

Effects:
- Valhalla Supermassive:
  - Hall mode
  - Long decay (3-5s)
  - Mix: 30-40%
- TAL-Chorus-LX (subtle width)
```

### Tips
- Breathy, intimate delivery
- Vintage EQ (not bright)
- Lots of reverb
- Key songs: "Summertime Sadness", "Video Games"

---

## Ghost (Papa Emeritus)

### Signature Sound
- Theatrical, operatic
- Multi-layered harmonies
- Clean, present vocals
- 70s rock production influence

### Free VST Chain
```
1. ReaComp
2. ReaEQ (70s vocal EQ)
3. ReaDelay (slapback)
4. OrilRiver (plate reverb)
```

### REAPER Processing
```
ReaEQ:
- HPF at 100 Hz
- Boost 2-3 kHz (presence)
- High shelf boost (air)
- Clean, theatrical sound

Harmonies:
- Layer 3-4 vocal tracks
- Pan across stereo field
- Match EQ on all

Reverb:
- Plate style (OrilRiver)
- Medium decay (1.5s)
- 20-30% wet
```

### Tips
- Multiple harmony layers
- Clean, theatrical delivery
- 70s rock production aesthetic
- Key songs: "Cirice", "Square Hammer"

---

## Julian Casablancas (The Strokes)

### Signature Sound
- Lo-fi, garage rock vocal
- Sounds like singing through a phone
- Distorted, band-pass filtered
- Raw, not polished

### Free VST Chain
```
1. ReaEQ (EXTREME band-pass)
2. Analog Obsession (saturation/distortion)
3. ReaComp (heavy)
```

### REAPER Processing
```
ReaEQ:
- HPF at 300-500 Hz (aggressive!)
- LPF at 3-4 kHz (aggressive!)
- Result: telephone/lo-fi sound
- Boost midrange peak (1-2 kHz)

Saturation:
- Softube Saturation Knob (medium-heavy)
- Or Analog Obsession preamp (pushed)

ReaComp:
- Ratio: 6:1
- Fast attack
- Heavy limiting
```

### Tips
- EXTREME filtering is key
- Don't be afraid to lo-fi it
- Key songs: "Last Nite", "Reptilia"

---

# General Vocal Processing Tips

## Basic Vocal Chain (All Genres)
```
1. Gate (if needed)
2. EQ (subtractive first)
3. Compression
4. EQ (additive/tonal)
5. De-esser (if needed)
6. Effects (reverb, delay)
```

## Common EQ Frequencies

| Frequency | Effect |
|-----------|--------|
| 80-120 Hz | Rumble, proximity |
| 200-400 Hz | Mud, boxiness |
| 800 Hz - 1 kHz | Nasal, honky |
| 2-4 kHz | Presence, clarity |
| 4-6 kHz | Sibilance zone |
| 8-12 kHz | Air, breathiness |

## De-essing

```
TDR Nova (free dynamic EQ):
- Band at 5-8 kHz
- Set to compress dynamically
- Threshold: adjust to catch "S" sounds
- Ratio: 4:1 - 6:1
- Fast attack/release
```

## Doubling Techniques

**Manual Double:**
- Record same part twice
- Pan L/R for width

**ADT (Artificial Double Tracking):**
```
1. Duplicate track
2. Add ReaDelay (10-30 ms)
3. Slight pitch shift (±5 cents)
4. Pan opposite sides
```

## Parallel Compression for Vocals

```
1. Create send from vocal
2. On bus: ReaComp with HEAVY compression
   - Ratio: 10:1+
   - Fast attack
   - 10+ dB GR
3. Blend with original for power + dynamics
```
