# Recording Guide for REAPER

## Complete Recording Workflow

This guide covers everything from setup to final takes, helping users achieve professional recordings.

## Pre-Recording Checklist

### Hardware Setup
```
□ Audio interface connected and powered
□ Correct drivers installed
□ Microphones connected
□ Headphones connected
□ Instruments connected (DI, amp)
□ Phantom power ON for condenser mics
□ Gain levels set on interface
```

### REAPER Setup
```
□ Audio device selected in Preferences
□ Sample rate matches interface
□ Buffer size appropriate (128-256 for recording)
□ Project created and saved
□ Project folder organized
□ Metronome configured
□ Tempo and time signature set
```

## Audio Device Configuration

### Accessing Settings
```
Options → Preferences → Audio → Device
```

### Device Settings

| Setting | Recommendation | Notes |
|---------|----------------|-------|
| Audio system | ASIO (Windows) / CoreAudio (Mac) | Best performance |
| Sample rate | 44100 or 48000 Hz | Match project |
| Buffer size | 128-256 samples | Lower = less latency |
| Block size | 512-1024 | For plugins |

### Sample Rate Guidelines

| Rate | Use Case |
|------|----------|
| 44100 Hz | CD quality, music |
| 48000 Hz | Video, broadcast |
| 96000 Hz | High-resolution, archival |
| 192000 Hz | Audiophile, rarely needed |

### Buffer Size vs Latency

| Buffer | Latency @ 48kHz | Use |
|--------|-----------------|-----|
| 32 | 0.7ms | Very low latency, high CPU |
| 64 | 1.3ms | Low latency recording |
| 128 | 2.7ms | Good balance |
| 256 | 5.3ms | Mixing, more plugins |
| 512 | 10.7ms | Heavy mixing |
| 1024 | 21.3ms | Mastering, CPU-heavy |

## Input Configuration

### Setting Track Input

1. Create new track (Ctrl+T)
2. Click I/O button (routing) on track
3. In "Record: Input" section:
   - Select input channel
   - Choose Mono or Stereo
4. Arm track for recording (red button)

### Input Types

**Mono Input:**
- Single microphone
- DI guitar/bass
- Single line input

**Stereo Input:**
- Stereo microphone pair
- Keyboard stereo output
- Room mics (L/R)

**Multi-channel:**
- Drum kit (8+ inputs)
- Orchestral recording
- Multi-mic setups

### Naming Inputs (Aliasing)

**Create descriptive input names:**
```
Options → Preferences → Audio → Recording
Check "Show input channel assignment in track name"

Or better: Create aliases:
Preferences → Track/Send Defaults → Input aliasing
"In 1" → "Vocal Mic"
"In 2" → "Guitar DI"
etc.
```

## Gain Staging for Recording

### The Goal
Record with optimal level: **loud enough for good signal-to-noise, quiet enough to avoid clipping**.

### Target Levels

| Signal Type | Peak Level | Average (RMS) |
|-------------|------------|---------------|
| Vocals | -12 to -6 dBFS | -24 to -18 dBFS |
| Drums (close) | -12 to -6 dBFS | Varies |
| Drums (OH) | -18 to -12 dBFS | -24 to -18 dBFS |
| Guitar DI | -18 to -12 dBFS | -24 to -18 dBFS |
| Bass DI | -12 to -6 dBFS | -18 to -12 dBFS |
| Synths | -12 to -6 dBFS | -18 to -12 dBFS |

### Setting Gain

1. **At the source:** Interface preamp gain
2. Play/sing at performance level
3. Watch REAPER meters
4. Adjust until peaks hit -12 to -6 dBFS
5. **Never clip!** (red on meters)

### Headroom Myth

**24-bit recording has plenty of headroom:**
- 144 dB dynamic range
- No need to record "hot"
- Conservative levels = safe recordings
- Gain can always be added later

## Monitoring

### Monitor Modes

**Record Monitoring (in track I/O):**
```
Off - No input monitoring
On - Always hear input
Tape Auto Style - Auto-switch rec/play
```

**When to use each:**
- **Off:** Using hardware monitoring
- **On:** Software monitoring needed
- **Auto:** Overdubbing, punch recording

### Dealing with Latency

**Option 1: Reduce Buffer**
- Lower buffer = lower latency
- Trade-off: Higher CPU usage

**Option 2: Direct/Hardware Monitoring**
- Monitor through interface (zero latency)
- REAPER playback in headphones
- Most professional approach

**Option 3: REAPER's Low Latency Mode**
```
Options → Preferences → Audio → Recording
Check "Use low latency mode while recording"
```

