# Microphone Knowledge Base

## Microphone Types

### Dynamic Microphones
```
Characteristics:
├── Rugged, durable construction
├── No phantom power needed
├── Lower sensitivity
├── Good noise rejection
├── Handles high SPL well
├── Less room sound pickup
└── Generally affordable

Best for: Loud sources, live use, untreated rooms
Examples: Shure SM57, SM58, SM7B, Sennheiser MD421
```

### Condenser Microphones (Large Diaphragm)
```
Characteristics:
├── High sensitivity
├── Requires 48V phantom power
├── Wide frequency response
├── Captures detail and nuance
├── Picks up room sound
├── More fragile than dynamics
└── Studio standard for vocals

Best for: Vocals, acoustic instruments, studio recording
Examples: Rode NT1, AT2020, Neumann U87, AKG C414
```

### Condenser Microphones (Small Diaphragm)
```
Characteristics:
├── Excellent transient response
├── Accurate high frequencies
├── Requires phantom power
├── Often used in pairs
├── Great for acoustic detail
└── Less bass proximity effect

Best for: Acoustic guitar, overheads, strings, piano
Examples: Rode NT5, AKG C451, Neumann KM184
```

### Ribbon Microphones
```
Characteristics:
├── Figure-8 polar pattern
├── Smooth, vintage sound
├── Rolled-off high frequencies
├── NEVER use phantom power (damages ribbon!)
├── Very fragile
└── Bi-directional pickup

Best for: Guitar amps, brass, room mics, vintage character
Examples: Royer R-121, Beyerdynamic M160, SE Electronics VR1
Warning: NO PHANTOM POWER!
```

## Popular Microphones by Use

### Vocal Microphones

#### Budget ($50-150)
```
Audio-Technica AT2020:
├── Type: Large diaphragm condenser
├── Pattern: Cardioid
├── Phantom: Yes (48V)
├── Character: Neutral, slight presence peak
└── Good for: Beginners, home studio

Rode NT1-A / NT1:
├── Type: Large diaphragm condenser
├── Pattern: Cardioid
├── Phantom: Yes (48V)
├── Character: Very low noise, bright
└── Good for: Professional home recording
```

#### Mid-Range ($200-500)
```
Shure SM7B:
├── Type: Dynamic
├── Pattern: Cardioid
├── Phantom: No
├── Character: Warm, broadcast quality
├── Note: Needs lots of gain! (60dB+)
└── Good for: Vocals, podcast, streaming

Rode NT2-A:
├── Type: Large diaphragm condenser
├── Pattern: Multi-pattern (cardioid, omni, figure-8)
├── Phantom: Yes (48V)
├── Character: Versatile, warm
└── Good for: Multiple applications
```

#### Professional ($500+)
```
Neumann U87:
├── Type: Large diaphragm condenser
├── Pattern: Multi-pattern
├── Phantom: Yes (48V)
├── Character: Industry standard, detailed
└── Good for: Professional vocal recording

AKG C414:
├── Type: Large diaphragm condenser
├── Pattern: Multi-pattern (9 options)
├── Phantom: Yes (48V)
├── Character: Detailed, versatile
└── Good for: Vocals, instruments, everything
```

### Instrument Microphones

#### Shure SM57 (Universal)
```
Type: Dynamic
Pattern: Cardioid
Phantom: No
Character: Punchy, focused midrange
Uses:
├── Guitar amps (industry standard)
├── Snare drum
├── Toms
├── Brass instruments
└── Backup vocals

Recording Tips:
├── On amp: 1-2" from grille, off-center for less brightness
├── On snare: 1-2" above rim, pointing at center
├── Versatile but limited high frequency
└── Often paired with condenser for blend
```

#### Sennheiser MD421
```
Type: Dynamic
Pattern: Cardioid
Phantom: No
Character: Full, detailed for dynamic
Uses:
├── Toms (industry standard)
├── Guitar amps
├── Bass amps
├── Kick drum (outside)
└── Vocals (broadcast style)
```

#### AKG D112 / Shure Beta 52
```
Type: Dynamic (large diaphragm)
Pattern: Cardioid
Phantom: No
Character: Extended low frequency
Uses: Kick drum, bass amp
```

## Phantom Power Guide

### What is Phantom Power?
```
48V DC power sent through XLR cable
Required by: Condenser microphones
Not required by: Dynamic microphones
Dangerous for: Ribbon microphones (usually!)
```

