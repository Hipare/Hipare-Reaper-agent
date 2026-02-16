# AI Recording Assistant Guide

## Overview

This guide tells the AI how to use the user's studio setup information to provide personalized recording assistance.

## When Recording is Mentioned

When the user mentions recording ("äänittää", "nauhoittaa", "recording", "rec"), the AI should:

1. **Check Studio Setup** - Read user's saved equipment
2. **Ask What to Record** - Which instrument?
3. **Provide Specific Guidance** - Based on their actual equipment
4. **Open Relevant REAPER Views** - Meters, mixer, etc.
5. **Guide Gain Staging** - For their specific interface/instrument combo

## Parsing Studio Setup Information

The user's studio setup is stored in text format. Look for:

### Audio Interface Detection
```
Keywords: scarlett, focusrite, presonus, behringer, motu, ssl, umc, audiobox
Extract: Model name for specific gain/latency guidance
```

### Guitar Detection
```
Keywords: strat, tele, les paul, sg, ibanez, jackson, agile, 7-string, 8-string
Pickup keywords: emg, active, passive, humbucker, single coil, p90
Extract: Guitar type and pickup type for gain staging
```

### Bass Detection
```
Keywords: p-bass, j-bass, precision, jazz bass, stingray, active bass
Extract: Bass type and active/passive status
```

### Microphone Detection
```
Keywords: sm57, sm58, sm7b, at2020, rode nt1, condenser, dynamic, ribbon
Extract: Mic type for phantom power and gain guidance
```

### Keyboard Detection
```
Keywords: piano, synth, midi controller, keyboard, keys
Extract: Whether audio or MIDI recording needed
```

## Recording Workflow with User's Equipment

### Step 1: Greet and Identify
```
When user says they want to record:

AI: "Mitä haluat äänittää tänään? Näen että sinulla on:
- [User's interface]
- [User's guitar/bass/mic]
Valitse instrumentti niin autan sinua äänitysasetuksissa!"
```

### Step 2: Create Recording Setup
```
Based on instrument chosen:

KITARA:
1. "Luon sinulle DI-raidan ja monitor-raidan..."
2. Use create_track for "Guitar DI"
3. Use create_track for "Guitar Monitor"
4. Set appropriate input
5. Add amp sim to monitor track (if user has one in VSTs)

BASSO:
1. Similar to guitar setup
2. Recommend bass-specific amp sim

LAULU:
1. Create single track with appropriate monitoring
2. Remind about phantom power if condenser
3. Add reverb send for monitoring comfort

KOSKETTIMET:
1. Ask: audio, MIDI, or both?
2. Create stereo track if audio
3. Create MIDI track with VSTi if MIDI only
```

### Step 3: Gain Staging Guidance
```
Based on user's interface AND instrument:

SCARLETT 2i2 + PASSIVE GUITAR (like Agile with Cepheus):
- "Laita gain noin kello 10-11 kohdalle"
- "Tavoittele -12dB piikkejä REAPERissa"
- "Käytä direct monitor -kytkintä nollaviiveelle"

SCARLETT 2i2 + ACTIVE GUITAR (EMG etc):
- "Laita gain alas, noin kello 9 kohdalle - aktiiviset mikit ovat todella kuumia!"
- "Tavoittele -15 to -12dB"
- "Varo klippausta"

SCARLETT 2i2 + CONDENSER MIC:
- "Phantom power 48V PÄÄLLE"
- "Gain noin kello 10-12"
- "Käytä pop-filtteriä"
```

### Step 4: Open REAPER Views
```
AI should offer to open helpful views:

"Avataanko REAPER:iin:
□ Mixer (tasot näkyviin)
□ Track meters (input-monitorointi)
□ Metronomi (tempo)"

Use DSL commands:
- open_mixer_window
- set_track_selected for the recording track
- set_metronome_enabled
```

### Step 5: Monitor During Recording
```
AI can remind:
- "Soita äänekäs kohta ja tarkista ettei mittari mene punaiselle"
- "Jos näet clipping-valon, laske interfacen gainia"
- "Vihreä = hyvä, keltainen = rajalla, punainen = klippaa"
```

## Equipment-Specific Tips Database

