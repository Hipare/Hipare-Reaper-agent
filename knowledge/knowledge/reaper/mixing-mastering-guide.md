# Mixing and Mastering Guide for REAPER

## The Mixing Process

### What is Mixing?

Mixing is the art and science of combining multiple audio tracks into a cohesive stereo (or surround) mix. Goals include:
- Balance between instruments
- Clarity and separation
- Depth and width (3D space)
- Emotional impact
- Translation across systems

### Mixing Signal Flow in REAPER
```
Source Track → Track FX Chain → Track Volume/Pan → 
    → Sends (to FX buses)
    → Folder/Parent (if applicable)
    → Master Track → Master FX → Output
```

## Preparation for Mixing

### Session Setup

**Before Mixing:**
1. Organize tracks (drums, bass, guitars, vocals, etc.)
2. Color code track groups
3. Create folder tracks
4. Set up routing (FX buses)
5. Check phase relationships
6. Remove silence/noise
7. Commit to rough arrangement

### Template Creation

**Create a mixing template with:**
```
Folders:
├── DRUMS
│   ├── Kick
│   ├── Snare
│   ├── Toms
│   ├── OH
│   └── Room
├── BASS
├── GUITARS
├── KEYS/SYNTHS
├── VOCALS
│   ├── Lead
│   ├── Doubles
│   └── Harmonies
├── FX RETURNS
│   ├── Reverb Short
│   ├── Reverb Long
│   ├── Delay
│   └── Parallel Comp
└── BUSES
    ├── Drum Bus
    ├── Instrument Bus
    └── Vocal Bus
```

### Gain Staging

**Set Initial Levels:**
1. Pull all faders down
2. Start with drums (kick, snare)
3. Add bass
4. Bring in instruments one by one
5. Add vocals last
6. Target: Master peaks around -6 dBFS

**Gain Staging Rule:**
- Each track: peaks around -18 to -12 dBFS into plugins
- Buses: peaks around -12 to -6 dBFS
- Master: peaks around -6 to -3 dBFS before limiting

## EQ (Equalization)

### EQ Purpose

1. **Corrective:** Fix problems
2. **Creative:** Shape tone
3. **Separation:** Create space for each element

### Frequency Reference Chart

| Range | Frequencies | Description |
|-------|-------------|-------------|
| Sub-bass | 20-60 Hz | Feel more than hear |
| Bass | 60-250 Hz | Warmth, body, thump |
| Low-mids | 250-500 Hz | Mud, boxiness |
| Midrange | 500-2000 Hz | Body, presence |
| Upper-mids | 2-4 kHz | Presence, bite |
| Presence | 4-6 kHz | Clarity, attack |
| Brilliance | 6-10 kHz | Air, sparkle |
| Air | 10-20 kHz | Shimmer, openness |

### Common EQ Moves

**Kick Drum:**
```
HPF: 30-40 Hz (remove sub rumble)
Cut: 300-400 Hz (boxiness)
Boost: 60-80 Hz (sub/thump)
Boost: 2-5 kHz (click/attack)
```

**Snare:**
```
HPF: 80-100 Hz
Boost: 150-200 Hz (body)
Cut: 400-600 Hz (boxiness)
Boost: 3-5 kHz (snap/crack)
Boost: 8-10 kHz (air/wires)
```

**Bass:**
```
HPF: 30-40 Hz
Cut: 200-400 Hz (mud)
Boost: 60-80 Hz (sub, if needed)
Boost: 700-1000 Hz (definition)
```

**Electric Guitar:**
```
HPF: 80-100 Hz
Cut: 200-400 Hz (mud, if present)
Shape: 1-3 kHz (body)
Boost: 3-5 kHz (presence)
Cut: 8-12 kHz (fizz, if harsh)
```

**Vocals:**
```
HPF: 80-120 Hz
Cut: 200-400 Hz (mud)
Boost: 2-4 kHz (presence/clarity)
Cut: 5-8 kHz (de-ess if needed)
Boost: 10-12 kHz (air)
```

### ReaEQ Usage

**Adding ReaEQ:**
1. Select track
2. Press F (FX window)
3. Add ReaEQ

**Basic Operation:**
- Click to add band
- Drag horizontally = frequency
- Drag vertically = gain
- Scroll wheel = Q/bandwidth
- Right-click for band type (HPF, LPF, shelf, etc.)

