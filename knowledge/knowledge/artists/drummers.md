# Drummer Sounds - Free VST Recreation Guide

## Overview

Drum sounds define the energy and feel of a production. This guide covers famous drummers and how to recreate their signature sounds using free plugins and REAPER processing.

---

## Tomas Haake (Meshuggah)

### Signature Sound
- Surgically precise polyrhythms
- Tight, modern metal tone
- Complex kick patterns
- Dry, punchy snare

### Original Recording Approach
- Toontrack Superior Drummer
- Very controlled, close mic'd
- Minimal room sound

### Free VST Drum Approach
```
Use: Steven Slate Drums Free OR MT Power Drumkit
Process heavily for modern metal sound
```

### REAPER Processing
```
KICK:
ReaEQ:
- HPF at 30 Hz
- Boost 50-60 Hz (+3 dB) - sub punch
- Cut 200-400 Hz (-4 dB) - remove boxiness
- Boost 2-4 kHz (+4 dB) - click attack
ReaComp:
- Ratio: 6:1
- Attack: 10 ms
- TIGHT

SNARE:
ReaEQ:
- HPF at 100 Hz
- Boost 200 Hz (+2 dB) - body
- Cut 400 Hz (-2 dB) - boxiness
- Boost 2-4 kHz (+4 dB) - crack
ReaGate:
- Fast attack, medium release
- Tight gating

TOMS:
- Gate heavily
- Similar processing to snare
- Boost attack frequencies

OVERHEADS:
- HPF at 300-500 Hz (cymbals only)
- Let kick/snare come from close mics
```

### Tips
- Quantize MIDI tightly
- Velocity consistency is key
- Practice with metronome constantly
- Key songs: "Bleed", "Rational Gaze"

---

## John Bonham (Led Zeppelin)

### Signature Sound
- HUGE room sound
- Powerful, dynamic playing
- Ludwig Vistalite kit
- Compression for sustain

### Original Recording Approach
- Large room ambient mics
- Minimal close mics
- Natural room reverb

### REAPER Processing
```
KICK:
ReaEQ:
- HPF at 40 Hz
- Boost 80-100 Hz (+3 dB) - thump
- Boost 2-3 kHz (+2 dB) - beater
ReaComp:
- Ratio: 4:1
- Slow attack (40 ms) - let attack through
- Room-ish compression

SNARE:
ReaEQ:
- Boost 200 Hz (+3 dB) - fat
- Boost 5-6 kHz (+2 dB) - crack
ReaComp:
- Slow attack, let the hit through
- Long sustain

ROOM/AMBIENCE:
ReaVerbate or Convolution reverb
- Large room IR
- 1-2 second decay
- HIGH in the mix (this is key!)

OVERALL:
ReaComp on drum bus:
- Ratio: 4:1
- Slow attack (30-50 ms)
- Moderate release
- "Pumping" compression is OK!
```

### Tips
- ROOM SOUND is everything
- Let drums breathe
- Dynamic playing: soft to LOUD
- Key songs: "When the Levee Breaks", "Moby Dick"

---

## Phil Collins (Gated Reverb Pioneer)

### Signature Sound
- THE gated reverb snare
- Punchy, 80s drum sound
- Tight, controlled decay
- "In the Air Tonight" sound

### REAPER Processing - Gated Reverb
```
SNARE GATED REVERB TECHNIQUE:

1. Send snare to reverb bus
2. On reverb bus:
   - ReaVerbate (large hall, 2-3s decay)
   - 100% wet
3. After reverb, add:
   - ReaGate
   - Threshold: Adjust to cut tail
   - Attack: 1 ms
   - Hold: 100-200 ms
   - Release: 50-100 ms
4. Blend with dry snare

ALTERNATIVE (simpler):
1. ReaVerbate on snare insert
2. Set wet/dry to 50%
3. Use very short decay (0.3-0.5s)
4. Boost reverb with EQ at 1-2 kHz
```

### Tips
- Gated reverb = reverb + gate cutting the tail
- Experiment with gate timing
- Key songs: "In the Air Tonight", "Sussudio"

---

## Danny Carey (Tool)

### Signature Sound
- Huge, complex kit
- Electronic/acoustic hybrid
- Odd time signatures
- Paiste cymbals, Roland pads

### REAPER Processing
```
KICK:
- Similar to Bonham but tighter
- Blend acoustic + electronic

SNARE:
- Multiple snares (different sounds)
- Blend for fullness

TOMS:
- Roto-toms, octobans
- Heavy room reverb

ELECTRONICS:
- Blend triggered samples
- Use REAPER's sample triggering
```

### Tips
- Complex polyrhythms
- Mix acoustic + electronic
- Key songs: "Pneuma", "Lateralus"

