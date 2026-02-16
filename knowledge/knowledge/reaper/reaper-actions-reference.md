# REAPER Action ID Reference

## Overview

REAPER uses Action IDs to identify specific commands. These IDs can be used for:
- Custom keyboard shortcuts
- Scripting and macros
- External control (OSC, MIDI)
- API/MCP integration

## Essential Action IDs

### Transport Controls

| Action | ID | Description |
|--------|-----|-------------|
| Play | 1007 | Start playback |
| Stop | 1016 | Stop playback |
| Pause | 1008 | Pause playback |
| Record | 1013 | Start recording |
| Play/Stop | 40044 | Toggle play/stop |
| Play/Pause | 40073 | Toggle play/pause |
| Go to start | 40042 | Move cursor to project start |
| Go to end | 40043 | Move cursor to project end |
| Toggle repeat/loop | 1068 | Enable/disable loop |
| Tap tempo | 1134 | Tap tempo |

### Track Management

| Action | ID | Description |
|--------|-----|-------------|
| Insert new track | 40001 | Create new empty track |
| Remove tracks | 40005 | Delete selected tracks |
| Duplicate tracks | 40062 | Duplicate selected tracks |
| Set track color | 40357 | Open color dialog |
| Rename last touched | 40696 | Rename track |
| Track record arm toggle | 9 | Arm/disarm selected tracks |
| Mute tracks | 40280 | Mute selected |
| Unmute tracks | 40281 | Unmute selected |
| Solo tracks | 40282 | Solo selected |
| Unsolo tracks | 40283 | Unsolo selected |

### Track Selection

| Action | ID | Description |
|--------|-----|-------------|
| Select all tracks | 40296 | Select all |
| Unselect all tracks | 40297 | Clear selection |
| Select track 1 | 40939 | Select first track |
| Select next track | 40285 | Move selection down |
| Select prev track | 40286 | Move selection up |

### Item/Media Management

| Action | ID | Description |
|--------|-----|-------------|
| Insert media file | 40018 | Import audio/MIDI |
| Insert empty item | 40142 | Create empty item |
| Insert MIDI item | 40214 | Create new MIDI item |
| Split items at cursor | 40012 | Split selected items |
| Delete selected items | 40006 | Remove items |
| Duplicate items | 41295 | Copy items |
| Glue items | 40362 | Combine selected items |
| Rename active take | 40340 | Rename item/take |

### Item Editing

| Action | ID | Description |
|--------|-----|-------------|
| Copy items | 40698 | Copy selection |
| Cut items | 40699 | Cut selection |
| Paste items | 40058 | Paste from clipboard |
| Undo | 40029 | Undo last action |
| Redo | 40030 | Redo action |
| Select all items | 40182 | Select all items |
| Unselect all items | 40289 | Clear item selection |

### FX Management

| Action | ID | Description |
|--------|-----|-------------|
| Show FX chain | 40291 | Open track FX window |
| Show FX browser | 40271 | Open add FX dialog |
| Toggle FX bypass | 40298 | Bypass track FX |
| Delete all FX | 40659 | Remove all track FX |

### View/Navigation

| Action | ID | Description |
|--------|-----|-------------|
| Show mixer | 40078 | Toggle mixer panel |
| Show transport | 40259 | Toggle transport bar |
| Zoom in horizontal | 1012 | Zoom in timeline |
| Zoom out horizontal | 1011 | Zoom out timeline |
| Zoom to fit all | 40295 | Fit project in view |
| Scroll view left | 40138 | Pan view left |
| Scroll view right | 40139 | Pan view right |

### Markers and Regions

| Action | ID | Description |
|--------|-----|-------------|
| Insert marker | 40157 | Add marker at cursor |
| Insert region | 40174 | Add region from selection |
| Go to marker 1 | 40161 | Jump to marker 1 |
| Go to marker 2 | 40162 | Jump to marker 2 |
| Go to next marker | 40172 | Navigate forward |
| Go to prev marker | 40173 | Navigate backward |

### Project Management

| Action | ID | Description |
|--------|-----|-------------|
| New project | 40023 | Create new project |
| Open project | 40025 | Open existing project |
| Save project | 40026 | Save current project |
| Save project as | 40022 | Save with new name |
| Render project | 40015 | Open render dialog |
| Project settings | 40031 | Open project settings |

### Metronome

| Action | ID | Description |
|--------|-----|-------------|
| Toggle metronome | 40364 | Enable/disable click |
| Metronome settings | 40363 | Open metronome options |

### Time Selection

| Action | ID | Description |
|--------|-----|-------------|
| Set time selection start | 40625 | Mark start point |
| Set time selection end | 40626 | Mark end point |
| Remove time selection | 40020 | Clear selection |
| Select all in time selection | 40717 | Select items in range |

