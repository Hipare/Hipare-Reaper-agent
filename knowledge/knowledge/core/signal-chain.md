# Audio Signal Chain Fundamentals

## Overview
The signal chain is the path audio takes from source to final output. Understanding this is critical for professional-quality production.

## Basic Signal Flow

```
Source → Input Gain → EQ → Compression → Saturation → Effects → Output
```

### Detailed Chain

1. **Source** (microphone, instrument, virtual instrument)
2. **Preamp/Input Gain** - Set initial level (-18 to -12 dBFS recommended)
3. **High-Pass Filter** - Remove unwanted low frequencies (rumble, proximity effect)
4. **EQ (Subtractive)** - Cut problem frequencies first
5. **Compression** - Control dynamics
6. **EQ (Additive)** - Boost desired frequencies
7. **Saturation/Harmonic Enhancement** - Add warmth and character
8. **Time-Based Effects** - Delay, reverb (usually on sends)
9. **Output/Fader** - Final level adjustment

## Gain Staging

### Target Levels
| Stage | Target Level |
|-------|-------------|
| Recording input | -18 to -12 dBFS peak |
| After each plugin | -18 dBFS RMS average |
| Mix bus input | -6 dBFS headroom |
| Final master | -1 dBFS true peak, -14 LUFS integrated |

### Why It Matters
- Prevents digital clipping
- Plugins operate in optimal range
- Maintains headroom for mastering
- Consistent perceived loudness

## Common Mistakes

1. **Recording too hot** - Leaves no headroom
2. **EQ before compression** - Can cause pumping
3. **Too many plugins** - Phase issues, CPU load
4. **Ignoring gain staging** - Cumulative clipping
5. **Effects on insert instead of send** - Wastes CPU, loses dry signal

## Reaper-Specific Tips

- Use track templates for consistent routing
- Set up default FX chains for common instruments
- Use folders for bus routing (drums, vocals, etc.)
- Monitor with VU meters at -18 dBFS = 0 VU

## Plugin Order Guidelines

### Vocals
```
HPF (80-120Hz) → DeEsser → Compressor → EQ → Saturation → Reverb (send)
```

### Electric Guitar (Clean/Crunch)
```
Noise Gate → Amp Sim → Cabinet IR → EQ → Compression (light) → Delay/Reverb (send)
```

### Electric Guitar (High Gain / Metal) - KRIITTINEN JÄRJESTYS
```
1. ReaGate (noise gate ENSIN - leikkaa kohinan ENNEN vahvistusta)
   - Threshold: -40 to -27 dB (normalized: 0.10-0.25)
   - Attack: 0-1 ms, Hold: 10-50 ms, Release: 20-50 ms
2. TSE 808 / Overdrive (tightness boost, EI distortio)
   - Drive: MATALA (0-15%), Volume: korkea (60-80%)
3. Amp Sim (Emissary, Lead-kanava)
   - Gain: MALTILLINEN (30-45%) - liikaa = moottorisaha/fizz!
4. Cabinet IR (NadIR) - AINA ampin JÄLKEEN!
   - Ilman cabia amppi kuulostaa kamalalta
5. ReaEQ (post-cab tonaalinen muokkaus)
   - HPF 80-100 Hz, LPF 10-12 kHz (poista fizz!)
   - Cut 200-300 Hz (flub), Boost 1-3 kHz (bite/attack)
6. ReaComp (valinnainen, kevyt 2-4 dB GR)

YLEINEN VIRHE: Cabinet IR ENNEN amp simia → väärä!
YLEINEN VIRHE: Gate AMPIN JÄLKEEN → ei leikkaa kohinaa tehokkaasti!
YLEINEN VIRHE: Liikaa gainia → fizzy/buzzy/chainsaw-soundi!
```

### Drums (individual tracks)
```
HPF → Gate → EQ → Compressor → Saturation → Parallel compression (send)
```

### Bass
```
HPF (30-40Hz) → Compressor → EQ → Saturation → Limiter (optional)
```

### Synths
```
EQ → Compression (light) → Saturation → Chorus/Effects → Reverb (send)
```

## Bus Processing

### Drum Bus
```
Glue Compressor (2-4 dB GR) → EQ → Saturation → Parallel compression
```

### Mix Bus
```
EQ (gentle) → Compressor (1-2 dB GR) → Limiter → Metering
```

## References
- Sound On Sound: Signal Flow articles
- iZotope: Audio Mastering guides
- Unison Audio: Signal chain tutorials
