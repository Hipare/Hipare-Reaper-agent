# REAPER Comprehensive Guide for AI Assistants

## Overview

REAPER (Rapid Environment for Audio Production, Engineering, and Recording) is a professional digital audio workstation (DAW) known for its flexibility, efficiency, and extensive customization options. This guide provides AI assistants with comprehensive knowledge to help users effectively.

## Key REAPER Concepts

### Project Structure
```
Project (.rpp file)
├── Tracks (audio, MIDI, folders)
│   ├── Items (audio clips, MIDI items)
│   │   └── Takes (multiple recordings)
│   ├── FX Chain (plugins)
│   └── Sends/Receives (routing)
├── Master Track
├── Markers & Regions
└── Tempo/Time Signature Map
```

### File Types
| Extension | Description |
|-----------|-------------|
| .rpp | REAPER Project file |
| .rpp-bak | Project backup |
| .rpp-undo | Undo history |
| .RPP-PROX | Proxy/peak files |
| .reapeaks | Waveform peak cache |

## User Interface Components

### Main Window Areas

**1. Track Control Panel (TCP)**
- Left side of arrange view
- Track name, volume, pan, mute, solo
- Record arm button
- FX button
- I/O routing button

**2. Arrange View**
- Main editing area
- Media items displayed as waveforms/MIDI
- Timeline at top
- Grid lines for alignment

**3. Mixer Control Panel (MCP)**
- Traditional mixer view (View → Mixer)
- Faders, meters, pan
- FX slots
- Sends/receives

**4. Transport Bar**
- Play, Stop, Pause, Record buttons
- Timeline position
- Tempo and time signature
- Loop toggle

**5. Toolbar**
- Customizable buttons
- Quick access to common functions

### Essential Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| Play/Stop | Space | Toggle playback |
| Record | Ctrl+R | Start recording |
| Save | Ctrl+S | Save project |
| Undo | Ctrl+Z | Undo last action |
| Redo | Ctrl+Shift+Z | Redo action |
| Split Item | S | Split at edit cursor |
| Delete | Delete | Remove selected |
| Zoom In | + / Scroll | Zoom timeline |
| Zoom Out | - / Scroll | Zoom out |
| Toggle Mixer | Ctrl+M | Show/hide mixer |
| FX Window | F | Open FX for selected track |

## Track Management

### Track Types

**Audio Tracks:**
- Record and play audio
- Support mono, stereo, multichannel
- Can contain multiple items/takes

**MIDI Tracks:**
- Record and play MIDI data
- Connect to virtual instruments
- Support multiple channels

**Folder Tracks:**
- Organize tracks hierarchically
- Sum child tracks automatically
- Apply bus processing

### Creating Tracks

**Methods:**
1. Double-click empty area in TCP
2. Ctrl+T (Insert new track)
3. Right-click → Insert new track
4. Insert → New track

**Track Properties:**
- Right-click track → Track properties
- Set name, color, icon
- Configure I/O routing
- Set recording input

### Track Colors

**Setting Colors:**
1. Select track(s)
2. Right-click → Track color
3. Choose custom color or preset

**Color Organization Tips:**
- Drums: Red/Orange
- Bass: Blue
- Guitars: Green
- Vocals: Yellow/Gold
- Keys/Synths: Purple
- FX/Aux: Gray

## Media Items

### Item Basics

**Items** are containers for audio or MIDI data on tracks.

**Creating Items:**
- Record audio/MIDI
- Import media (Insert → Media file)
- Drag files from explorer
- Create empty item (Insert → Empty item)

### Item Editing

**Selection:**
- Click to select
- Ctrl+Click for multiple
- Drag to marquee select

**Moving:**
- Drag to move
- Hold Ctrl to copy
- Snap to grid (S to toggle)

**Splitting:**
- Position cursor, press S
- Razor editing for non-destructive

**Trimming:**
- Drag edges
- Hold Alt for slip editing
- Use fade handles

### Takes

