# Keyboard & Synthesizer Knowledge Base

## Keyboard Types

### Digital Piano / Stage Piano
```
Characteristics:
├── Weighted keys (hammer action)
├── Built-in piano sounds
├── Stereo audio output
├── Often MIDI output too
├── 88 keys typically
└── Designed for realistic piano feel

Examples: Nord Stage, Yamaha CP, Roland RD
Output: Line level stereo (TRS or XLR)
Recording: Direct stereo recording
```

### Synthesizer (Analog/Digital)
```
Characteristics:
├── Various key actions (synth, semi-weighted)
├── Sound generation (oscillators, samples)
├── Extensive sound design options
├── Mono or stereo output
├── MIDI capable
└── 49-88 keys typically

Examples: Moog, Korg, Roland, Arturia
Output: Line level (often mono or stereo)
Recording: Direct + MIDI for flexibility
```

### MIDI Controller
```
Characteristics:
├── No built-in sounds
├── Requires computer/DAW
├── Various key counts (25-88)
├── Pads, knobs, faders often included
├── USB or 5-pin MIDI
└── Lightweight, portable

Examples: Akai MPK, Novation Launchkey, Arturia KeyLab
Output: MIDI only (USB or 5-pin)
Recording: MIDI to VSTi, then audio
```

### Workstation
```
Characteristics:
├── All-in-one production tool
├── Built-in sequencer
├── Extensive sound library
├── Audio + MIDI outputs
├── Often weighted keys
└── Can work standalone

Examples: Korg Kronos, Yamaha Montage, Roland Fantom
Output: Multiple audio + MIDI
Recording: Audio direct or MIDI to DAW
```

## Recording Methods

### Method 1: Direct Audio Recording (Stereo)
```
Best for: Built-in sounds, synths with good converters

Setup:
Keyboard Stereo Out → Interface Line In (L/R) → REAPER Stereo Track

REAPER:
1. Create stereo track
2. Input: Interface inputs (e.g., In 3/4)
3. Gain staging: -12dB peaks
4. Record!

Pros: Captures exact sound, simple
Cons: Can't change notes after recording
```

### Method 2: MIDI Recording (VSTi)
```
Best for: MIDI controllers, flexibility needed

Setup:
Controller MIDI Out → Interface MIDI In → REAPER → VSTi

REAPER:
1. Create track with VSTi instrument
2. Input: MIDI device
3. Arm track for MIDI recording
4. Play and record MIDI data
5. Audio rendered from VSTi

Pros: Edit notes, change sounds anytime
Cons: Dependent on VSTi quality
```

### Method 3: Audio + MIDI Simultaneously
```
Best for: Maximum flexibility, professional workflow

Setup:
1. Keyboard audio → Interface → REAPER Audio Track
2. Keyboard MIDI → Interface → REAPER MIDI Track (same VSTi)

Workflow:
├── Record audio for "safe" capture
├── Record MIDI for editing ability
├── Use audio if performance was perfect
├── Use MIDI if edits needed
└── Can blend both
```

### Method 4: External Synth via MIDI
```
Best for: Hardware synths controlled from DAW

Setup:
1. REAPER MIDI track → Interface MIDI Out → Synth MIDI In
2. Synth Audio Out → Interface Line In → REAPER Audio Track

Workflow:
1. Write MIDI in REAPER
2. MIDI triggers external synth
3. Record synth audio back
4. Now MIDI drives hardware!
```

## Gain Staging for Keyboards

### Line Level Outputs
```
Most keyboards output at line level (+4dBu or -10dBV)
Interface Setting: Use LINE inputs, not Hi-Z
Gain: Usually minimal (10 o'clock or less)
Target: -12 to -6dB peaks in REAPER
```

### Output Level Comparison
| Output Type | Level | Interface Input |
|------------|-------|-----------------|
| Professional synth | +4dBu | Line (TRS) |
| Consumer keyboard | -10dBV | Line (TRS) |
| Headphone out | Variable | Line (careful!) |
| MIDI controller | N/A (MIDI only) | MIDI/USB |