**Band Types:**
- **HPF/LPF:** High/low pass filters
- **Band:** Bell curve
- **Low Shelf:** Boost/cut all below
- **High Shelf:** Boost/cut all above
- **Notch:** Narrow cut

## Compression

### What Compression Does

1. Reduces dynamic range
2. Controls transients
3. Adds punch and sustain
4. Glues elements together
5. Shapes tone

### Compression Parameters

| Parameter | Function |
|-----------|----------|
| Threshold | Level where compression starts |
| Ratio | How much compression (2:1, 4:1, etc.) |
| Attack | How fast compression engages |
| Release | How fast compression lets go |
| Makeup Gain | Compensate for volume reduction |
| Knee | Hard or soft onset |

### Attack and Release Guide

**Fast Attack (0-10 ms):**
- Catches transients
- More control
- Can sound squashed

**Slow Attack (20-100+ ms):**
- Lets transients through
- More punch
- Natural sound

**Fast Release (50-100 ms):**
- More aggressive
- Pumping effect
- Rhythmic

**Slow Release (200-500+ ms):**
- Smoother
- More natural
- Less obvious

### Compression Settings by Source

**Vocals:**
```
Ratio: 3:1 - 4:1
Attack: 10-30 ms
Release: Auto or 100-200 ms
GR: 4-8 dB
Goal: Even, controlled dynamics
```

**Drums (individual):**
```
Kick:
- Ratio: 4:1
- Attack: 20-40 ms (let click through)
- Release: Fast (150-200 ms)

Snare:
- Ratio: 4:1
- Attack: 10-30 ms
- Release: 100-200 ms
```

**Drum Bus:**
```
Ratio: 2:1 - 4:1
Attack: 30-50 ms (preserve punch)
Release: Auto or tempo-matched
GR: 2-4 dB
Goal: Glue, cohesion
```

**Bass:**
```
Ratio: 4:1 - 6:1
Attack: 20-50 ms
Release: 100-200 ms
GR: 4-8 dB
Goal: Even level, controlled
```

**Mix Bus:**
```
Ratio: 2:1
Attack: Slow (30-50 ms)
Release: Auto
GR: 1-3 dB
Goal: Subtle glue
```

### ReaComp Usage

**Key Controls:**
- Threshold slider
- Ratio slider
- Attack/Release knobs
- Wet slider (for parallel)
- Auto release checkbox
- RMS mode (smoother detection)

**Sidechain in ReaComp:**
1. Create send from trigger track
2. In ReaComp, set "Detector input" to aux
3. Compressor reacts to send signal

### Parallel Compression

**Setup Method 1 (Track Duplicate):**
1. Duplicate track
2. Heavy compression on copy
3. Blend both

**Setup Method 2 (Bus Send):**
1. Create parallel bus
2. Heavy compression on bus
3. Send source to bus
4. Blend with fader

**Setup Method 3 (Wet/Dry):**
1. Use ReaComp's Wet knob
2. Blend compressed with dry
3. Single plugin, simple

**Typical Settings:**
```
Ratio: 10:1 or higher
Attack: Fast (5-15 ms)
Release: Medium-fast
Heavy GR: 10-20 dB
Blend: To taste
```

## Reverb and Space

### Reverb Types

| Type | Characteristics | Use |
|------|-----------------|-----|
| Room | Small, tight | Drums, guitars |
| Hall | Large, diffuse | Vocals, orchestral |
| Plate | Bright, smooth | Vocals, snare |
| Chamber | Dense, warm | General purpose |
| Spring | Splashy, vintage | Guitar, retro |
| Convolution | Real space IRs | Film, realism |

### Reverb Parameters

**Key Controls:**
- **Decay/Time:** How long reverb lasts
- **Pre-delay:** Gap before reverb
- **Damping:** High frequency absorption
- **Size:** Perception of room size
- **Wet/Dry:** Mix ratio

### Reverb Usage Guidelines

**Vocals:**
```
Type: Plate or hall
Decay: 1.2-2s
Pre-delay: 30-60 ms
Amount: Medium (vocal present but with space)
```

**Snare:**
```
Type: Plate or room
Decay: 0.8-1.5s
Pre-delay: 20-40 ms
Amount: Light-medium
```

