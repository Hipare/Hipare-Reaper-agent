# Hipare MCP DSL Commands Reference

## Overview

This document lists all available DSL commands that can be executed through the MCP bridge. These commands control Reaper DAW.

**Important**:
- Always use these exact command names and parameter formats
- All DSL commands use natural language-friendly inputs (track names, not just indices)
- Most commands support flexible track references: index, name, role, or "last"

## Track Commands

### create_track
Creates a new track in the project.
```
Command: create_track
Args: { "name": "Track Name", "role": "guitar|bass|drums|vocals|synth|fx|bus" }
Example: { "name": "Lead Guitar", "role": "guitar" }
```

### rename_track
Renames an existing track.
```
Command: rename_track
Args: { "track": "Track Name or Index", "name": "New Name" }
Example: { "track": "Track 1", "name": "Rhythm Guitar" }
```

### set_volume
Sets track volume in dB.
```
Command: set_volume
Args: { "track": "Track Name", "volume": -6.0 }
Range: -inf to +12 dB
Example: { "track": "Bass", "volume": -3.0 }
```

### set_mute
Mutes or unmutes a track.
```
Command: set_mute
Args: { "track": "Track Name", "mute": true|false }
Example: { "track": "Guitar", "mute": true }
```

### set_solo
Solos or unsolos a track.
```
Command: set_solo
Args: { "track": "Track Name", "solo": true|false }
Example: { "track": "Vocals", "solo": true }
```

### set_color / track_color
Sets track color.
```
Command: set_color
Args: { "track": "Track Name", "color": "#FF0000" }
Format: Hex color code
Example: { "track": "Drums", "color": "#FF5500" }

Common colors:
- Red: #FF0000
- Orange: #FF8800
- Yellow: #FFFF00
- Green: #00FF00
- Blue: #0088FF
- Purple: #8800FF
```

### track_pan
Sets track stereo panning.
```
Command: track_pan
Args: { "track": "Track Name", "pan": 0.5 }
Range: -1.0 (full left) to 1.0 (full right), 0 = center
Example: { "track": "Guitar", "pan": -0.5 }  // Pan 50% left

You can also use text:
- "L50", "R30", "C" (center)
- { "value": 0.5 }, { "relative": -0.2 }
```

### track_arm
Arms/disarms track for recording.
```
Command: track_arm
Args: { "track": "Track Name", "arm": true }
Example: { "track": "Vocals", "arm": true }
```

### track_delete
Deletes a track.
```
Command: track_delete
Args: { "track": "Track Name" }
Example: { "track": "Unused Track" }
```

### track_duplicate
Duplicates a track.
```
Command: track_duplicate
Args: { "track": "Track Name" }
Example: { "track": "Guitar" }
Returns: Creates a copy of the track with all FX and settings
```

### list_tracks
Lists all tracks in the project.
```
Command: list_tracks
Args: {}
Returns: List of track names and indices
```

## FX/Plugin Commands

### add_fx / add_effect
Adds an FX plugin to a track. Automatically maps common effect names to REAPER plugins.
```
Command: add_fx
Args: {
  "track": "Track Name or Index",
  "fx_name": "Effect Name",
  "preset": "Preset Name (optional)"
}

Example: { "track": "Vocals", "fx_name": "compressor" }
Example: { "track": 0, "fx_name": "ReaComp", "preset": "Gentle" }

Common effect names (automatically mapped):
- "reverb", "verb" → ReaVerbate
- "compression", "compressor", "comp" → ReaComp
- "eq", "equalizer" → ReaEQ
- "delay" → ReaDelay
- "chorus" → Chorus
- "distortion" → Distortion
- "limiter" → ReaLimit
- "gate", "noise gate" → ReaGate

You can also use exact REAPER plugin names:
- ReaComp, ReaEQ, ReaDelay, ReaVerbate
- ReaGate, ReaXcomp, ReaLimit, ReaFIR
- JS: 1175 Compressor, JS: Saturation
```

### adjust_effect
Adjust effect parameters.
```
Command: adjust_effect
Args: {
  "track": "Track Name",
  "effect": "Effect Name",
  "setting": "parameter name",
  "value": 0.5
}

Value can be numeric (0.0-1.0) or descriptive:
- "wet", "wetter" → 0.7-0.8
- "dry" → 0.2
- "subtle", "gentle" → 0.3
- "heavy", "strong" → 0.7-0.8

Example: { "track": "Vocals", "effect": "reverb", "setting": "mix", "value": "wet" }
Example: { "track": "Bass", "effect": "compression", "setting": "ratio", "value": 0.6 }
```

