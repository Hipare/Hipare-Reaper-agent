# Guitarist Sounds - Free VST Recreation Guide

## Overview

This guide provides detailed sound recreation for famous guitarists using FREE VST plugins. Each entry includes signal chain, settings, and REAPER-specific tips.

---

## David Gilmour (Pink Floyd)

### Signature Sound
- Smooth, singing sustain
- Long, modulated delays
- Warm, clean-to-edge-of-breakup tones
- Expressive vibrato and bends

### Original Gear
- Fender Stratocaster (neck/middle pickups)
- Hiwatt amps, Fender Twin
- Big Muff fuzz, delay units

### Free VST Chain
```
Guitar → Amp Sim → Modulation → Delay → Reverb

1. Ignite Amps Emissary (Clean/Crunch channel, gain LOW)
   OR: LePou HyBrit (Fender-ish clean)
2. TAL-Chorus-LX (subtle chorus, rate 0.3, depth 40%)
3. Valhalla Supermassive (delay mode)
   - Time: 500-600ms (tempo sync)
   - Feedback: 40-50%
   - Mix: 25-35%
4. Dragonfly Hall Reverb
   - Decay: 2.5-3s
   - Mix: 20%
```

### REAPER FX Chain
```
ReaEQ:
- HPF at 80 Hz
- Cut 400 Hz by -2 dB (remove mud)
- Boost 2-3 kHz by +2 dB (presence)
- Boost 8-10 kHz by +1 dB (air)

ReaComp:
- Ratio: 3:1
- Attack: 30 ms
- Release: 200 ms
- Threshold: -20 dB (gentle)
```

### Tips
- Use neck or middle pickup position
- Play behind the beat for that "floating" feel
- Vibrato should be wide and slow
- Key songs: "Comfortably Numb", "Shine On You Crazy Diamond"

---

## The Edge (U2)

### Signature Sound
- Dotted eighth note delays
- Chiming, clean tones
- Layered guitar textures
- Minimal distortion, maximum atmosphere

### Original Gear
- Gibson Explorer, Fender Stratocaster
- Vox AC30
- Korg SDD-3000 delay, Memory Man

### Free VST Chain
```
1. Ignite Amps Emissary (clean channel)
   OR: AmpliTube Free (AC30 model)
2. ReaDelay (CRITICAL for Edge sound)
   - Dotted 1/8 note (e.g., 375ms at 120 BPM)
   - Feedback: 45-55%
   - High cut on repeats: 6 kHz
3. TAL-Chorus-LX (very subtle)
4. Valhalla Supermassive
   - Mode: Hall
   - Decay: 3-4s
   - Mix: 15-25%
```

### Dotted Eighth Calculator
```
Delay time (ms) = (60000 / BPM) * 0.75

120 BPM = 375 ms
130 BPM = 346 ms
140 BPM = 321 ms
```

### REAPER FX Chain
```
ReaEQ:
- HPF at 100 Hz
- Boost 1-2 kHz by +3 dB (chime)
- Boost 5-6 kHz by +2 dB (presence)
- Gentle high shelf boost at 10 kHz

ReaComp:
- Ratio: 2:1
- Attack: 50 ms (preserve pick attack)
- Very gentle, 1-2 dB GR
```

### Tips
- Delay is EVERYTHING - get the timing right
- Play staccato, let delay fill the space
- Use bridge pickup for chime
- Key songs: "Where The Streets Have No Name", "Pride"

---

## Tom Morello (Rage Against the Machine)

### Signature Sound
- DJ-like scratching effects
- Heavy, tight rhythm tones
- Kill switch techniques
- Whammy pedal madness

### Original Gear
- Custom guitars with kill switch
- Marshall JCM800
- DigiTech Whammy, MXR Phase 90

### Free VST Chain
```
1. LePou Legion (high gain Marshall-style)
   OR: Ignite Emissary (lead channel)
2. NadIR cab loader + Mesa IR
3. Pitchproof or MeldaProduction MPitchShift (for whammy)
4. TAL-Chorus-LX as phaser alternative

Rhythm tone:
- Gain: 60-70%
- Tight, no flub
```