**Takes** are multiple recordings within one item (comping).

**Recording Takes:**
1. Enable track record arm
2. Record → Records new take
3. Cycle through with T key

**Comping Workflow:**
1. Split items at phrase boundaries
2. Click to choose best take per section
3. Glue when satisfied (Ctrl+Shift+G)

## FX (Effects) Management

### Adding FX

**Methods:**
1. Click FX button on track
2. Press F with track selected
3. Drag plugin to track

**FX Browser:**
- Search by name
- Filter by type (VST, VST3, JS, CLAP)
- Favorites for quick access
- Folders for organization

### FX Chain

**Order Matters:**
```
Input → [Gate] → [EQ] → [Compression] → [Saturation] → [Modulation] → [Delay] → [Reverb] → Output
```

**Managing Chain:**
- Drag to reorder
- Right-click for options
- Bypass individual FX
- Save chains as presets

### REAPER's Built-in FX (ReaPlugs)

| Plugin | Purpose | Key Uses |
|--------|---------|----------|
| ReaEQ | Parametric EQ | Surgical cuts, broad shaping |
| ReaComp | Compressor | Dynamics control |
| ReaXcomp | Multiband comp | Mastering, de-essing |
| ReaDelay | Delay | Echo, doubling |
| ReaVerbate | Reverb | Space, ambience |
| ReaGate | Noise gate | Remove bleed, tighten |
| ReaFIR | FFT EQ/Dynamics | Noise reduction, matching |
| ReaTune | Pitch correction | Tuning vocals |
| ReaPitch | Pitch shift | Harmonies, effects |
| ReaLimit | Limiter | Mastering, protection |

### FX Sends and Parallel Processing

**Creating FX Send:**
1. Create new track for FX (e.g., "Reverb Bus")
2. Add reverb plugin, 100% wet
3. On source track, click Route button
4. Add send to FX track
5. Adjust send level

**Benefits:**
- Multiple tracks share one reverb
- CPU efficient
- Consistent sound
- Easy to adjust

## Routing

### Basic Signal Flow
```
Track Input → Track FX → Track Fader → 
  → Parent/Folder (if applicable)
  → Sends (pre/post fader)
  → Master Track → Hardware Output
```

### Hardware I/O

**Setting Input:**
1. Click track I/O button (or Route button)
2. Select input from dropdown
3. Mono or stereo
4. Arm track for recording

**Setting Output:**
- Default: Master/Parent send
- Can route to specific hardware outputs
- Useful for headphone mixes, stems

### Sends

**Types:**
- **Pre-Fader:** Signal before volume fader (for FX)
- **Post-Fader:** Signal after fader (follows mix)
- **Pre-FX:** Before any processing

**Creating Sends:**
1. Drag from track's Route button to destination
2. Or use routing dialog

### Sidechaining

**For Compression Sidechaining:**
1. Add compressor to track (e.g., bass)
2. Create send from trigger track (kick) to bass
3. In compressor, enable sidechain input
4. Select send as sidechain source

**In ReaComp:**
- Detector input dropdown
- Select auxiliary input
- Adjust threshold to trigger

## Recording

### Basic Recording Setup

**Step 1: Audio Device**
```
Options → Preferences → Audio → Device
- Select audio interface
- Set sample rate (44100, 48000, 96000)
- Set buffer size (lower = less latency, more CPU)
```

**Step 2: Create Track**
- Insert new track
- Name it appropriately

**Step 3: Set Input**
- Click I/O button
- Select input channel(s)
- Mono or stereo

**Step 4: Arm and Monitor**
- Click record arm button (red circle)
- Enable monitoring (speaker icon)
- Check levels (aim for -18 to -12 dBFS peaks)

**Step 5: Record**
- Press Record or Ctrl+R
- Perform
- Press Stop or Space

### Recording Modes

**Normal:** Creates new item each recording

**Takes (comping):** 
- Records to same item
- Multiple takes for comping
- Options → Recording → "Record mode: Normal" vs "Time selection auto punch"

