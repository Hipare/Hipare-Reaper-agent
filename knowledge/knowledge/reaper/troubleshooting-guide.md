# Troubleshooting Guide and FAQ for REAPER

## Common Problems and Solutions

### Audio Issues

#### No Sound Output

**Symptoms:** Playback but no audio heard

**Checklist:**
```
1. Check REAPER audio device:
   Options → Preferences → Audio → Device
   - Correct interface selected?
   - Sample rate matches interface?

2. Check master output routing:
   - Master track not muted?
   - Output routed to correct channels?

3. Check track routing:
   - Tracks not muted?
   - Output to Master/Parent enabled?

4. Check external:
   - Interface powered on?
   - Monitor speakers/headphones connected?
   - Volume up on interface and speakers?

5. Check Windows/Mac audio:
   - Correct default device?
   - Volume not muted in OS?
```

**Solutions:**
- Reset audio device (toggle off/on in Preferences)
- Try different audio system (WASAPI vs ASIO)
- Restart REAPER
- Restart computer

#### Crackling, Popping, Dropouts

**Symptoms:** Audio breaks up, clicks and pops during playback

**Causes and Solutions:**

| Cause | Solution |
|-------|----------|
| Buffer too small | Increase buffer size |
| CPU overload | Freeze tracks, reduce plugins |
| Sample rate mismatch | Match REAPER to interface |
| Driver issues | Update audio drivers |
| Background apps | Close unnecessary programs |
| USB issues | Try different USB port |
| Power settings | Set high performance mode |

**Buffer Size Guide:**
```
Recording: 128-256 samples
Mixing: 512-1024 samples
Heavy mixing: 1024-2048 samples
```

#### High Latency

**Symptoms:** Delay between playing and hearing

**Solutions:**
```
1. Reduce buffer size (at cost of CPU)
2. Use direct/hardware monitoring on interface
3. Enable REAPER's low latency mode:
   Options → Preferences → Audio → Recording
   Check "Use low latency mode while recording"
4. Disable input FX while recording
```

### Recording Issues

#### No Input Signal

**Symptoms:** Meter shows nothing when playing/singing

**Checklist:**
```
1. Input selection:
   - Correct input chosen in track I/O?
   - Track armed for recording?

2. Hardware:
   - Mic/instrument connected?
   - Phantom power ON (for condensers)?
   - Gain up on interface?
   - Input not muted on interface?

3. Cable check:
   - Cable working?
   - Correct input jack used?

4. REAPER settings:
   - Input enabled in Preferences → Audio → MIDI?
   - Correct audio device selected?
```

#### Recording Clips/Distorts

**Symptoms:** Red meters, distorted recording

**Solutions:**
```
1. Reduce interface preamp gain
2. Back away from microphone
3. Use pad switch on mic (if available)
4. Use pad switch on interface input
5. Check for clipping in signal chain
```

#### Wrong Take/Wrong Track

**Symptoms:** Recording to unexpected location

**Check:**
```
- Only intended tracks armed?
- Correct time selection for punch recording?
- Recording mode correct (Normal vs Time Selection)?
```

### Plugin Issues

#### Plugin Not Appearing

**Symptoms:** Installed plugin doesn't show in FX browser

**Solutions:**
```
1. Check plugin format (VST2/VST3/CLAP/AU):
   Options → Preferences → Plug-ins → VST
   
2. Add correct path to VST folders

3. Re-scan plugins:
   Options → Preferences → Plug-ins → VST → Re-scan

4. Check 32-bit vs 64-bit:
   - REAPER 64-bit needs 64-bit plugins
   - Use jBridge for 32-bit plugins (if needed)

5. Check plugin installation:
   - Actually installed?
   - Correct folder?
```

#### Plugin Causes Crash

**Symptoms:** REAPER crashes when loading plugin

**Solutions:**
```
1. Update plugin to latest version
2. Run REAPER in safe mode:
   Hold Shift while starting
3. Clear plugin cache:
   Options → Preferences → Plug-ins → Clear cache
4. Remove problem plugin from FX folder
5. Check for known issues (plugin website)
```

#### Plugin Window Doesn't Open