**General Reverb Strategy:**
1. One main reverb for cohesion
2. Short reverb for drums/percussion
3. Long reverb for vocals/leads
4. Pre-delay keeps source present

### FX Bus Setup (Reverb)

**Create Reverb Bus:**
1. Insert new track: "Reverb"
2. Add ReaVerbate or reverb plugin
3. Set 100% wet
4. Route: No direct output (only receives sends)

**Send to Reverb:**
1. On source track, add send
2. Route to Reverb bus
3. Adjust send level

## Delay

### Delay Types

| Type | Description |
|------|-------------|
| Slapback | Single repeat, 50-150ms |
| Stereo | Different L/R times |
| Ping-pong | Bounces L-R-L-R |
| Tape | Warm, degraded repeats |
| Digital | Clean, precise |

### Delay Settings

**Tempo-Synced Values:**
```
120 BPM:
1/4 note = 500ms
1/8 note = 250ms
Dotted 1/8 = 375ms
1/16 note = 125ms
```

**Common Uses:**
- **Vocals:** 1/4 or 1/8 note, low feedback
- **Guitar:** Dotted 1/8 (U2 style)
- **Slapback:** 80-150ms, single repeat

### ReaDelay Usage

**Basic Setup:**
1. Add ReaDelay to track or FX bus
2. Set length (ms or musical)
3. Adjust feedback (repeats)
4. Filter high end for warmth
5. Set wet/dry mix

## Panning and Stereo Image

### Panning Guidelines

**Keep Centered:**
- Kick
- Snare
- Bass
- Lead vocal
- Main hook/melody

**Pan Left/Right:**
- Drums (overheads, toms)
- Double-tracked guitars
- Background vocals
- Synth layers
- Percussion

### Stereo Width

**Creating Width:**
- Hard-pan doubles (L100/R100)
- Stereo delay
- Haas effect (careful!)
- Width plugins
- Reverb/delay returns panned

**Checking Width:**
- Listen in mono (check compatibility)
- Folding to mono shouldn't lose elements
- Phase issues = disappearing in mono

### LCR Panning

**Simple Approach:**
- Pan hard left, center, or hard right
- Creates clear, punchy mix
- Avoids muddy middle ground

## Automation

### What to Automate

**Common Automation:**
- Volume rides (vocal phrases)
- Mutes (removing noise)
- FX sends (more reverb on chorus)
- Pan moves
- Filter sweeps
- Plugin parameters

### Creating Automation in REAPER

**Show Envelope:**
1. Select track
2. Press V (show envelope)
3. Choose parameter

**Drawing Automation:**
1. Use pencil tool
2. Click to create points
3. Drag points to adjust
4. Right-click for options

**Recording Automation:**
1. Set track to Write mode
2. Play and move controls
3. Automation recorded
4. Switch to Read mode

### Automation Modes

| Mode | Behavior |
|------|----------|
| Trim/Read | Plays existing, can adjust |
| Read | Plays existing, ignores input |
| Touch | Records while touching controls |
| Latch | Records until stop |
| Write | Overwrites everything |

### Common Automation Tasks

**Vocal Rides:**
- Automate volume for consistent level
- Bring up quiet phrases
- Reduce loud moments
- Subtle is key

**Build-ups:**
- Filter sweep (low to high)
- Volume increase
- Reverb send increase
- Effect parameters

## Mix Bus Processing

### Typical Mix Bus Chain

```
1. EQ (subtle shaping)
2. Compression (glue)
3. Saturation (warmth, optional)
4. Limiter (final stage, careful!)
```

### Mix Bus EQ

**Conservative Moves:**
- High shelf: +1-2 dB @ 10 kHz (air)
- Low shelf: +1 dB @ 100 Hz (weight)
- Cut: 200-300 Hz if muddy

### Mix Bus Compression

```
Ratio: 2:1 (subtle)
Attack: 30-50 ms (preserve transients)
Release: Auto or 100-200 ms
GR: 1-3 dB maximum
Goal: Glue, not squash
```

### Saturation

**Purpose:**
- Adds harmonic content
- Warmth and color
- Glues mix together

**Usage:**
- Subtle! 
- Too much = distortion
- Tape or tube emulation

---

# Mastering

## What is Mastering?