**Overdub:** Records over existing, mixing together

**Replace:** Records over, replacing existing

### Punch Recording

**Time Selection Punch:**
1. Make time selection (drag on timeline)
2. Enable "Auto-punch selected area" 
3. Start playback before selection
4. Recording starts/stops at selection boundaries

**Manual Punch:**
- Start playback
- Press Record to punch in
- Press Record again to punch out

### Monitoring

**Monitor Modes:**
- **Off:** No input monitoring
- **On:** Always hear input
- **Auto:** Hear input when record-armed, playback when not

**Dealing with Latency:**
- Use direct monitoring on interface
- Reduce buffer size
- Use REAPER's latency compensation

## MIDI

### MIDI Setup

**Configure MIDI Devices:**
```
Options → Preferences → MIDI Devices
- Enable inputs (keyboard, controller)
- Enable outputs (if using external synth)
```

### Recording MIDI

1. Create track
2. Add virtual instrument (VSTi)
3. Arm track
4. Enable MIDI input
5. Record

### MIDI Editor

**Opening:** Double-click MIDI item

**Editor Components:**
- Piano roll (note display)
- Velocity lane
- CC lanes (modulation, expression, etc.)
- Note list

**Editing Notes:**
- Draw with pencil tool
- Select and move
- Resize by dragging edges
- Velocity: drag bottom of notes

### Quantization

**Quantize MIDI:**
1. Select notes
2. Edit → Quantize (Q)
3. Choose grid value
4. Set strength (100% = perfect, less = more human)

**Humanize:**
- Edit → Humanize
- Adds random timing/velocity variation

### Virtual Instruments

**Loading VSTi:**
1. Create track
2. Add FX → Choose instrument
3. Instrument appears in FX chain
4. MIDI routed automatically

**Popular Free VSTi:**
- Vital (wavetable synth)
- Surge XT (hybrid synth)
- Dexed (FM synth)
- Spitfire LABS (orchestral)
- Piano One (piano)

## Mixing in REAPER

### Gain Staging

**Recommended Levels:**
```
Recording: Peak at -18 to -12 dBFS
Mixing: Keep headroom, peaks around -6 dBFS
Pre-master: Peak around -6 to -3 dBFS
```

**Setting Gain:**
- Use item volume (Ctrl+drag)
- Track fader for mix level
- Trim/gain plugin at start of chain

### Metering

**REAPER Meters:**
- Track meters in TCP/MCP
- Master meter
- JS: Loudness Meter (for LUFS)

**Reading Meters:**
- Green: Safe (-∞ to -12 dB)
- Yellow: Loud (-12 to -3 dB)
- Red: Clipping (0 dB+)

### Panning

**Stereo Panning:**
- Drag pan knob in TCP/MCP
- Double-click to center
- Right-click for pan law options

**Width Control:**
- Use width control on stereo tracks
- Or use JS: Stereo Width plugin

### Automation

**Creating Automation:**
1. Show envelope (V with track selected)
2. Choose parameter
3. Draw with pencil or record

**Recording Automation:**
1. Put track in Write mode
2. Play and move controls
3. Switch to Read mode when done

**Automation Modes:**
- Trim/Read: Plays existing
- Read: Plays, ignores changes
- Touch: Records only while touching
- Latch: Records until stop
- Write: Records, erasing previous

### Grouping

**Track Groups:**
- Select tracks
- Ctrl+G to group
- Linked: Volume, pan, mute, solo

**Edit Groups:**
- Items move together
- Useful for multitrack drums

## Mastering Basics

### Master Track

**Accessing:**
- Always visible in mixer
- View → Master track in TCP

**Master Chain Example:**
```
1. Metering (reference)
2. EQ (gentle shaping)
3. Compression (glue, 2:1, 1-2 dB GR)
4. Saturation (warmth, optional)
5. Limiter (ceiling, loudness)
6. Metering (final check)
```