### Headphone Mix

**Creating Custom Headphone Mix:**
1. Route tracks to separate output
2. Or use sends to headphone bus
3. Adjust levels for performer
4. Add reverb for comfort (not recorded)

## Recording Modes

### Standard Recording

**Normal Mode:**
- Creates new item on track
- Each recording = new item
- Simple, straightforward

### Take/Comp Recording

**For Multiple Takes:**
```
Options → Preferences → Recording
"Create new media items in separate lanes (layers)"
Or record to same item position = takes
```

**Workflow:**
1. Record first take
2. Loop or restart
3. Record again = new take
4. All takes in same item
5. Comp later

### Punch Recording

**Time Selection Auto-Punch:**
1. Make time selection (drag on ruler)
2. Options → Recording → "Record mode: time selection auto punch"
3. Press record (starts before selection)
4. Recording punches in/out at selection

**Manual Punch:**
1. Start playback
2. Press R to punch in
3. Press R again to punch out
4. Or Space to stop

### Loop Recording

**For Continuous Takes:**
1. Enable loop (toggle or R on keyboard)
2. Set loop points
3. Record
4. Each loop = new take
5. Continue until satisfied

**Options:**
```
Options → Preferences → Recording
"When recording and looped, add recorded media to project"
Choose: In new item, as takes, or items
```

## Recording Specific Instruments

### Vocals

**Setup:**
```
Microphone: Large diaphragm condenser or SM58/SM7B
Distance: 6-12 inches
Pop filter: Essential
Reflection filter: Helpful in untreated rooms
```

**REAPER Settings:**
- Mono input
- Input FX: Light compression (optional, careful!)
- Monitor with reverb (not recorded)

**Gain:** Peaks at -12 to -6 dBFS

**Tips:**
- Record multiple takes
- Maintain consistent distance
- Watch for plosives
- Record room tone for editing

### Electric Guitar

**DI Recording:**
```
Guitar → DI Box/Interface Hi-Z input → REAPER
```

**Amp Mic Recording:**
```
Amp → Microphone (SM57 typical) → Interface → REAPER
```

**Re-amping Setup:**
```
1. Record DI clean
2. Later: Output DI to amp
3. Re-record amp with mic
4. Best of both worlds
```

**Tips:**
- Record DI AND amp simultaneously if possible
- Use gate or edit between parts
- Label takes clearly

### Bass

**DI Recording (most common):**
```
Bass → DI Box → Interface → REAPER
```

**Amp Recording:**
- Similar to guitar
- Common mics: RE20, MD421, U47 FET

**Blend Both:**
- Record DI and amp to separate tracks
- Blend in mix for full tone

### Drums

**Multi-mic Setup (typical):**
```
Channel 1: Kick In (inside drum)
Channel 2: Kick Out (front head)
Channel 3: Snare Top
Channel 4: Snare Bottom
Channel 5: Hi-Hat
Channel 6: Tom 1
Channel 7: Tom 2
Channel 8: Floor Tom
Channel 9-10: Overhead L/R
Channel 11-12: Room L/R
```

**Creating Drum Tracks:**
1. Create folder track "Drums"
2. Create child tracks for each mic
3. Set appropriate inputs
4. Color code
5. Name clearly

**Phase Considerations:**
- Check snare bottom against top (flip phase)
- Check OH against close mics
- Room mics may need time alignment

### Acoustic Guitar

**Common Mic Positions:**
- **12th fret:** Balanced tone
- **Sound hole:** Boomy, more bass
- **Bridge:** Brighter, more attack
- **Stereo:** XY at 12th fret + room

**DI Option:**
- Use acoustic with pickup
- Record DI + mic
- Blend in mix

### Keyboards/Synths

**Direct Recording:**
```
Synth stereo out → Interface Line In → REAPER (stereo track)
```

**MIDI Recording:**
```
MIDI out → Interface MIDI In → REAPER → VSTi
Benefits: Edit notes later, change sounds
```

**Best Practice:**
- Record audio AND MIDI simultaneously
- Audio for final, MIDI for backup

## Workflow Best Practices

### Session Organization

**Before Recording:**
1. Create tracks for all inputs
2. Name tracks clearly
3. Set inputs
4. Color code
5. Save template for reuse

**During Recording:**
1. Label takes (T key for take name)
2. Use markers for song sections
3. Make notes on good takes
4. Save frequently (Ctrl+S)

**After Recording:**
1. Back up project folder
2. Name items clearly
3. Remove bad takes
4. Organize media files

### Take Management