### REAPER FX Chain
```
ReaEQ:
- HPF at 100 Hz (tight low end)
- Cut 200-300 Hz by -3 dB (remove flub)
- Boost 800 Hz by +2 dB (chunk)
- Boost 3-4 kHz by +2 dB (cut through)

ReaComp:
- Ratio: 4:1
- Attack: 10 ms (fast)
- Tight, controlled dynamics

JS: MIDI-controlled gate (for kill switch simulation)
```

### Tips
- Mute technique is crucial
- Practice toggle switch "scratching"
- Keep rhythm TIGHT, on the beat
- Key songs: "Killing In The Name", "Bulls On Parade"

---

## Eddie Van Halen

### Signature Sound
- "Brown Sound" - warm yet aggressive
- Two-handed tapping
- Phaser-laden rhythm
- Harmonics and dive bombs

### Original Gear
- Frankenstein guitar (custom)
- Marshall Plexi modified
- MXR Phase 90, Flanger

### Free VST Chain
```
1. LePou Lecto OR Ignite Emissary
   - Gain: 65-75%
   - Marshall-style voicing
2. NadIR with Greenback IR
3. Blue Cat's Phaser (free) or TAL-Chorus-LX (fake phaser)
   - Slow rate, subtle depth
4. OrilRiver reverb (room, short decay)
```

### REAPER FX Chain
```
ReaEQ:
- HPF at 80 Hz
- Slight cut at 400 Hz (-2 dB)
- Boost 1.5 kHz by +2 dB (midrange push)
- Presence boost at 4-5 kHz

NO heavy compression - dynamics are key
```

### Tips
- Single coil in bridge (or split humbucker)
- Volume knob rides for dynamics
- Tapping: clean attack, let notes ring
- Key songs: "Eruption", "Panama", "Ain't Talkin' 'Bout Love"

---

## Jimi Hendrix

### Signature Sound
- Fuzz-driven psychedelia
- Wah-wah as expressive tool
- Clean, warm Fender tones
- Univibe modulation

### Original Gear
- Fender Stratocaster (upside down, right-handed)
- Fender Twin, Marshall
- Fuzz Face, Univibe, Cry Baby

### Free VST Chain
```
1. Fuse Audio Labs F59 (Fender Bassman style) - FREE
   OR: LePou HyBrit
2. Analog Obsession BritPre (fuzz simulation)
3. Calf Wah (for wah-wah)
4. TAL-Chorus-LX (Univibe approximation)
   - Very slow rate
   - Depth 50-60%
```

### REAPER FX Chain
```
ReaEQ:
- Gentle roll-off above 8 kHz (vintage)
- Boost 800 Hz - 1 kHz (warmth)
- Cut 3-4 kHz slightly (reduce harshness)

Softube Saturation Knob:
- Add subtle saturation for warmth
```

### Tips
- Play with thumb over neck
- Aggressive pick attack
- Use all pickup positions
- Key songs: "Voodoo Child", "Little Wing", "Purple Haze"

---

## Brian May (Queen)

### Signature Sound
- Multi-layered guitar harmonies
- Bright, trebly AC30 tone
- Coin as pick (unique attack)
- Homemade "Red Special" guitar

### Original Gear
- Red Special guitar (custom)
- Vox AC30 (cranked)
- Treble Booster

### Free VST Chain
```
1. Ignite Amps Emissary (clean/edge channel)
   - Treble: High
   - Bass: Low-mid
2. Analog Obsession BritPre (treble boost)
3. OrilRiver reverb (room)

For harmonies: Duplicate track, pitch shift +3rd, +5th
```

### REAPER FX Chain
```
ReaEQ:
- Cut bass below 150 Hz
- Boost 1-3 kHz significantly (+3-4 dB)
- Boost 6-8 kHz for shimmer
- Bright, trebly EQ curve

Layering technique:
1. Record rhythm part
2. Duplicate, pan L/R
3. Add harmony tracks (manual or pitch shift)
```

### Tips
- Use out-of-phase pickup positions
- Play with sixpence coin for unique attack
- Layer 4-8 guitar tracks for "wall of sound"
- Key songs: "Bohemian Rhapsody", "Brighton Rock"

---

## Slash (Guns N' Roses)

### Signature Sound
- Warm, singing Les Paul tone
- Marshall crunch
- Bluesy phrasing
- Wah-wah solos

### Original Gear
- Gibson Les Paul (Alnico II pickups)
- Marshall JCM800, Jubilee
- Cry Baby wah, delay