### effect_bypass
Bypass or enable effects.
```
Command: effect_bypass
Args: {
  "track": "Track Name",
  "effect": "Effect Name",
  "bypass": true
}

Example: { "track": "Vocals", "effect": "reverb", "bypass": true }
Example: { "track": "Guitar", "effect": "compression", "bypass": false }
```

## Transport Commands

### play
Starts playback.
```
Command: play
Args: {}
```

### stop
Stops playback.
```
Command: stop
Args: {}
```

### record
Starts recording (not yet implemented).
```
Command: record
Args: {}
```

### pause
Pauses playback (not yet implemented).
```
Command: pause
Args: {}
```

## MIDI Commands

### create_midi_pattern
Creates a MIDI pattern with multiple notes on a track (wrapper function).
```
Command: create_midi_pattern
Args: {
  "track": "Track Name",
  "start": 0,         // Start time in seconds
  "length": 4,        // Length in beats
  "notes": [
    { "pitch": 60, "velocity": 100, "start": 0, "duration": 1 },
    { "pitch": 64, "velocity": 100, "start": 1, "duration": 1 },
    { "pitch": 67, "velocity": 100, "start": 2, "duration": 1 }
  ]
}

Example - Create C major arpeggio:
{
  "track": "Piano",
  "start": 0,
  "length": 4,
  "notes": [
    { "pitch": 60, "start": 0, "duration": 1, "velocity": 100 },  // C
    { "pitch": 64, "start": 1, "duration": 1, "velocity": 100 },  // E
    { "pitch": 67, "start": 2, "duration": 1, "velocity": 100 },  // G
    { "pitch": 72, "start": 3, "duration": 1, "velocity": 100 }   // C (octave up)
  ]
}

MIDI Note Numbers:
- C4 (middle C) = 60
- C#/Db = 61
- D = 62
- D#/Eb = 63
- E = 64
- F = 65
- F#/Gb = 66
- G = 67
- G#/Ab = 68
- A = 69
- A#/Bb = 70
- B = 71
- C5 = 72
```

### midi_insert
Low-level MIDI insertion (DSL command).
```
Command: midi_insert
Args: {
  "track": "Track Name",
  "time": "8 bars",
  "midi_data": {
    "notes": [
      { "pitch": 60, "start": 0.0, "length": 0.5, "velocity": 100 },
      { "pitch": 64, "start": 0.5, "length": 0.5, "velocity": 90 }
    ]
  }
}

Note: Use create_midi_pattern wrapper for simpler usage
```

### quantize
Fix timing and rhythm issues.
```
Command: quantize
Args: {
  "items": "selected|all|last",
  "strength": 1.0,
  "grid": "1/16"
}

Grid options: "1/4", "1/8", "1/16", "1/32"
Strength: 0.0 to 1.0 (0% to 100%)

Example: { "items": "selected", "strength": 0.8, "grid": "1/16" }
Example: { "grid": "1/8" }  // Default to selected items, 100% strength
```

### create_chord
Creates a musical chord on a MIDI track.
```
Command: create_chord
Args: {
  "track": "Track Name",
  "chord": "C",       // Chord name (C, Cm, Gmaj7, F#, etc.)
  "start": 0,         // Start time in seconds
  "duration": 4,      // Duration in beats
  "velocity": 80      // Velocity (0-127)
}

Example - Create Cm7 chord:
{ "track": "Piano", "chord": "Cm7", "start": 0, "duration": 4, "velocity": 80 }

Supported chord types:
- major/maj (default): C, D, E, F, G, A, B
- minor/min/m: Cm, Dm, Em, Fm, Gm, Am, Bm
- dim: Cdim, Ddim
- aug: Caug, Daug
- maj7: Cmaj7, Dmaj7
- min7/m7: Cm7, Dm7
- dom7/7: C7, D7, G7
- sus2: Csus2, Dsus2
- sus4: Csus4, Dsus4

Sharp/Flat notation:
- C#, Db (same note)
- F#, Gb (same note)
- etc.

Common chord progressions:
- Pop: C - G - Am - F
- Blues: C7 - F7 - G7
- Jazz: Cmaj7 - Dm7 - Em7 - Fmaj7
```

## Time & Selection Commands

### time_select
Highlight a section of your song for editing.
```
Command: time_select
Args: { "time": "8 bars" }

Time formats:
- Bars: "8 bars", "4 bars"
- Seconds: 10.5 (duration from cursor)
- Special: "selection", "loop", "cursor"
- Range: { "start": 0, "end": 10 }
- Region/Marker: { "region": "Chorus" }, { "marker": "Verse 2" }

Example: { "time": "8 bars" }
Example: { "time": { "start": 0, "end": 16 } }
```