### Interface Phantom Power
```
Most interfaces have 48V button:
├── Applies to ALL XLR inputs (some per-channel)
├── Wait 30 seconds before recording after enabling
├── Turn off before connecting/disconnecting mics
└── Check individual channel phantom if available
```

### Phantom Power Safety
```
SAFE: Condenser mics (require it)
SAFE: Dynamic mics (ignored, no harm)
DANGEROUS: Most ribbon mics (destroys ribbon!)
DANGEROUS: Some vintage mics
CHECK MANUAL: Always verify before connecting
```

## Gain Staging for Microphones

### Condenser Microphone
```
Typical sensitivity: -30 to -40 dB
Interface gain needed: Low to medium (9-12 o'clock)
Target level: -18 to -12 dBFS
Note: Can be very sensitive, watch for clipping
```

### Dynamic Microphone
```
Typical sensitivity: -55 to -60 dB
Interface gain needed: Medium to high (12-3 o'clock)
Target level: -18 to -12 dBFS
Note: SM7B especially needs lots of gain
```

### Ribbon Microphone
```
Typical sensitivity: -50 to -55 dB
Interface gain needed: High (may need preamp boost)
Target level: -18 to -12 dBFS
Note: NO PHANTOM POWER! Use quality preamp.
```

## Microphone Positioning

### Vocals
```
Distance: 6-12 inches from mic
Pop filter: Essential (2-4 inches from mic)
Height: Mouth level or slightly above
Angle: Straight on or slight angle
Room: Minimize reflections (treatment or closet)
```

### Acoustic Guitar
```
Position 1 - 12th fret (balanced):
├── 6-12 inches away
├── Point at 12th fret area
├── Gets balanced tone
└── Most common single-mic position

Position 2 - Bridge (bright):
├── 6-12 inches away
├── Point at bridge
├── Brighter, more attack
└── Good for strumming

Position 3 - Sound hole (avoid or blend):
├── Very boomy, muddy
├── Only use mixed with other positions
└── High-pass if used alone
```

### Guitar Amp
```
SM57 Standard Position:
├── 1-2 inches from grille cloth
├── Point at speaker cone edge
├── Center = brighter, edge = darker
├── Angle affects tone

Two-Mic Technique:
├── SM57 close + room mic (condenser)
├── SM57 + ribbon (blend aggression + smoothness)
└── Check phase alignment!
```

## Common Microphone Problems

### No Signal
```
Checklist:
1. Cable connected properly?
2. Phantom power ON (for condensers)?
3. Interface gain up?
4. Track input selected correctly?
5. Track armed?
6. Mic working? (try another cable)
```

### Too Quiet
```
Solutions:
1. Increase interface preamp gain
2. Move mic closer to source
3. Use Cloudlifter/Fethead (for dynamics)
4. Check cable (bad cable = signal loss)
5. SM7B? Needs 60dB+ gain - use booster
```

### Too Bright/Harsh
```
Solutions:
1. Move mic off-axis (not pointing directly)
2. Increase distance
3. Use pop filter
4. Position away from hard surfaces
5. EQ cut at 3-6kHz after recording
```

### Room Sound/Echo
```
Solutions:
1. Get closer to mic (proximity effect)
2. Use cardioid pattern (rejects rear)
3. Add absorption behind singer
4. Record in closet/booth
5. Use dynamic instead of condenser
```

### Plosives (P/B sounds)
```
Solutions:
1. Use pop filter (essential!)
2. Sing across mic (off-axis)
3. Position mic higher, pointing down
4. Increase distance slightly
5. High-pass filter after recording
```

## AI-Ohjeistus Mikrofonien Käyttöön

Kun käyttäjä mainitsee mikrofonin:

1. **Tunnista tyyppi** → condenser, dynamic, ribbon?
2. **Phantom power** → condenser = ON, ribbon = DANGER!
3. **Gain staging** → condenser = vähemmän, dynamic = enemmän
4. **Käyttötarkoitus** → laulu, instrumentti, amp?
5. **Sijoittelu** → anna ohjeita etäisyydestä ja kulmasta

Varoitukset:
- AINA kysy mikrofonivarustus ennen phantom power -ohjeita
- Nauhamikrofoni + phantom power = rikkoutunut mikrofoni!
- SM7B vaatii paljon gainia - suosittele boosteria

Kysymyksiä käyttäjälle:
- "Mikä mikrofoni sinulla on?"
- "Mitä äänität - laulua vai instrumenttia?"
- "Onko sinulla pop-filtteri lauluäänitykseen?"
