# Reverb and Delay Guide

## Reverb Fundamentals

Reverb simulates acoustic spaces by adding reflections. Key components:
- **Early reflections** - First bounces, define room size
- **Tail/decay** - Sustained reverberations
- **Pre-delay** - Gap before reverb starts

## Reverb Parameters

### Decay Time (RT60)
Time for reverb to decay by 60 dB.
| Setting | Space Type | Use Case |
|---------|------------|----------|
| 0.3-0.8s | Small room | Drums, guitars, intimate |
| 0.8-1.5s | Medium room | Vocals, general purpose |
| 1.5-3s | Large hall | Orchestral, cinematic |
| 3s+ | Cathedral | Special effects, ambient |

### Pre-Delay
Gap between dry signal and reverb onset.
- **0-20 ms** - Sounds attached to source
- **20-50 ms** - Natural separation
- **50-100 ms** - Clear distinction, keeps vocals forward
- **Rule of thumb**: Sync to tempo (1/64 or 1/32 note)

### Damping
Controls high frequency decay.
- **Low damping** - Bright, airy reverb
- **High damping** - Dark, warm, vintage

### Room Size
Affects early reflection timing.
- **Small** - Tight, focused
- **Large** - Spacious, distant

### Mix/Wet-Dry
Amount of reverb in signal.
- On sends: 100% wet
- On inserts: Adjust to taste (typically 10-30%)

## Reverb Types

### Room
- **Character**: Natural, small spaces
- **Best for**: Drums, guitars, natural sound
- **Decay**: 0.3-1s

### Plate
- **Character**: Dense, smooth, bright
- **Best for**: Vocals, snare, ethereal sounds
- **Decay**: 1-3s

### Hall
- **Character**: Large, spacious, grand
- **Best for**: Orchestral, cinematic, ballads
- **Decay**: 1.5-4s

### Chamber
- **Character**: Warm, musical, dense
- **Best for**: Vocals, strings, classic sound
- **Decay**: 0.8-2s

### Spring
- **Character**: Boingy, vintage, lo-fi
- **Best for**: Guitar amps, vintage vibes
- **Decay**: 1-3s

### Convolution
- **Character**: Realistic, sampled spaces
- **Best for**: Film scoring, realistic ambience
- Uses impulse responses of real spaces

## Delay Fundamentals

Delay repeats the signal after a set time. Creates rhythm, depth, and width.

## Delay Parameters

### Delay Time
- **Sync to tempo** - Musical, rhythmic
- **Free time** - Creates movement, avoids static sound

### Common Sync Values
| Value | Feel | Use |
|-------|------|-----|
| 1/4 | Strong, on beat | Most common |
| 1/8 | Faster, energetic | Guitars, vocals |
| 1/16 | Rapid, textural | Synths, special FX |
| Dotted 1/8 | Bouncy, U2-style | Guitars, epic sound |
| Triplet | Swing feel | Jazz, soul |

### Feedback
Number of repeats.
- **0-20%** - Single slap, subtle
- **20-50%** - Natural echo
- **50-80%** - Pronounced, rhythmic
- **80%+** - Self-oscillation, special FX

### High/Low Cut
EQ on delay repeats.
- **High cut** - Dark, vintage, sits back in mix
- **Low cut** - Clean, clear, prevents mud

### Modulation
Adds pitch variation to delays.
- Creates warmer, analog-like sound
- Prevents static, mechanical feel

## Delay Types

### Digital
- **Character**: Clean, precise
- **Best for**: Modern production, clarity

### Tape
- **Character**: Warm, wobbly, degraded
- **Best for**: Vintage sounds, warmth

### Analog (BBD)
- **Character**: Dark, lo-fi, colored
- **Best for**: Guitars, vintage vibes

### Ping-Pong
- **Character**: Bounces left-right
- **Best for**: Wide stereo effects, synths