---

## Dave Grohl (Nirvana / Foo Fighters)

### Signature Sound
- Powerful, aggressive attack
- Simple but effective beats
- Raw, live recording quality
- Dynamics: quiet verse, loud chorus

### REAPER Processing
```
KICK:
ReaEQ:
- HPF at 50 Hz
- Boost 100 Hz (+3 dB) - punch
- Boost 3-4 kHz (+2 dB) - attack
Moderate compression

SNARE:
ReaEQ:
- Boost 200 Hz (+2 dB) - body
- Boost 5-6 kHz (+3 dB) - crack
- Raw, not over-processed

OVERHEADS:
- Full frequency (no extreme HPF)
- Let bleed happen naturally

ROOM:
- Significant room sound
- Crush with compression for effect
```

### Tips
- HIT HARD
- Dynamics are crucial
- Key songs: "Smells Like Teen Spirit", "Everlong"

---

## Questlove (The Roots)

### Signature Sound
- Deep pocket, behind the beat
- Warm, vintage tone
- Hip-hop meets live drums
- Controlled dynamics

### REAPER Processing
```
KICK:
ReaEQ:
- HPF at 40 Hz
- Boost 80-100 Hz (+3 dB) - deep thump
- Subtle attack boost
ReaComp:
- Ratio: 4:1
- Consistent, controlled

SNARE:
ReaEQ:
- Warm, not bright
- Boost body (200 Hz)
- Reduce high crack
ReaComp:
- Even sustain

OVERALL:
- Warm, vintage character
- Use Analog Obsession plugins for color
- Tape saturation
```

### Tips
- Play BEHIND the beat slightly
- Tight hi-hat work
- Key songs: "You Got Me", "The Seed 2.0"

---

## Stewart Copeland (The Police)

### Signature Sound
- High-pitched, ringy snare
- Reggae/rock fusion
- Creative hi-hat work
- Splash cymbals everywhere

### REAPER Processing
```
SNARE:
ReaEQ:
- HPF at 150 Hz (thin, high)
- Boost 1-2 kHz (+4 dB) - ring
- Boost 6-8 kHz (+3 dB) - crack
- High-pitched, ringy

HI-HAT:
- Feature prominently
- Open/closed patterns
- Bright, present

OVERALL:
- Room reverb (medium)
- Tight but lively
```

### Tips
- High snare tuning
- Unique off-beat patterns
- Key songs: "Message in a Bottle", "Roxanne"

---

## Lars Ulrich (Metallica)

### Signature Sound
- Thrash metal drums
- Double kick patterns
- Tight, aggressive
- Changed significantly over albums

### REAPER Processing
```
BLACK ALBUM ERA:

KICK:
ReaEQ:
- HPF at 40 Hz
- Boost 60-80 Hz (+3 dB) - thump
- Cut 200-400 Hz (-3 dB)
- Boost 3-5 kHz (+4 dB) - click
ReaComp:
- Fast attack
- Tight

SNARE:
ReaEQ:
- Boost 200 Hz (+2 dB)
- Boost 4-5 kHz (+3 dB)
ReaComp:
- Punchy

ROOM:
- Controlled room sound
- Not too much ambience
```

### Tips
- Practice double kick consistency
- Tight snare timing
- Key songs: "Enter Sandman", "One"

---

## Clyde Stubblefield (James Brown)

### Signature Sound
- THE "Funky Drummer" beat
- Tight ghost notes
- Impeccable groove
- Minimal kit, maximum feel

### REAPER Processing
```
Vintage sound processing:

KICK:
ReaEQ:
- Boost 80-100 Hz
- Roll off highs above 5 kHz
Tape saturation (Analog Obsession)

SNARE:
- Dry, tight
- Ghost notes crucial
- Warm, not bright

HI-HAT:
- Feature the groove
- Consistent 16th notes

OVERALL:
- Mono or narrow stereo
- Vintage compression (Analog Obsession LALA)
```

### Tips
- GHOST NOTES are everything
- Lay back, don't rush
- Key songs: "Funky Drummer", "Cold Sweat"

---

## Chad Smith (Red Hot Chili Peppers)

### Signature Sound
- Big, open drum sound
- Rock/funk hybrid
- Powerful but groovy
- Dynamic range

### REAPER Processing
```
KICK:
ReaEQ:
- HPF at 50 Hz
- Boost 80-100 Hz (+3 dB)
- Boost 2-3 kHz (+2 dB)
Natural room sound

SNARE:
ReaEQ:
- Boost 200 Hz (+3 dB) - fat
- Boost 5-6 kHz (+2 dB)
Some room reverb

ROOM:
- Natural room sound
- Not too processed
```