### loop_create
Create a repeating section.
```
Command: loop_create
Args: {
  "track": "Track Name",
  "time": "8 bars",
  "midi": true
}

Example: { "track": "Drums", "time": "4 bars", "midi": true }
```

## Edit Operations

### undo
Undo the last action.
```
Command: undo
Args: {}
```

### split
Split items at cursor position.
```
Command: split
Args: { "position": "cursor" }

Position options: "cursor", "selection", or time in seconds
Example: { "position": "cursor" }
```

### fade
Add fades to selected items.
```
Command: fade
Args: {
  "type": "in|out|cross",
  "duration": 0.1
}

Types: "in", "out", "cross"
Example: { "type": "in", "duration": 0.2 }
Example: { "type": "cross" }
```

### normalize
Normalize audio levels to 0dB.
```
Command: normalize
Args: { "target": "selected" }

Example: { "target": "selected" }
```

### reverse
Reverse audio playback.
```
Command: reverse
Args: { "target": "selected" }

Example: { "target": "selected" }
```

## Project Commands

### save
Save the project.
```
Command: save
Args: { "name": "Optional filename" }

Example: {}  // Save current
Example: { "name": "Final Mix" }  // Save as
```

### render
Render/bounce audio.
```
Command: render
Args: {
  "format": "wav|mp3|flac",
  "what": "project|selection|tracks"
}

Example: { "format": "wav", "what": "project" }
Example: { "format": "mp3" }
```

### get_tempo_info
Check current tempo and time signature.
```
Command: get_tempo_info
Args: {}
Returns: BPM, time signature, position info
```

### set_tempo
Change project tempo.
```
Command: set_tempo
Args: { "bpm": 120 }
Range: 20.0 to 960.0 BPM

Example: { "bpm": 140 }
```

### go_to
Move playhead to position.
```
Command: go_to
Args: { "position": "start|end|<seconds>" }

Position options:
- "start", "beginning", "top"
- "end", "finish"
- Seconds: 30.5
- Marker: { "marker": "Chorus" }

Example: { "position": "start" }
Example: { "position": 45.0 }
```

### record
Start recording.
```
Command: record
Args: {}
```

## Markers & Regions

### marker
Work with markers.
```
Command: marker
Args: {
  "action": "add|delete|create_region|go_to",
  "name": "Marker Name",
  "position": 0.0
}

Actions:
- "add": Create marker at position
- "create_region": Create time range region
- "go_to": Jump to marker by name
- "delete": Remove marker (not yet implemented)

Position formats:
- Seconds: 30.0
- Bars: "16 bars"
- Current cursor: null (default)
- Range: "0-8" (for regions)

Example: { "action": "add", "name": "Verse 1", "position": null }
Example: { "action": "create_region", "name": "Chorus", "position": "8-16" }
Example: { "action": "go_to", "name": "Verse 1" }
```

### region
Create named time regions (alias for marker with create_region).
```
Command: region
Args: {
  "name": "Region Name",
  "position": "start-end"
}

Example: { "name": "Intro", "position": "0-8" }
```

## Routing & Bussing

### create_send
Create audio send between tracks.
```
Command: create_send
Args: {
  "from_track": "Source Track",
  "to_track": "Destination Track",
  "amount": 0.5,
  "pre_fader": false
}

Amount: 0.0 to 1.0 (0% to 100%)
Pre-fader: true for send before fader, false for post-fader

Example: { "from_track": "Vocals", "to_track": "Reverb Bus", "amount": 0.3 }
Example: { "from_track": "Drums", "to_track": "Bus", "amount": 0.5, "pre_fader": true }
```

### create_bus
Create bus track and route multiple tracks to it.
```
Command: create_bus
Args: {
  "name": "Bus Name",
  "source_tracks": "Track pattern or name",
  "add_effect": "Optional effect name"
}

Source tracks can be:
- Single track name: "Vocals"
- Pattern: "all drums", "all guitars"
- Array: ["Track 1", "Track 2"]

Example: { "name": "Drum Bus", "source_tracks": "all drums" }
Example: { "name": "Reverb Bus", "source_tracks": ["Vocals", "Guitar"], "add_effect": "reverb" }
```

### send
Shorthand for creating sends (alias).
```
Command: send
Args: {
  "from": "Source",
  "to": "Destination",
  "amount": 0.5
}
```

## Advanced Track Operations

