# Mastering Basics

## What is Mastering?

Mastering is the final step before distribution. Goals:
- Achieve competitive loudness
- Ensure translation across playback systems
- Create cohesion across an album/EP
- Prepare for distribution formats

## Mastering Signal Chain

```
Input → Gain Staging → EQ → Compression → Saturation → Stereo Enhancement → Limiting → Metering → Output
```

### Detailed Chain

1. **Gain Staging** - Set input to -6 dBFS peak
2. **Corrective EQ** - Fix problems from mix
3. **Tonal EQ** - Shape overall sound
4. **Multiband Compression** - Control frequency bands
5. **Bus Compression** - Glue and cohesion (1-2 dB)
6. **Saturation** - Warmth and harmonics
7. **Stereo Width** - Mid-side processing
8. **Limiter** - Final loudness and peak control
9. **Dithering** - When reducing bit depth

## Target Levels by Platform

| Platform | Target LUFS | True Peak |
|----------|-------------|-----------|
| Spotify | -14 LUFS | -1 dBTP |
| Apple Music | -16 LUFS | -1 dBTP |
| YouTube | -14 LUFS | -1 dBTP |
| SoundCloud | -14 LUFS | -1 dBTP |
| CD | -9 to -12 LUFS | -0.3 dBTP |
| Vinyl | -12 to -16 LUFS | -1 dBTP |
| Broadcast (EU) | -23 LUFS | -1 dBTP |

## EQ in Mastering

### Common Moves
| Problem | Frequency | Action |
|---------|-----------|--------|
| Mud | 200-400 Hz | Cut 0.5-2 dB, wide Q |
| Boxiness | 400-600 Hz | Cut 0.5-1 dB |
| Harshness | 2-4 kHz | Cut 0.5-1 dB or dynamic EQ |
| Dullness | 8-12 kHz | Boost 0.5-2 dB, shelf |
| Lacking air | 12-16 kHz | Boost 0.5-1.5 dB, shelf |
| Thin low end | 60-100 Hz | Boost 0.5-2 dB, shelf |

### Mid-Side EQ
- **Mid**: Center content (vocals, kick, bass, snare)
- **Side**: Stereo content (guitars, synths, reverb)

Common technique:
```
- HPF on sides (200-300 Hz) - Tighten low end
- Boost highs on sides (8-12 kHz) - Widen sound
- Cut mud on mids (300 Hz) - Clean center
```

## Compression in Mastering

### Bus Compression Settings
```
Ratio: 2:1 to 4:1 (typically 2:1)
Attack: 10-30 ms (let transients through)
Release: Auto or 100-300 ms
Gain Reduction: 1-3 dB MAX
Knee: Soft
```

### Multiband Compression
Split into 3-4 bands:
```
Band 1: 20-200 Hz (bass control)
Band 2: 200-2000 Hz (midrange body)
Band 3: 2000-8000 Hz (presence)
Band 4: 8000-20000 Hz (air)
```

Use gentle ratios (1.5:1 to 3:1) and minimal gain reduction.

## Limiting

### Key Parameters

**Ceiling/Output**
- Set to -1 dBTP (true peak) for streaming
- Prevents inter-sample peaks

**Threshold/Input**
- Lower = more limiting/loudness
- Start at 0, gradually lower
- Watch for distortion

**Release**
- Auto is usually best
- Fast can cause distortion
- Slow can cause pumping

### How Much Limiting?

| Genre | Typical GR | Notes |
|-------|-----------|-------|
| Jazz/Classical | 0-2 dB | Preserve dynamics |
| Acoustic/Folk | 1-3 dB | Natural sound |
| Rock | 2-4 dB | Moderate loudness |
| Pop | 3-5 dB | Competitive loudness |
| EDM/Hip-Hop | 4-8 dB | Loud and punchy |
| Metal | 3-6 dB | Dense but not crushed |

## Stereo Enhancement

### Width Techniques
- **M/S Processing** - Boost sides for width
- **Stereo wideners** - Use sparingly
- **High frequency spread** - Widen highs only

### Mono Compatibility
Always check in mono! If it falls apart:
- Too much stereo processing
- Phase issues in mix
- Over-widened low end

### Keep Low End Centered
- HPF on side channel (below 150-200 Hz)
- Bass should be mono for power and compatibility

## Metering

### Essential Meters

**LUFS Meter** (Loudness Units Full Scale)
- Integrated: Overall loudness (most important)
- Short-term: ~3 second window
- Momentary: ~400 ms window

**True Peak Meter**
- Shows inter-sample peaks
- Target: -1 dBTP or lower

**Spectrum Analyzer**
- Visual frequency balance
- Compare to references

**Stereo Correlation**
- +1 = Mono
- 0 = Wide stereo
- Negative = Phase issues (bad)

## Dithering

Apply when reducing bit depth (e.g., 24-bit to 16-bit for CD).

- Use on final export only
- Types: TPDF (transparent), noise-shaped (psychoacoustic)
- Don't double-dither

## Mastering Checklist

### Before Starting
- [ ] Mix is final (no more changes)
- [ ] Headroom: -3 to -6 dBFS peak
- [ ] No limiter on mix bus
- [ ] Reference tracks ready
- [ ] Fresh ears (take breaks)

### During Mastering
- [ ] A/B with reference constantly
- [ ] Check in mono
- [ ] Listen at multiple volumes
- [ ] Check on different systems

### Before Export
- [ ] Correct bit depth and sample rate
- [ ] Dithering applied (if needed)
- [ ] True peak under -1 dBTP
- [ ] LUFS matches target platform
- [ ] No clipping or distortion
- [ ] Metadata added

## Common Mistakes

1. **Over-limiting** - Kills dynamics, causes distortion
2. **Too much EQ** - Drastic changes indicate mix problems
3. **Ignoring reference tracks** - Lose perspective
4. **Mastering fatigued** - Take breaks every 20-30 min
5. **Fix mixing problems in mastering** - Send back to mix instead
6. **One setting fits all** - Each song is different
7. **Loudness war** - Louder ≠ better

## Quick Reference: Loudness

| LUFS | Perception | Genre Example |
|------|------------|---------------|
| -20 to -16 | Quiet, dynamic | Classical, acoustic |
| -14 to -12 | Moderate | Streaming optimized |
| -10 to -8 | Loud | Modern pop, rock |
| -6 or louder | Very loud | EDM drops, compressed |

## Reaper Mastering Plugins

- **ReaEQ** - Parametric EQ
- **ReaXcomp** - Multiband compressor
- **ReaComp** - Bus compression
- **ReaLimit** - Brickwall limiter
- **JS: Loudness Meter** - LUFS metering

## Free Plugin Recommendations

- **Youlean Loudness Meter** - Excellent LUFS meter (free)
- **TDR Kotelnikov** - Mastering compressor (free)
- **TDR Nova** - Dynamic EQ (free)
- **Limiter No6** - Multi-stage limiter (free)
- **SPAN** - Spectrum analyzer (free)

## References
- iZotope: Audio Mastering guides
- Sound On Sound: Mastering tutorials
- Mastering The Mix: Loudness guides