**Labeling Takes:**
- Double-click item
- Enter name
- Include: take number, quality notes

**Rating System:**
```
"Lead Vox - Take 3 - GOOD"
"Lead Vox - Take 5 - BEST chorus"
"Lead Vox - Take 7 - verse 2 good"
```

**Removing Bad Takes:**
- Keep session clean
- Don't delete until sure
- Consider backup project first

### Markers and Regions

**During Recording:**
- M = Insert marker
- Shift+M = Insert region
- Use for: song sections, good takes, notes

**Marker Naming:**
```
1: "Verse 1"
2: "Chorus"
3: "Good vocal take here"
```

## Recording Multiple Instruments Simultaneously

### Live Band Recording

**Requirements:**
- Sufficient inputs
- Good isolation or bleed management
- Communication system (talkback)
- Headphone mix for each musician (ideally)

**Setup Steps:**
1. Connect all microphones
2. Create tracks for each input
3. Set up headphone mixes
4. Sound check each instrument
5. Check for bleed issues
6. Record full takes

### Overdubbing

**Adding Parts to Existing Recording:**
1. Open project with existing tracks
2. Create new track for overdub
3. Set input, arm track
4. Performer hears existing tracks
5. Record new part
6. Punch in/out as needed

**Tips:**
- Consistent monitoring level
- Reference previous parts
- Multiple takes, comp later

## Troubleshooting Recording Issues

### No Signal

**Checklist:**
1. Physical connection (cable, interface)
2. Phantom power (condensers)
3. Interface gain not zero
4. Correct input selected in REAPER
5. Track armed
6. Input enabled (not muted)

### Signal Too Quiet

1. Increase interface preamp gain
2. Check microphone position
3. Check cable/connection
4. Verify input selection

### Signal Distorted

1. Reduce interface gain
2. Check source (instrument too hot)
3. Check digital clipping in REAPER
4. Reduce any input FX gain

### Latency Issues

1. Reduce buffer size
2. Use direct monitoring
3. Disable input FX
4. Close other applications

### Clicks and Pops

1. Increase buffer size
2. Check CPU usage
3. Disable WiFi/Bluetooth
4. Close background apps
5. Check cables/connections

## Recording Checklist Summary

**Pre-Session:**
```
□ Test all equipment
□ Check connections
□ Configure REAPER audio settings
□ Set up tracks and inputs
□ Save project template
```

**During Session:**
```
□ Set proper gain levels
□ Monitor without clipping
□ Label takes
□ Use markers
□ Save frequently
```

**Post-Session:**
```
□ Back up project
□ Organize files
□ Delete obvious bad takes
□ Make notes for mixing
□ Store safely
```

## Latenssin minimointi äänittäessä

### Miksi latenssi on ongelma?
Kun soitat tai laulat ja kuuntelet itsesi REAPER:n kautta, signaali kulkee:
```
Instrumentti → Interface → REAPER (prosessointi) → Interface → Kuulokkeet
```
Tämä matka aiheuttaa viivettä (latenssi). Yli 10ms viive tuntuu häiritsevältä.

### Latenssin mittaaminen
```
Yksinkertainen kaava:
Latenssi (ms) = Buffer size / Sample rate × 1000 × 2

Esimerkki: 128 samples / 48000 Hz × 1000 × 2 = ~5.3ms (edestakaisin)
```

### Strategia 1: ASIO-asetukset (suositeltu Windows)
```
Options → Preferences → Audio → Device
1. Audio system: ASIO
2. ASIO Driver: Oman interfacen ASIO-ajuri (esim. Focusrite USB ASIO)
3. Buffer: 128 samples (äänitys) / 256-512 (miksaus)
4. Sample Rate: 48000 Hz
```

**ASIO-ajurin omat asetukset:**
- Avaa interfacen ASIO Control Panel (REAPER: Preferences → ASIO Configuration)
- Säädä buffer sieltä suoraan
- Jos ei omaa ASIO-ajuria: ASIO4ALL (ilmainen, mutta ei yhtä hyvä)

### Strategia 2: Direct Monitoring (nollalatenssi)
```
Paras ratkaisu äänityksen aikana:
1. Kytke interfacen "Direct Monitor" päälle (fyysinen kytkin tai ohjelmisto)
2. REAPER: Raidan monitorointi → OFF
3. Kuuntelet suoraan interfacesta, EI REAPER:n kautta
4. REAPER äänittää silti signaalin normaalisti
```

**Edut:**
- 0ms latenssi
- Ei rasita CPU:ta
- Ammattilaisratkaisu