### Multi-tap
- **Character**: Multiple delay times
- **Best for**: Complex rhythms, textures

## Reverb Settings by Genre

### Rock/Metal
```
Type: Room or small plate
Decay: 0.5-1.2s
Pre-delay: 20-40 ms
Mix: 10-20%
Notes: Keep it tight, don't wash out aggression
```

### Pop
```
Type: Plate or medium hall
Decay: 1-2s
Pre-delay: 30-60 ms
Mix: 15-30%
Notes: Smooth, supportive, vocal-forward
```

### EDM/Electronic
```
Type: Plate, hall (automated)
Decay: Variable, often sidechained
Pre-delay: Sync to tempo
Mix: Heavy on builds, light on drops
Notes: Use automation, sidechain to kick
```

### Jazz
```
Type: Room, chamber
Decay: 0.8-1.5s
Pre-delay: 10-30 ms
Mix: 15-25%
Notes: Natural, intimate, not artificial
```

### Orchestral/Cinematic
```
Type: Hall, convolution
Decay: 2-4s
Pre-delay: 20-50 ms
Mix: 20-40%
Notes: Grand, spacious, realistic
```

### Hip-Hop/Rap
```
Type: Plate, room
Decay: 0.5-1.5s (vocals), short (drums)
Pre-delay: 30-60 ms
Mix: 10-20%
Notes: Keep vocals present, drums tight
```

## Advanced Techniques

### Reverb on Send (Standard)
```
1. Create aux/bus track with reverb
2. Set reverb to 100% wet
3. Send from source tracks
4. Adjust send level per track
Benefits: CPU efficient, consistent space
```

### Gated Reverb
```
1. Apply reverb with long decay
2. Add gate after reverb
3. Set gate threshold to cut tail
Use: 80s drums, explosive snare
```

### Reverse Reverb
```
1. Reverse audio clip
2. Add reverb, bounce/render
3. Reverse the result
4. Align with original
Use: Vocal swells, transitions, FX
```

### Ducking Reverb/Delay
```
1. Sidechain compressor on reverb return
2. Trigger from dry vocal/source
3. Reverb ducks when source plays
Use: Keep source clear, reverb fills gaps
```

### Delay into Reverb
```
1. Send source to delay
2. Send delay to reverb
3. Adjust blend
Use: Complex depth, ambient textures
```

### Tempo-Synced Pre-Delay
```
Pre-delay = 60000 / BPM / subdivision
Example: 120 BPM, 1/16 note = 60000/120/4 = 125 ms
```

## Common Mistakes

1. **Too much reverb** - Muddy, distant mix
2. **Same reverb on everything** - Unnatural, flat
3. **Ignoring pre-delay** - Source gets lost
4. **Forgetting EQ** - Reverb clutters low end
5. **Not tempo-syncing delay** - Sounds off-rhythm

## Pro Tips

1. **HPF your reverb sends** (200-400 Hz) - Prevents mud
2. **Use multiple reverbs** - Short for glue, long for depth
3. **Automate reverb** - More on verses, less on choruses
4. **Sidechain big reverbs** - Keeps mix punchy
5. **Reference your space** - Check on multiple systems

## Reaper Reverb/Delay Plugins

- **ReaVerbate** - Simple reverb (free with Reaper)
- **ReaVerb** - Convolution reverb with impulse responses
- **ReaDelay** - Versatile delay with modulation
- **JS: Convolution Reverb** - Lightweight convolution

## Free Plugin Recommendations

### Reverb
- **Valhalla Supermassive** - Massive ambient reverbs (free)
- **OrilRiver** - Algorithmic reverb
- **Dragonfly Reverb** - Quality hall/room/plate

### Delay
- **Valhalla Freq Echo** - Analog-style delay (free)
- **Kilohearts Delay** - Clean digital delay

## References
- Sound On Sound: Reverb and delay tutorials
- iZotope: Space and depth guides
- Valhalla DSP: Reverb design articles