The final step before distribution:
- Optimize overall sound
- Ensure translation
- Match loudness standards
- Prepare for distribution formats

## Mastering Signal Chain

```
Mix → EQ → Compression → Saturation → Stereo Width → Limiter → Dithering
```

### Mastering EQ

**Goals:**
- Fix broad tonal issues
- Enhance overall balance
- Match references

**Moves:**
- Small adjustments (1-2 dB)
- Broad curves (low Q)
- High shelf for air
- Low shelf for weight

### Mastering Compression

```
Ratio: 1.5:1 - 2:1 (very gentle)
Attack: Slow (30-100 ms)
Release: Auto or slow
GR: 1-2 dB
Goal: Barely audible
```

### Mastering Limiter

**Purpose:**
- Increase loudness
- Prevent clipping
- Set final ceiling

**Settings:**
```
Ceiling: -1 dBTP (streaming) or -0.3 dBTP (CD)
Attack: Auto or fast
Release: Auto or medium
Input gain: Adjust for target loudness
```

### ReaLimit Usage

1. Add ReaLimit to master
2. Set ceiling (-1 dBTP typical)
3. Increase input gain until desired loudness
4. Watch gain reduction (less is more)

## Loudness Standards

### Target Levels by Platform

| Platform | Integrated LUFS | True Peak |
|----------|-----------------|-----------|
| Spotify | -14 LUFS | -1 dBTP |
| Apple Music | -16 LUFS | -1 dBTP |
| YouTube | -14 LUFS | -1 dBTP |
| Amazon Music | -14 LUFS | -2 dBTP |
| CD/Vinyl | -9 to -12 LUFS | -0.3 dBTP |
| Broadcast (EU) | -23 LUFS | -1 dBTP |

### Why Loudness Matters

**Streaming platforms normalize:**
- Loud masters turned DOWN
- Quiet masters turned UP
- No advantage to crushing

**Benefits of Dynamic Master:**
- Better sound quality
- More emotional impact
- Not fatiguing
- Future-proof

### Measuring Loudness in REAPER

**Add Loudness Meter:**
1. Add JS: Loudness Meter
2. Or: SWS Extension → Loudness
3. Monitor: Integrated LUFS, True Peak

## Rendering/Exporting

### Render Dialog (Ctrl+Alt+R)

**Source Options:**
- Master mix
- Selected tracks (stems)
- Region matrix
- Selected media items

**Bounds:**
- Entire project
- Time selection
- Custom time range

### Format Guidelines

**Master File:**
```
Format: WAV
Bit depth: 24-bit or 32-bit float
Sample rate: Project rate (44.1/48/96 kHz)
```

**Distribution:**
```
Streaming: WAV 16-bit 44.1kHz or high-quality MP3/AAC
CD: WAV 16-bit 44.1kHz
Archive: WAV 24-bit, project sample rate
```

### Dithering

**When to Dither:**
- Reducing bit depth (24 → 16)
- Final export only
- Apply at END of chain

**REAPER Dithering:**
- In render dialog: "Dither/noise shaping"
- Choose type (noise shaping recommended)

### Rendering Stems

**For Backup/Remix:**
1. Source: Selected tracks or Stems
2. Create separate files per track
3. 24-bit WAV, project sample rate
4. Include dry and FX versions

## Quality Control Checklist

### Before Finalizing

**Technical:**
```
□ No clipping
□ Appropriate loudness
□ Proper format/bit depth
□ Fade in/out at boundaries
□ No DC offset
□ Correct metadata
```

**Artistic:**
```
□ Balanced frequency spectrum
□ Good stereo image
□ Dynamics appropriate for genre
□ Translates on multiple systems
□ Compared to references
```

### Testing Playback

**Check on:**
- Studio monitors
- Headphones
- Car speakers
- Phone speaker
- Laptop speakers
- Consumer earbuds

**Listen for:**
- Bass balance
- Vocal clarity
- Harshness
- Overall balance

## Common Mixing Mistakes

1. **Over-processing:** Less is more
2. **Solo mixing:** Always check in context
3. **Ignoring phase:** Check mono compatibility
4. **Too loud too early:** Leave headroom
5. **Forgetting references:** Compare to pros
6. **Ear fatigue:** Take breaks!
7. **Room issues:** Trust calibrated monitors
8. **Over-compression:** Preserve dynamics
