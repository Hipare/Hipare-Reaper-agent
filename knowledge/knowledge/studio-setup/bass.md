# Bass Guitar Knowledge Base

## Bass Types and Characteristics

### Precision Bass (P-Bass) Style
```
Characteristics:
├── Split single-coil pickup (hum-canceling)
├── Warm, punchy, thick tone
├── Strong fundamental
├── Less high-frequency content
├── Sits well in mix naturally
└── Classic rock/motown sound

Genres: Rock, motown, punk, country, blues
Pickup: Single split-coil in middle position

Recording Tips:
├── DI: Medium output, straightforward
├── Tone knob affects high-end
├── Flatwound strings = vintage thump
├── Roundwound = more modern attack
└── Often needs little EQ in mix
```

### Jazz Bass (J-Bass) Style
```
Characteristics:
├── Two single-coil pickups
├── Brighter, more articulate than P-Bass
├── More high-frequency content
├── Bridge pickup = growly, aggressive
├── Neck pickup = deep, round
├── Both pickups = full, scooped mids

Genres: Jazz, funk, fusion, rock, R&B
Recording Tips:
├── DI: Medium output
├── Bridge pickup great for slap
├── Neck pickup for fingerstyle warmth
├── May need slight 60Hz hum reduction
└── More flexible tone shaping
```

### StingRay Style (Active)
```
Characteristics:
├── Large humbucker pickup
├── Active preamp (9V or 18V)
├── High output
├── Aggressive midrange
├── Punchy attack
├── Cuts through mix easily

Genres: Funk, rock, metal, fusion
Recording Tips:
├── DI: Lower gain needed (active!)
├── Very consistent output
├── Built-in EQ affects recording
├── May want to record flat (EQ bypassed)
└── Great for slap and aggressive playing
```

### Modern Active Bass (5/6-String)
```
Characteristics:
├── Extended range (low B or high C)
├── Active electronics
├── Multiple pickup configurations
├── Tight low-end
├── High output
└── Versatile tone options

Examples: Ibanez BTB, Warwick, Dingwall, Spector
Recording Tips:
├── DI: Watch for hot signal
├── Low B requires careful gain staging
├── May need high-pass at 30-40Hz
├── Tighter amp sims work better
└── Compression often necessary
```

## Pickup Types

### Passive Single Coil
```
Output: Low-medium (~150-250mV)
Character: Bright, clear, some 60Hz hum
DI Gain: Higher (11-1 o'clock)
Examples: Fender Jazz Bass pickups
```

### Passive Split Coil (P-Bass)
```
Output: Medium (~200-350mV)
Character: Warm, punchy, hum-canceling
DI Gain: Medium (10-12 o'clock)
Examples: Fender P-Bass pickups
```

### Passive Humbucker (MM-Style)
```
Output: Medium-high (~300-500mV)
Character: Punchy, aggressive, clear
DI Gain: Medium (10-11 o'clock)
Examples: MusicMan pickups, Nordstrand
```

### Active Preamp
```
Output: High (~500mV - 1.5V)
Character: Consistent, EQ'd, clean
DI Gain: Lower (9-10 o'clock)
Examples: EMG, Bartolini, Aguilar
Note: Requires battery, check before sessions!
```

## Recording Setup for Bass

### Standard DI Recording
```
REAPER Setup:
1. Create "Bass DI" track → Input: Interface Hi-Z
2. Gain: Start at 10 o'clock
3. Target level: -12 to -8dB peaks
4. Record clean DI signal
5. Add amp sim after recording OR on monitor track

Signal Chain:
Bass → Hi-Z Input → Interface → REAPER DI Track
```

### DI + Amp Sim Monitoring
```
REAPER Setup:
1. "Bass DI" track: Input Hi-Z, Record, Monitor OFF
2. "Bass Monitor" track: Same input, Monitor ON, Add amp sim
3. Or use Input FX for monitoring (record dry)

Amp Sim Options:
├── Neural DSP Parallax (modern)
├── IK Ampeg SVX (classic)
├── Ignite Amps SHB-1 (free)
├── TSE BOD (free, Sansamp clone)
└── Emissary for dirty tones
```

### DI + Mic Blend (Advanced)
```
For more tonal options:
1. "Bass DI" track: Direct signal
2. "Bass Amp" track: Mic'd amp (if available)
3. Blend in mix for full tone

Common Mics: RE20, MD421, U47 FET, Beta 52
```

## Gain Staging by Bass Type

### Passive P-Bass
```
Interface Gain: 11-12 o'clock
Target: -12dB peaks
Notes: Consistent, forgiving
```

### Passive J-Bass
```
Interface Gain: 11-12 o'clock
Target: -12dB peaks
Notes: May have slight hum, use noise gate if needed
```

### Active Bass
```
Interface Gain: 9-10 o'clock (START LOW!)
Target: -15 to -12dB peaks
Notes: Can easily clip, watch onboard EQ boost
Warning: Check battery before recording!
```

### 5/6-String Extended Range
```
Interface Gain: 9-11 o'clock depending on active/passive
Target: -12dB peaks, watch low B
Notes: Low B can overload preamps
EQ: May need high-pass at 30-40Hz to remove rumble
```

## EQ and Processing Tips

### Recording EQ (Usually None!)
```
Best Practice:
├── Record completely clean DI
├── Add EQ in mixing stage
├── Keeps options open
└── Can always add, can't remove
```

### Mixing EQ Suggestions
```
Low-end clarity: High-pass 30-40Hz
Tighten: Cut 80-100Hz slightly
Warmth: Boost 100-200Hz
Mud: Cut 250-400Hz
Growl: Boost 500-800Hz
Attack: Boost 2-4kHz
String noise: Cut 5kHz+ if needed
```

### Compression
```
Recording Compression: Optional, light only
├── Ratio: 4:1 or less
├── Attack: 10-30ms (let transient through)
├── Release: Auto or 100-200ms
├── Gain reduction: 3-6dB max
└── Purpose: Tame peaks, not squash dynamics
```

## Bass Recording Checklist

### Before Recording
```
□ Fresh strings if needed (or well-played in)
□ Check intonation
□ Battery check (active basses!)
□ Clean pots and jacks (no crackle)
□ Good quality cable
□ Tune to recording pitch
```

### REAPER Settings
```
□ Hi-Z input selected
□ Proper gain staging (-12dB peaks)
□ Sample rate: 48kHz minimum
□ Buffer: 128-256 samples
□ Track armed, input monitoring set
□ Metronome configured
```

### During Recording
```
□ Consistent playing position
□ Watch levels on loud sections
□ Don't touch tone knobs mid-take
□ Keep cable secure (no movement noise)
□ Take breaks to avoid fatigue
```

## AI-Ohjeistus Basson Äänitykseen

Kun käyttäjä mainitsee basson:

1. **Tunnista bassotyyppi** → P-Bass, J-Bass, active?
2. **Passive vai active** → vaikuttaa gain stagingiin merkittävästi
3. **Suosittele DI-äänitys** → puhdas DI aina
4. **5/6-kielinen** → varoita low B:n gain-ongelmista
5. **Amp sim** → ehdota tyyliin sopiva

Kysymyksiä käyttäjälle:
- "Onko bassosi aktiivi- vai passiivielektroniikalla?"
- "Montako kieltä bassossasi on?"
- "Mitä genreä äänität - tarvitaanko aggressiivista vai lämmintä soundia?"
