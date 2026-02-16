# Compression Guide

## What Compression Does

Compression reduces the dynamic range of audio by attenuating signals that exceed a threshold. This creates:
- More consistent volume levels
- Punchier transients (when used correctly)
- Glue and cohesion in mixes
- Increased perceived loudness

## Key Parameters

### Threshold
The level at which compression begins.
- **Lower threshold** = More compression
- **Higher threshold** = Less compression
- Set so gain reduction occurs only on peaks (typically -10 to -20 dB)

### Ratio
How much the signal is reduced above threshold.
- **2:1** - Gentle, transparent (vocals, buses)
- **4:1** - Medium, noticeable (drums, guitars)
- **8:1** - Heavy compression (aggressive vocals, parallel)
- **10:1+** - Limiting (peaks, protection)

### Attack
How quickly compression engages after signal exceeds threshold.
- **Fast (0.1-10 ms)** - Catches transients, can sound squashed
- **Medium (10-30 ms)** - Balanced, most common
- **Slow (30-100+ ms)** - Lets transients through, adds punch

### Release
How quickly compression stops after signal falls below threshold.
- **Fast (50-100 ms)** - Responsive, can cause pumping
- **Medium (100-300 ms)** - Natural, versatile
- **Slow (300 ms+)** - Smooth, sustained compression
- **Auto** - Adapts to material (good starting point)

### Knee
How gradually compression engages.
- **Hard knee** - Abrupt, aggressive, noticeable
- **Soft knee** - Gradual, transparent, natural

### Makeup Gain
Compensates for volume reduction from compression.
- Match perceived loudness before/after
- Use bypass to A/B compare at same volume

## Common Settings by Instrument

### Vocals (Lead)
```
Ratio: 3:1 to 4:1
Attack: 10-30 ms (preserve consonants)
Release: 100-200 ms or Auto
Gain Reduction: 3-6 dB
```

### Vocals (Aggressive/Rap)
```
Ratio: 6:1 to 8:1
Attack: 5-15 ms
Release: 50-100 ms
Gain Reduction: 6-10 dB
```

### Drums (Overheads)
```
Ratio: 2:1 to 4:1
Attack: 20-40 ms (preserve transients)
Release: 100-200 ms
Gain Reduction: 2-4 dB
```

### Kick Drum
```
Ratio: 4:1 to 6:1
Attack: 10-30 ms (let click through)
Release: 50-150 ms
Gain Reduction: 4-8 dB
```

### Snare
```
Ratio: 4:1 to 6:1
Attack: 5-20 ms
Release: 50-100 ms
Gain Reduction: 4-8 dB
```

### Bass Guitar
```
Ratio: 4:1 to 8:1
Attack: 10-30 ms
Release: 100-300 ms
Gain Reduction: 4-8 dB
```

### Electric Guitar
```
Ratio: 2:1 to 4:1
Attack: 20-50 ms
Release: 100-200 ms
Gain Reduction: 2-4 dB
```

### Acoustic Guitar
```
Ratio: 2:1 to 3:1
Attack: 20-40 ms
Release: 150-300 ms
Gain Reduction: 2-4 dB
```

### Mix Bus (Glue)
```
Ratio: 2:1 to 4:1
Attack: 10-30 ms
Release: Auto or 100-200 ms
Gain Reduction: 1-3 dB MAX
```

## Compression Types

### VCA (Voltage Controlled Amplifier)
- **Character**: Clean, precise, fast
- **Best for**: Drums, transient control, mix bus
- **Examples**: SSL G-Series, API 2500, ReaComp

### FET (Field Effect Transistor)
- **Character**: Aggressive, punchy, colored
- **Best for**: Vocals, drums, aggressive sources
- **Examples**: 1176, Distressor, JS: 1175

### Optical
- **Character**: Smooth, musical, slow
- **Best for**: Vocals, bass, gentle compression
- **Examples**: LA-2A, CL 1B, ReaXcomp

### Variable-Mu (Tube)
- **Character**: Warm, glue, vintage
- **Best for**: Mix bus, mastering, smooth leveling
- **Examples**: Fairchild 670, Manley Variable Mu

## Advanced Techniques

### Parallel Compression
Run compressed and uncompressed signals together.
```
1. Create send from track
2. Apply heavy compression (8:1+, fast attack)
3. Blend compressed signal with original
4. Result: Punch + natural dynamics
```

### Sidechain Compression
Trigger compression from external source.
```
- Kick sidechaining bass (creates space)
- Vocal sidechaining music (ducking)
- Rhythmic pumping in EDM
```

### Serial Compression
Multiple compressors in series, each doing less work.
```
1. First compressor: Catch peaks (fast, 2-4 dB)
2. Second compressor: Smooth leveling (slower, 2-4 dB)
Result: 4-8 dB total, more natural than one doing all
```

### Multiband Compression
Compress different frequency bands independently.
```
- Control bass without affecting highs
- Tame harsh midrange
- Common on mix bus and mastering
```

## Common Mistakes

1. **Over-compressing** - Kills dynamics, sounds lifeless
2. **Too fast attack** - Removes punch and transients
3. **Ignoring makeup gain** - Can't A/B properly
4. **Same settings everywhere** - Each source is different
5. **Compressing for the sake of it** - Not everything needs compression

## Quick Reference: Attack Time Effects

| Attack | Effect on Transients | Best For |
|--------|---------------------|----------|
| Fast (<10 ms) | Squashed, controlled | Limiting, de-essing |
| Medium (10-30 ms) | Preserved but controlled | Most sources |
| Slow (>30 ms) | Enhanced punch | Drums, percussive |

## Reaper Compressor Plugins

- **ReaComp** - Versatile VCA-style (free with Reaper)
- **ReaXcomp** - Multiband compressor
- **JS: 1175** - 1176-style FET emulation
- **JS: Soft Clipper** - Gentle limiting/saturation

## References
- Sound On Sound: Compression tutorials
- iZotope: Dynamics processing guides
- Unison Audio: Compression techniques