### Grid/Snap

| Action | ID | Description |
|--------|-----|-------------|
| Toggle snap | 1157 | Enable/disable snap |
| Toggle grid | 40145 | Show/hide grid |
| Grid: 1/4 note | 40780 | Set quarter note grid |
| Grid: 1/8 note | 40781 | Set eighth note grid |
| Grid: 1/16 note | 40782 | Set sixteenth note grid |

## Track-Specific Actions

### Record Arm by Track Number

| Track | Arm Action ID |
|-------|---------------|
| Track 1 | 25 |
| Track 2 | 33 |
| Track 3 | 41 |
| Track 4 | 49 |
| Track 5 | 57 |
| Track 6 | 65 |
| Track 7 | 73 |
| Track 8 | 81 |

**Pattern:** Track N = 25 + (N-1)*8

### Mute/Solo by Track Number

**Mute Track N:** Base ID varies
**Solo Track N:** Base ID varies

Use "Toggle mute for track N" format in action search.

## MIDI Editor Actions

| Action | ID | Description |
|--------|-----|-------------|
| Open MIDI editor | 40153 | Edit selected MIDI |
| Quantize | 40768 | Quantize selected notes |
| Humanize | 40667 | Add random variation |
| Select all notes | 40003 | Select all in item |
| Delete selected notes | 40002 | Remove notes |
| Transpose +1 | 40177 | Move up semitone |
| Transpose -1 | 40178 | Move down semitone |
| Transpose +12 | 40179 | Move up octave |
| Transpose -12 | 40180 | Move down octave |

## Useful Custom Actions

### Common Workflows

**Quick Bounce/Freeze:**
1. Select track
2. Action 40930 (Freeze track to stereo)

**Render Selected Track:**
1. Select items/tracks
2. Action 41716 (Render selected tracks to stems)

**Toggle Solo Defeat:**
- Action 40286 (Toggle solo defeat)

## Using Actions via API/Scripts

### Lua Script Example
```lua
-- Run action by ID
reaper.Main_OnCommand(40001, 0)  -- Insert new track

-- Run named action
local action_id = reaper.NamedCommandLookup("_ACTION_NAME")
reaper.Main_OnCommand(action_id, 0)
```

### ReaScript (Python)
```python
import reapy

# Run action
reapy.perform_action(40001)  # Insert new track
```

## Finding Action IDs

### In REAPER
1. Actions → Show action list (or press ?)
2. Search for action
3. ID shown in Command ID column

### Action List Sections
- Main
- Main (alt recording)
- MIDI Editor
- MIDI Event List Editor
- Media Explorer
- Inline MIDI Editor

## SWS Extension Actions

If SWS Extension installed, additional actions available:

| Action | Command | Description |
|--------|---------|-------------|
| Select children | SWS: Select children of selected folder track(s) | Select folder contents |
| Vertical zoom to selected | SWS: Vertical zoom to selected tracks | Fit selected |
| Save/Load track templates | SWS: Various | Template management |

## Notes for AI Integration

### Important Considerations

1. **Action availability:** Some actions require specific conditions (track selected, item selected, etc.)

2. **State checking:** Before running actions, verify prerequisites are met

3. **Undo handling:** Most actions are undoable; some are not

4. **Context:** Actions behave differently depending on focus (arrange, mixer, MIDI editor)

### Commonly Needed Sequences

**Create track and add FX:**
```
1. 40001 (Insert track)
2. 40271 (Show FX browser)
```

**Record setup:**
```
1. 40001 (Insert track)
2. Set input (requires API, not just action)
3. 9 (Arm track)
4. 1013 (Record)
```

**Export workflow:**
```
1. Select time range or project
2. 40015 (Open render dialog)
3. Configure settings
4. Render
```

## Action Naming Conventions

REAPER action names follow patterns:

- `Track:` - Track-related
- `Item:` - Media item related
- `Transport:` - Playback/recording
- `View:` - Display/navigation
- `FX:` - Effects/plugins
- `MIDI:` - MIDI operations
- `File:` - Project/file management
- `Options:` - Settings/preferences

## Quick Reference Card

### Most Used Actions

| Shortcut | Action | ID |
|----------|--------|-----|
| Space | Play/Stop | 40044 |
| R | Record | 1013 |
| S | Split | 40012 |
| M | Insert marker | 40157 |
| F | Show track FX | 40291 |
| Ctrl+T | New track | 40001 |
| Ctrl+S | Save | 40026 |
| Ctrl+Z | Undo | 40029 |
| Delete | Delete selected | 40006 |