### Free VST Chain
```
1. LePou Legion (Marshall JCM800)
   OR: Ignite Emissary (crunch channel)
   - Gain: 55-65%
2. NadIR with Greenback IR
3. Calf Wah (for solos)
4. ReaDelay (slapback, 80-120 ms)
5. OrilRiver (room reverb, short)
```

### REAPER FX Chain
```
ReaEQ:
- HPF at 80 Hz
- Boost 800 Hz by +2 dB (warmth)
- Boost 2-3 kHz by +2 dB (cut)
- Gentle high shelf boost

ReaComp:
- Ratio: 3:1
- Attack: 20 ms
- Smooth sustain
```

### Tips
- Neck pickup for rhythm, bridge for leads
- Les Paul "woman tone" = tone knob rolled back
- Slow, expressive vibrato
- Key songs: "Sweet Child O' Mine", "November Rain"

---

## Kurt Cobain (Nirvana)

### Signature Sound
- Raw, lo-fi distortion
- Clean verse, loud chorus (dynamics!)
- Chorus effect on clean tones
- Deliberate "mistakes" and noise

### Original Gear
- Fender Jaguar/Mustang/Jag-Stang
- Fender Twin, Mesa Boogie
- DS-1, Small Clone chorus, Big Muff

### Free VST Chain
```
Clean:
1. LePou HyBrit (clean channel)
2. TAL-Chorus-LX (thick chorus)
   - Rate: 0.5
   - Depth: 70%

Distorted:
1. Analog Obsession BritPre (pushed hard)
   OR: Ignite Emissary (high gain, fuzzy)
2. Cut highs aggressively (lo-fi)
```

### REAPER FX Chain
```
ReaEQ:
- HPF at 100 Hz
- Heavy cut above 6 kHz (lo-fi)
- Boost 500 Hz - 1 kHz (midrange snarl)

Automation:
- Clean verses (gain low, chorus on)
- Distorted choruses (gain high, chorus off)
```

### Tips
- Downstroke strumming, aggressive
- Don't worry about "perfect" - embrace noise
- Dynamics: quiet/loud contrast is KEY
- Key songs: "Smells Like Teen Spirit", "Come As You Are"

---

## Tony Iommi (Black Sabbath)

### Signature Sound
- Heavy, dark doom tones
- Detuned guitars
- Melodic riffs with minor scales
- Pioneer of heavy metal tone

### Original Gear
- Gibson SG (custom)
- Laney amps
- Dallas Rangemaster treble booster

### Free VST Chain
```
1. LePou Legion (gain 50-60%)
   OR: Ignite Emissary
2. NadIR with vintage 4x12 IR
3. Analog Obsession BritPre (treble boost before amp)
```

### REAPER FX Chain
```
ReaEQ:
- Cut 200-400 Hz by -3 dB (reduce mud)
- Boost 800 Hz - 1 kHz by +2 dB
- Cut above 8 kHz (vintage)

Tuning: C# standard or lower
```

### Tips
- Light gauge strings (due to Iommi's fingertip injury)
- Melodic, not just heavy
- Slower tempos, let notes breathe
- Key songs: "Iron Man", "Paranoid", "Black Sabbath"

---

## John Frusciante (Red Hot Chili Peppers)

### Signature Sound
- Funky clean/crunch tones
- Stratocaster through Marshall
- Minimal effects, great dynamics
- Chord voicings + funk scratches

### Original Gear
- Fender Stratocaster (62 reissue)
- Marshall Major, Silver Jubilee
- Boss DS-2, CE-1 chorus

### Free VST Chain
```
Clean/Funk:
1. LePou HyBrit (edge of breakup)
2. TAL-Chorus-LX (subtle)

Dirty:
1. Ignite Emissary (crunch)
2. Gain: 45-55%
```

### REAPER FX Chain
```
ReaEQ:
- HPF at 100 Hz
- Scoop 400 Hz slightly (-2 dB)
- Boost 1-2 kHz (cut through mix)
- Boost 5-6 kHz (presence)

ReaComp:
- Light compression for funk (4:1, fast attack)
```

### Tips
- Practice chord inversions
- Muted "chucka" funk strumming
- Single notes with Strat quack
- Key songs: "Under the Bridge", "Scar Tissue", "Snow"