### Avoiding Problems
```
Too Hot (Clipping):
├── Reduce keyboard master volume
├── Use interface pad if available
├── Check for "output level" setting in synth

Too Quiet:
├── Increase keyboard master volume
├── Check interface is on LINE not HI-Z
├── Add gain in interface preamp
```

## Popular VSTi Instruments

### Piano
```
Free:
├── Piano One (Steinway samples)
├── Keyzone Classic (multi-piano)
├── Spitfire LABS (various pianos)
└── Ivy Audio Piano in 162

Paid:
├── Keyscape (industry standard)
├── Pianoteq (modeled, light CPU)
├── Addictive Keys
└── Native Instruments pianos
```

### Synthesizers
```
Free:
├── Vital (wavetable, excellent)
├── Dexed (DX7 emulation)
├── Surge (powerful hybrid)
├── Synth1 (classic subtractive)
└── OB-Xd (Oberheim style)

Paid:
├── Serum (wavetable standard)
├── Omnisphere (massive library)
├── Arturia V Collection
└── u-he Diva, Zebra
```

### Orchestral/Strings
```
Free:
├── Spitfire LABS (excellent!)
├── VSCO2 Community Orchestra
├── DSK Overture
└── Sonatina Orchestra

Paid:
├── Spitfire Symphonic Orchestra
├── EastWest Hollywood Series
├── Native Instruments Symphony Series
└── Cinematic Studio Series
```

## MIDI Recording in REAPER

### Setting Up MIDI Track
```
1. Insert → Track (Ctrl+T)
2. Click FX button → Add VSTi (e.g., Vital)
3. Track input → MIDI Device → Your controller
4. Arm track (R on track)
5. Record!
```

### MIDI Editing
```
After recording:
├── Double-click item → Piano roll
├── Edit notes, velocities, timing
├── Quantize if needed (Q key)
├── Add CC data (modwheel, expression)
└── Split, move, copy as needed
```

### Latency with VSTi
```
Problem: VSTi processing adds latency
Solutions:
├── Lower buffer (64-128 samples)
├── Use "Anticipative FX processing"
├── Freeze heavy VSTi tracks
└── Use lightweight VSTi for tracking
```

## Specific Recording Scenarios

### Recording Piano Performance
```
If keyboard has good piano sounds:
1. Record stereo audio directly
2. Add subtle room reverb in mix
3. Minimal processing needed

If using MIDI controller + VSTi:
1. Choose quality piano VSTi
2. Record MIDI
3. Enable sustain pedal CC
4. Add room/hall reverb
```

### Recording Synth Pads
```
Stereo width is key:
1. Record in stereo (L/R)
2. Check phase (mono compatibility)
3. May need stereo width control
4. Light compression for consistency
```

### Recording Synth Leads
```
Often mono is fine:
1. Can record mono
2. Add stereo effects later (delay, chorus)
3. Watch for harsh frequencies (2-4kHz)
4. May need de-essing type processing
```

## AI-Ohjeistus Koskettimien Äänitykseen

Kun käyttäjä mainitsee koskettimen/syntetisaattorin:

1. **Tunnista tyyppi** → piano, synth, MIDI controller?
2. **Audio vai MIDI** → suosittele molempien nauhoitusta jos mahdollista
3. **Stereo vai mono** → useimmat koskettimet stereo
4. **Line vs Hi-Z** → AINA Line-sisääntulo keyboardeille
5. **VSTi** → jos MIDI controller, ehdota sopivia instrumentteja

Kysymyksiä käyttäjälle:
- "Onko koskettimessasi omat äänet vai tarvitsetko VSTi-instrumentin?"
- "Haluatko nauhoittaa audion, MIDIn vai molemmat?"
- "Mitä soundeja tarvitset - piano, synth, pad?"