### select
Select tracks or items.
```
Command: select
Args: {
  "target": "track name or pattern",
  "add": false
}

Target options:
- Track name: "Vocals"
- Pattern: "all drums", "all guitars"
- Special: "all", "none"
Add: true to add to selection, false to replace

Example: { "target": "Drums" }
Example: { "target": "all guitars", "add": true }
```

### group_tracks
Group multiple tracks together.
```
Command: group_tracks
Args: {
  "tracks": ["Track 1", "Track 2", "Track 3"],
  "group_name": "Optional group name"
}

Example: { "tracks": ["Kick", "Snare", "Hi-Hat"], "group_name": "Drums" }
```

### track_color
Set track color (same as set_color).
```
Command: track_color
Args: {
  "track": "Track Name",
  "color": "#FF0000"
}

Common colors:
- Red: #FF0000
- Orange: #FF8800
- Yellow: #FFFF00
- Green: #00FF00
- Blue: #0088FF
- Purple: #8800FF

Example: { "track": "Drums", "color": "#FF5500" }
```

## Command Execution Format

When the AI wants to execute commands, it should output in this format:

### Single Command
```
Komento: create_track
Args: { "name": "Bass", "role": "bass" }
```

### Multiple Commands (chain)
```
Komento: create_track
Args: { "name": "Guitar", "role": "guitar" }

Komento: add_fx
Args: { "track": "Guitar", "fx_name": "ReaComp" }

Komento: set_volume
Args: { "track": "Guitar", "volume": -3.0 }
```

### JSON Mode (for capable models)
```json
{
  "action": "create_track",
  "params": { "name": "Drums", "role": "drums" },
  "explanation": "Creating drum track"
}
```

## Error Handling

If a command fails, the system will return an error message. Common errors:
- "Track not found" - Track name doesn't exist
- "Invalid parameter" - Wrong argument format
- "FX not found" - Plugin name not recognized
- "MCP timeout" - Lua bridge not responding

## Best Practices

1. **Always list_tracks first** to know current project state
2. **Use track names** instead of indices - DSL resolves names automatically
3. **Chain related commands** - multiple commands can be executed in sequence
4. **Use common effect names** - they auto-map to REAPER plugins (comp → ReaComp)
5. **Time can be flexible** - "8 bars", seconds, or special keywords like "cursor"
6. **Natural language works** - "Bass", "last track", "all drums" all resolve correctly

## DSL Command Categories

### Essential Commands (use these most):
- **Tracks**: create_track, list_tracks, set_volume, set_mute, track_delete
- **Transport**: play, stop, go_to
- **FX**: add_fx, adjust_effect, effect_bypass
- **MIDI**: create_midi_pattern, create_chord, quantize

### Advanced Commands:
- **Routing**: create_send, create_bus
- **Editing**: split, fade, normalize, reverse
- **Organization**: marker, region, select, group_tracks
- **Project**: save, render, undo

## MCP Profiles

Different profiles expose different command sets:

| Profile | Commands | Best For | DSL Support |
|---------|----------|----------|-------------|
| DSL Production | ~50 | Most use cases | ✅ Full |
| DSL Minimal | ~20 | Simple tasks | ✅ Core only |
| Groq Essential | ~30 | Free models | ✅ Optimized |
| Full | 600+ | Advanced users | ⚠️ Low-level API |

**Recommendation**: Use DSL profiles for natural language workflow. Only use Full profile if you need direct REAPER API access.

## Notes for AI

### Command Usage:
- **Use DSL commands** (dsl_track_create, dsl_add_effect) - they handle track resolution automatically
- **Track references are flexible**: "Vocals", "last", "track 2", or role-based
- **Effect names auto-map**: "comp" → ReaComp, "reverb" → ReaVerbate, "eq" → ReaEQ
- **Multiple commands OK**: You can send multiple commands - they execute sequentially

### Important Quirks:
- Track indices in REAPER start at **0** (internal), but DSL shows them as **1-based** (user-friendly)
- Time can be: seconds (30.5), bars ("8 bars"), or special ("cursor", "selection")
- MIDI notes: Middle C = 60, each semitone = +1
- Always confirm destructive actions (delete, render, etc.)

### Error Handling:
- If "Track not found" → run list_tracks first
- If "Unknown tool" → check tool name is from DSL profile
- If "MCP timeout" → Lua bridge may not be loaded in REAPER
- If effect not working → use exact REAPER name (ReaComp vs "compression")

### Language:
- Keep explanations in **Finnish** for Finnish users
- Command examples can be in English (universally understood)