**Symptoms:** Click FX button, nothing appears

**Solutions:**
```
1. Check if window is off-screen:
   - Drag from different edge
   - Reset window positions (SWS extension)
2. Close and reopen FX window
3. Check plugin GUI settings
4. Reinstall plugin
```

### MIDI Issues

#### No MIDI Input

**Symptoms:** MIDI controller not registering

**Checklist:**
```
1. MIDI device setup:
   Options → Preferences → Audio → MIDI Devices
   - Device listed?
   - Device enabled?

2. Track setup:
   - MIDI input selected?
   - Track armed?
   - Virtual instrument loaded?

3. Hardware:
   - Controller connected and powered?
   - MIDI USB working?
```

#### No Sound from Virtual Instrument

**Symptoms:** MIDI records but no audio output

**Solutions:**
```
1. Check VSTi loaded correctly:
   - Open FX chain
   - VSTi showing?
   
2. Check MIDI routing:
   - Track set to receive MIDI?
   - Correct MIDI channel?

3. Check VSTi output:
   - Instrument not muted internally?
   - Volume up in VSTi?
   - Patch/preset loaded?

4. Check track output:
   - Track outputs to Master?
   - Track not muted?
```

### Project Issues

#### Project Won't Open

**Symptoms:** Error when loading .rpp file

**Solutions:**
```
1. Try backup file (.rpp-bak)
2. Try earlier auto-save version
3. Open as text:
   - .rpp is plain text
   - Can manually fix issues
4. Check for missing media:
   - Project may reference moved/deleted files
```

#### Missing Media Files

**Symptoms:** Items show as offline/missing

**Solutions:**
```
1. Locate media:
   Right-click item → Source properties → Browse

2. Batch locate:
   File → Project media/fx → Media Item → Select offline
   Right-click → Set item offline/online

3. Prevention:
   - Use "Copy all media to project" when saving
   - Keep project folder organized
```

#### Project File Too Large

**Symptoms:** Large .rpp file, slow loading

**Causes:**
```
- Embedded media
- Large undo history
- Many automation points
```

**Solutions:**
```
1. Options → Preferences → General
   Reduce undo history limit

2. Save project without undo:
   File → Save project as... 
   Options → "Clear undo history on save"

3. Glue items to reduce takes

4. Delete unused media
```

### Performance Issues

#### High CPU Usage

**Symptoms:** Meter shows high CPU, audio problems

**Solutions:**
```
1. Increase buffer size
2. Freeze tracks with heavy plugins
3. Use offline processing where possible
4. Reduce plugin count
5. Close other applications
6. Check for plugin problems (disable one by one)
```

**Freezing Tracks:**
```
Right-click track → Freeze track
- Renders audio with FX
- Dramatically reduces CPU
- Unfreeze to edit later
```

#### High Memory Usage

**Symptoms:** REAPER using lots of RAM

**Solutions:**
```
1. Unload unused sample libraries
2. Use disk streaming for samplers
3. Reduce REAPER's media buffer
4. Close unused project tabs
```

### Routing Issues

#### Feedback Loop

**Symptoms:** Loud squeal, uncontrolled noise

**Immediate Action:** Lower master fader or mute!

**Causes:**
```
- Send to self
- Circular routing
- Monitor feedback (hardware)
```

**Prevention:**
```
- Check routing diagram
- Use pre-fader sends carefully
- Monitor through headphones
```

#### Phase Cancellation

**Symptoms:** Thin sound, bass disappears in mono

**Diagnosis:**
```
1. Sum to mono:
   - Insert JS: Utility/channel_mixer on master
   - Set to mono
2. If sound changes dramatically = phase issue
```

**Solutions:**
```
1. Flip phase:
   Item properties → "Invert phase"
   Or use phase flip plugin
   
2. Time align:
   - Zoom in
   - Align transients
   - Use time alignment plugin

3. Check duplicate tracks
```

## Frequently Asked Questions

### General Questions

**Q: What sample rate should I use?**
```
A: 44.1 kHz - Music for CD/streaming
   48 kHz - Video projects
   96 kHz - High resolution (optional)
   Higher rarely needed
```