### Loudness Standards

| Platform | Target LUFS | True Peak |
|----------|-------------|-----------|
| Streaming (Spotify, Apple) | -14 LUFS | -1 dBTP |
| YouTube | -14 LUFS | -1 dBTP |
| Broadcast (EU) | -23 LUFS | -1 dBTP |
| CD/Vinyl | -9 to -12 LUFS | -0.3 dBTP |

### Rendering/Exporting

**Render Dialog (Ctrl+Alt+R):**

**Settings:**
- Source: Master mix
- Bounds: Entire project or time selection
- Directory: Output folder
- File name: Use wildcards ($track, $project)

**Format Options:**
| Format | Use Case |
|--------|----------|
| WAV 24-bit | Master, stems, archive |
| WAV 16-bit | CD |
| MP3 320kbps | Distribution, preview |
| FLAC | Lossless distribution |

**Render to:**
- Single file (stereo mix)
- Stems (separate tracks)
- Regions (multiple songs)

## Project Organization

### Folder Structure
```
Project Name/
├── Project Name.rpp
├── Audio/
│   ├── Drums/
│   ├── Bass/
│   ├── Guitars/
│   └── Vocals/
├── MIDI/
├── Bounces/
└── Exports/
```

### Track Organization

**Recommended Order:**
1. Drums (folder)
   - Kick, Snare, Toms, OH, Room
2. Bass
3. Guitars (folder)
4. Keys/Synths (folder)
5. Vocals (folder)
   - Lead, Doubles, Harmonies, FX
6. FX Returns
7. Bus/Groups

### Using Folders

**Creating Folder:**
1. Create track
2. Right-click → Set to folder

**Adding Children:**
- Drag tracks into folder
- Indent automatically applied

**Benefits:**
- Collapse to save space
- Apply processing to group
- Automatic summing

## Troubleshooting Common Issues

### Audio Issues

**No Sound:**
1. Check audio device settings
2. Check track output routing
3. Check master output
4. Unmute tracks
5. Check monitoring settings

**Crackling/Dropouts:**
1. Increase buffer size
2. Close other applications
3. Check CPU usage
4. Freeze heavy tracks

**Latency:**
1. Reduce buffer size
2. Use direct monitoring
3. Disable unnecessary plugins

### MIDI Issues

**No MIDI Input:**
1. Check MIDI device in Preferences
2. Enable device
3. Set track input to MIDI
4. Arm track

**No Sound from VSTi:**
1. Check instrument loaded
2. Check MIDI routing
3. Check instrument output
4. Check track output

### Plugin Issues

**Plugin Not Appearing:**
1. Rescan plugins (Preferences → Plugins → Re-scan)
2. Check plugin format (VST2/3, CLAP)
3. Check 32/64-bit compatibility

**Plugin Crashing:**
1. Update plugin
2. Try different plugin version
3. Check for conflicts

## Performance Optimization

### CPU Management

**Reducing CPU Load:**
1. Freeze tracks with heavy plugins
2. Use offline processing when possible
3. Increase buffer size for mixing
4. Disable unused plugins
5. Use track templates with conservative settings

**Freezing Tracks:**
- Right-click track → Freeze
- Renders track with FX
- Dramatically reduces CPU
- Unfreeze to edit

### Project Size Management

**Reducing File Size:**
1. Remove unused takes
2. Clean project directory
3. Use project consolidate
4. Delete unused media

## Best Practices Summary

### Recording
- Record at 24-bit
- Leave headroom (-18 to -12 dBFS peaks)
- Use proper gain staging
- Label takes immediately
- Save frequently

### Editing
- Non-destructive editing preferred
- Use fades on all edits
- Crossfade overlapping items
- Keep original files

### Mixing
- Start with gain staging
- Work in solo sparingly
- Reference frequently
- Take breaks
- Check in mono

### Exporting
- Render 24-bit WAV master
- Create stems for backup
- Include project file in archive
- Document session settings