### Tips
- Power + groove combination
- Don't overplay
- Key songs: "Give It Away", "Californication"

---

## Roger Taylor (Queen)

### Signature Sound
- Multi-layered drum recordings
- Distinctive high-pitched toms
- Arena rock sound
- Creative overdubs

### REAPER Processing
```
SNARE:
- Layered (multiple takes)
- Gated reverb

TOMS:
- High pitched tuning
- Heavy room reverb

OVERALL:
- Big, theatrical sound
- Multiple drum layers
```

### Tips
- Layer drum takes
- Big reverbs
- Key songs: "We Will Rock You", "Bohemian Rhapsody"

---

## Matt Garstka (Animals as Leaders)

### Signature Sound
- Modern progressive metal
- Complex ghost notes
- Jazz-influenced
- Pristine, modern production

### REAPER Processing
```
Similar to Tomas Haake but:
- More ghost notes
- Jazz ride cymbal work
- Slightly more room sound
- Very dynamic
```

### Tips
- Study jazz drumming
- Ghost notes everywhere
- Key songs: "Physical Education", "The Brain Dance"

---

## Joey Jordison (Slipknot)

### Signature Sound
- Extreme speed
- Triggered kick drums
- Aggressive attack
- Nu-metal processing

### REAPER Processing
```
KICK:
- Heavily triggered/replaced
- Consistent velocity
- Extreme click attack
ReaEQ:
- HPF at 40 Hz
- Boost 3-5 kHz (+6 dB) - click
- Cut 200-400 Hz heavily

SNARE:
- Tight, punchy
- Gated
- Fast transients

OVERALL:
- Very tight gating
- Modern, processed sound
```

### Tips
- Trigger/sample replacement common
- Extreme speeds require consistency
- Key songs: "People = Shit", "Duality"

---

## Mario Duplantier (Gojira)

### Signature Sound
- Organic yet heavy
- Creative patterns
- Polyrhythmic
- Natural dynamics

### REAPER Processing
```
Balance between natural and processed:

KICK:
- Natural sound + slight click boost
- Not over-triggered

SNARE:
- Dynamic range preserved
- Some room sound

OVERALL:
- Heavy but organic
- Room mics important
```

### Tips
- Unique patterns, not generic
- Preserve dynamics
- Key songs: "Flying Whales", "Stranded"

---

## Tony Williams (Miles Davis)

### Signature Sound
- Jazz precision
- Incredible dynamics
- Creative cymbal work
- Acoustic, natural recording

### REAPER Processing
```
MINIMAL processing:

ReaEQ:
- HPF at 60 Hz (very gentle)
- Natural EQ, don't color

ReaComp:
- Very gentle if any
- 2:1 ratio maximum
- Preserve all dynamics

Reverb:
- Natural room only
- No artificial reverb
```

### Tips
- DYNAMICS are everything
- Let the drums breathe
- Key songs: "Nefertiti", "E.S.P."

---

## Bernard Purdie (Session Drummer)

### Signature Sound
- "Purdie Shuffle" (half-time shuffle)
- Ghost notes mastery
- Deep pocket
- Feel over technique

### REAPER Processing
```
Vintage, warm sound:

KICK:
- Warm, not clicky
- Natural sustain

SNARE:
- Ghost notes featured
- Warm, moderate ring

OVERALL:
- Analog warmth (Analog Obsession plugins)
- Room sound present
- Natural dynamics
```

### Tips
- Study the "Purdie Shuffle"
- Ghost notes create groove
- Key songs: "Home at Last" (Steely Dan)

---

## Meg White (The White Stripes)

### Signature Sound
- Simple, primal beats
- Raw, garage-rock recording
- Minimal kit (kick, snare, one cymbal)
- Imperfect but effective

### REAPER Processing
```
RAW processing:

KICK:
ReaEQ:
- Boost 80-100 Hz
- Raw, not polished

SNARE:
- Natural room sound
- No extreme processing
- Let imperfections stay

OVERALL:
- Lo-fi aesthetic
- Room mics up front
- Don't over-produce
```

### Tips
- Simple is powerful
- Embrace imperfection
- Key songs: "Seven Nation Army", "Fell in Love with a Girl"

---

## Ginger Baker (Cream)

### Signature Sound
- Jazz-rock fusion pioneer
- Double kick pioneer in rock
- African rhythm influences
- Extended solos

### REAPER Processing
```
Vintage rock sound:

KICK:
- Natural sustain
- Warm, not modern click

TOMS:
- Featured prominently
- Natural room reverb

OVERALL:
- 1960s recording aesthetic
- Room sound crucial
- Natural dynamics
```

### Tips
- Study jazz drumming
- Double kick as texture, not speed
- Key songs: "Toad", "Sunshine of Your Love"