**Haitat:**
- Et kuule REAPER:n efektejä reaaliajassa
- Monitorointimiksauksen säätö interfacessa, ei REAPER:ssä

### Strategia 3: REAPER:n Low Latency Mode
```
Options → Preferences → Audio → Recording
☑ "Allow use of different buffer sizes for playback and recording"
Tai: Options → "Use low latency monitoring while recording"
```

**Toiminta:**
- Ohittaa raskaat pluginit äänityksen aikana
- Vähentää latenssian automaattisesti
- Kätevä kun haluat kuulla efektejä monitoroidessa

### Strategia 4: Input FX vs Master FX
```
Äänittäessä:
- Poista raskaat pluginit (synth, reverb) recording-raidoilta
- Tai käytä "Record: Disable input buffering" -asetusta
- Lisää efektit JÄLKIKÄTEEN miksausvaiheessa
```

## Monitorointiraidan ja DI-signaalin oikeaoppinen äänitys

### Kitaran DI + Amp-simulaatio -äänitys

**Tavoite:** Äänittää puhdas DI-signaali JA kuunnella amp-soundia reaaliajassa.

**Menetelmä 1: Kaksi raitaa (suositeltu)**
```
Raita 1: "Guitar DI" (puhdas signaali)
├── Input: Interface Hi-Z input
├── Record: Input (ei monitoroi)
├── Ei efektejä
└── Tämä on "varmuuskopio" jota voi re-ampata myöhemmin

Raita 2: "Guitar Monitor" (kuuntelu)
├── Input: Sama input kuin DI-raita
├── Monitor: ON
├── FX: Emissary → NadIR (tai muu amp sim)
└── ÄLKÄÄ äänittäkö tätä (vain monitorointiin)
```

**Askel askeleelta:**
1. Luo raita "Guitar DI" → aseta input → ARM recording → Monitor: OFF
2. Luo raita "Guitar Monitor" → sama input → Monitor: ON → lisää amp sim
3. Guitar Monitor -raitaa EI äänitetä (ei ARM)
4. Paina Record → DI-raita äänittää puhtaan signaalin
5. Kuulet amp-soundin Guitar Monitor -raidasta

**Menetelmä 2: Input FX (yksinkertaisempi)**
```
Raita: "Guitar"
├── Input: Interface Hi-Z input
├── Record: Input (ei efektejä äänittäessä)
├── Monitor FX: Amp sim (kuuluu monitoroidessa)
└── Äänitetään PUHDAS DI, monitoroidaan efektien kanssa
```

**REAPER Input FX -asetus:**
1. Klikkaa raidan FX-nappia
2. Lisää efekti normaalisti
3. Äänitetty signaali on PUHDAS (ennen efektejä) jos "Record: Input" on valittuna

### Laulun äänittäminen monitoroinnilla

**Optimaalinen setup:**
```
Laulu-raita:
├── Input: Mikrofoni-input (Mono)
├── Record: Input
├── Monitor: Tape Auto Style
├── Input FX: Kevyt kompressori (valinnainen)
└── Send: Reverb Bus (monitorointiin, ei äänitetä)
```

**Monitorointi-reverb:**
1. Luo "Reverb Bus" -raita → lisää ReaVerbate
2. Lisää laulu-raitaan Send → Reverb Bus
3. Laulaja kuulee kaikua, mutta äänitetään kuiva signaali

### Latenssin minimointi eri tilanteissa

| Tilanne | Buffer | Monitoring | Huomio |
|---------|--------|------------|--------|
| Kitara DI | 128 | Direct tai Monitor-raita | Amp sim voi lisätä latenssian |
| Laulu | 128-256 | REAPER + reverb send | Tape Auto Style |
| Rummut | 64-128 | Direct monitor | Pieni latenssi kriittistä |
| Synth/MIDI | 256 | REAPER | VSTi latenssi huomioitava |
| Overdub | 128-256 | REAPER | Kuuntele muita raitoja |

### AI-ohjeistus äänitystilanteisiin

Kun käyttäjä sanoo äänittävänsä:
1. **Kysy mitä äänitetään** (kitara, laulu, rummut, basso?)
2. **Tarkista ASIO/buffer** - neuvo säätämään buffer 128-256 tasolle
3. **Monitorointi** - suosittele direct monitoring tai monitor-raitaa
4. **DI-äänitys** - kitaralle/bassolle suosittele aina myös puhdas DI
5. **Efektit** - lisää amp sim monitor-raidalle, ei recording-raidalle
6. **Latenssi** - jos valittaa viiveestä → pienennä buffer / direct monitoring