### Scarlett Solo/2i2 3rd Gen + Agile 8-String (Cepheus Passive)
```
Recommended Settings:
├── Interface gain: 10-11 o'clock
├── Buffer: 128 samples
├── Direct monitor: ON for tracking
├── REAPER track monitor: OFF (use direct)
├── Target peaks: -12dB
├── Hi-Z input: Use front panel

Amp Sim Recommendations:
├── Neural DSP (if owned) - best for modern metal
├── Emissary (free) - good high gain
├── ML Sound Lab (paid) - tight response
├── ToneLib GFX (free) - decent all-around

EQ for 8-String:
├── High-pass at 60-80Hz (remove F# rumble)
├── Cut 250-300Hz (reduce mud)
├── Boost 2-4kHz (attack and clarity)
└── May need multiband compression

Special Notes:
├── Cepheus = high output PASSIVE (not quite active hot)
├── 28"+ scale = naturally tight low end
├── Watch lowest strings for preamp overload
└── Record DI clean, process later
```

### Generic Interface + Humbucker Guitar
```
Gain: 10-11 o'clock
Target: -12dB peaks
Noise: Minimal (humbuckers are quiet)
Amp sim: Mesa/Marshall style for rock/metal
```

### Generic Interface + Single Coil Guitar
```
Gain: 11-1 o'clock (lower output)
Target: -12dB peaks
Noise: May need noise gate (60Hz hum normal)
Amp sim: Fender/Vox style for clean/crunch
```

### Generic Interface + Active Bass
```
Gain: 9-10 o'clock (HOT signal!)
Target: -15 to -12dB peaks
Note: Check battery before session
Amp sim: Sansamp style, Ampeg SVX
```

### Generic Interface + Condenser Mic
```
Phantom: 48V ON (required!)
Gain: 10-12 o'clock
Target: -18 to -12dB peaks
Distance: 6-12 inches with pop filter
Room: Minimize reflections
```

## REAPER Actions for Recording Setup

### Create Recording Track
```
DSL: create_track with name "Guitar DI"
Set input to interface channel
Arm for recording
Set monitoring mode
```

### Create Monitor Track
```
DSL: create_track with name "Guitar Monitor"
Same input as DI track
Monitor ON
Add amp sim FX
DO NOT arm for recording
```

### Open Helpful Views
```
Actions:
- 40078: Open mixer
- 40026: View > Track waveforms
- 40077: Toggle metronome
```

### Check Levels
```
Visual:
- Green meters = good
- Yellow/orange = getting hot
- Red = clipping (bad!)

REAPER meters show dBFS:
- -12dB to -6dB peaks = ideal
- 0dB = digital clip (distortion)
```

## Common Recording Issues and Solutions

### "Kuulen viivettä" (Latency)
```
1. Pienennä bufferia (128 → 64)
2. Käytä direct monitoring -toimintoa
3. Aseta REAPER-raidan monitorointi OFF jos käytät direct monitoria
4. Varmista että käytät ASIO-ajuria
```

### "Signaali klippaa" (Clipping)
```
1. Laske interfacen gainia
2. Varmista ettei kitaran volume ole täysillä (aktiivi)
3. Tarkista Input FX - onko gainia liikaa?
4. Varmista Hi-Z vs Line oikein
```

### "Ei kuulu mitään" (No Signal)
```
1. Onko kaapeli kytketty?
2. Onko raita armeerattu (punainen nappi)?
3. Onko oikea input valittu?
4. Phantom power kondensaattorimikille?
5. Onko interfacen gain nollassa?
```

### "Kuuluu surinaa" (Hum/Noise)
```
1. Single coil -kitara? Normaalisti hieman surinaa
2. Kokeile kääntää kitaraa eri asentoon
3. Käytä noise gatea
4. Tarkista maadoitus
5. Sammuta valaisimet/monitorit häiriölähteinä
```

## AI Response Templates

### Recording Request Detected
```
"Hei! Näen studio setupistasi että sinulla on [interface] ja [instrument].

Mitä haluat äänittää tänään?
1. 🎸 Kitara
2. 🎸 Basso
3. 🎤 Laulu
4. 🎹 Koskettimet
5. 🥁 Muuta

Valitse niin luon sinulle sopivan äänityssetupin!"
```

### After Instrument Selection
```
"Loistava! Luon sinulle [instrument]-äänitysraidan.

[Interface]-interfacellasi suosittelen:
• Gain: [specific recommendation]
• Buffer: 128 samples (matala latenssi)
• Direct monitor: PÄÄLLÄ

Haluatko että avaan myös mixerin tasojen seurantaan?"
```

### During Recording Guidance
```
"Kaikki valmista! Muista:
• Soita äänekäin kohta ja tarkista tasot
• Vihreä = OK, punainen = liian kovaa
• [Interface] direct monitor antaa nollaviiveen
• DI-raita äänittää puhtaan signaalin

Paina R kun olet valmis äänittämään!"
```