**Q: What bit depth for recording?**
```
A: Always 24-bit
   - More headroom
   - Better quality
   - No reason for 16-bit recording
```

**Q: How much headroom should I leave?**
```
A: Recording: -12 to -18 dBFS peaks
   Mixing: Master around -6 dBFS before limiting
   More headroom is always better
```

### Mixing Questions

**Q: Should I mix in mono?**
```
A: Not exclusively, but check in mono regularly
   - Reveals phase issues
   - Shows balance problems
   - Important for translation
```

**Q: What order for plugins?**
```
A: Typical order:
   1. Gain/Trim
   2. EQ (corrective)
   3. Compression
   4. EQ (tonal)
   5. Saturation
   6. Modulation
   7. Time-based (delay, reverb)
   
   But: Rules can be broken creatively
```

**Q: How loud should my mix be?**
```
A: During mixing: Leave headroom (-6 to -12 dBFS peaks)
   Final master: Depends on platform (-14 LUFS for streaming)
   Don't master while mixing
```

### Recording Questions

**Q: How close to the mic should I be?**
```
A: Vocals: 6-12 inches (15-30 cm)
   Acoustic guitar: 6-12 inches from 12th fret
   Guitar amp: 1-6 inches from speaker
   
   Adjust based on:
   - Desired proximity effect
   - Room sound
   - Personal preference
```

**Q: Should I record with effects?**
```
A: Generally NO - record dry
   Exceptions:
   - Input monitoring with FX (not recorded)
   - Intentional commitment to sound
   - Amp simulators can go either way
```

### REAPER-Specific Questions

**Q: How do I save a default project template?**
```
A: 1. Set up project as desired
   2. File → Project templates → Save project as template
   3. For default: Name it "default" or set in Preferences
```

**Q: How do I create track templates?**
```
A: 1. Set up track(s) with FX, routing
   2. Select track(s)
   3. Right-click → Save tracks as track template
```

**Q: How do I reset REAPER to defaults?**
```
A: Hold Ctrl+Shift while starting REAPER
   Or: Delete REAPER.ini from resource path
```

**Q: Where are my REAPER settings stored?**
```
A: Options → Show REAPER resource path in explorer
   Contains: Settings, plugins, scripts, themes
```

## Error Messages

### Common Errors and Meanings

| Error | Meaning | Solution |
|-------|---------|----------|
| "Audio device not found" | Interface disconnected or driver issue | Reconnect, reinstall drivers |
| "Buffer underrun" | CPU can't keep up | Increase buffer size |
| "Media offline" | File not found | Relocate media |
| "Plugin crashed" | Plugin error | Update or remove plugin |
| "Sample rate mismatch" | Project vs interface conflict | Match sample rates |

## Getting Help

### REAPER Resources

| Resource | URL | Use |
|----------|-----|-----|
| REAPER Forums | forum.cockos.com | Community help |
| REAPER Wiki | wiki.cockos.com | Documentation |
| REAPER Blog | reaper.fm/blog | News, tips |
| User Guide | reaper.fm/userguide | Official manual |

### General Audio Help

| Resource | Description |
|----------|-------------|
| Gearslutz/Gearspace | Pro audio forums |
| Reddit r/audioengineering | Community help |
| Sound On Sound | Articles, tutorials |
| YouTube tutorials | Visual learning |

## Preventive Measures

### Best Practices

```
1. Save frequently (Ctrl+S)
2. Enable auto-save (Preferences → Project)
3. Back up projects regularly
4. Keep organized folder structure
5. Label tracks and items clearly
6. Document session settings
7. Keep plugins updated
8. Maintain system (updates, cleanup)
```

### Session Checklist

**Before Recording:**
```
□ Fresh project or template
□ Audio device configured
□ Inputs tested
□ Levels set
□ Monitoring working
□ Metronome configured
□ File location set
```

**Before Mixing:**
```
□ Project backed up
□ Tracks organized
□ Rough balance set
□ Reference track loaded
□ Monitoring calibrated
□ Ears rested
```

**Before Export:**
```
□ Mix checked on multiple systems
□ Levels appropriate
□ Format correct
□ Dithering applied (if needed)
□ Metadata entered
□ Filename correct
```
