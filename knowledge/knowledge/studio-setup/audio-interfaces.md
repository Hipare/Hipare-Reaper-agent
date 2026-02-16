# Audio Interface Knowledge Base

## Common Audio Interfaces

### Focusrite Scarlett Series

#### Scarlett Solo (3rd Gen)
```
Inputs: 1x XLR/Hi-Z combo, 1x instrument
Outputs: 2x RCA, 1x Headphone
Preamps: 1x Scarlett preamp (56dB gain)
Max Sample Rate: 192kHz / 24-bit
Latency: ~3.6ms roundtrip @ 96kHz/48 samples
Driver: Focusrite ASIO
```

**Gain Staging:**
- Mic input: Start at 12 o'clock, adjust for -12dB peaks
- Instrument: High impedance, good for passive pickups
- Green ring = good level, amber = getting hot, red = clipping

**Best Buffer Settings:**
- Recording: 64-128 samples (low latency)
- Mixing: 256-512 samples (stability)

#### Scarlett 2i2 (3rd Gen)
```
Inputs: 2x XLR/Hi-Z combo
Outputs: 2x TRS, 1x Headphone
Preamps: 2x Scarlett preamp (56dB gain)
Max Sample Rate: 192kHz / 24-bit
Latency: ~3.6ms roundtrip @ 96kHz/48 samples
Direct Monitor: Blend knob (Input ↔ Playback)
```

**Gain Staging:**
- Similar to Solo but with 2 independent channels
- Direct monitor blend: Full left = zero latency monitoring
- Air mode: Adds HF boost for vocals/acoustic

**Use Cases:**
- Singer-songwriter: Vocal + guitar simultaneously
- DI + mic: Record both for reamping options
- Stereo recording: Keyboard or stereo mic setup

#### Scarlett 4i4 / 8i6 / 18i8 / 18i20
Higher channel counts for multi-track recording.

### PreSonus AudioBox

#### AudioBox USB 96
```
Inputs: 2x XLR/Hi-Z combo
Outputs: 2x TRS, 1x Headphone
Max Sample Rate: 96kHz / 24-bit
Latency: ~4ms roundtrip @ 48kHz/64 samples
```

**Gain Staging:**
- Less gain than Scarlett (40dB)
- May need external preamp for quiet sources
- Best for line-level or active pickups

### Behringer UMC Series

#### UMC22 / UMC202HD / UMC404HD
Budget-friendly options with MIDAS preamps.

```
UMC202HD:
Inputs: 2x XLR/Hi-Z combo
Outputs: 2x TRS, 1x Headphone
Max Sample Rate: 192kHz / 24-bit
Latency: ~5ms roundtrip @ 48kHz/64 samples
```

### Native Instruments Komplete Audio

#### Komplete Audio 1/2/6
```
Komplete Audio 2:
Inputs: 2x XLR/Hi-Z combo
Outputs: 2x TRS, 1x Headphone
Max Sample Rate: 192kHz / 24-bit
Direct Monitor: On/Off switch
```

### MOTU M2 / M4

```
M2:
Inputs: 2x XLR/Hi-Z combo
Outputs: 2x TRS, 1x Headphone
Max Sample Rate: 192kHz / 24-bit
Latency: ~2.5ms roundtrip @ 96kHz/32 samples
LCD Meters: Real-time level display
```

**Noted for:** Excellent converters, low latency, great metering.

### SSL 2 / 2+

```
SSL 2:
Inputs: 2x XLR/Hi-Z combo
Outputs: 2x TRS, 1x Headphone
Preamps: SSL-style with 4K mode (analog saturation)
Max Sample Rate: 192kHz / 24-bit
```

**4K Button:** Adds SSL-style analog coloring during recording.

## Gain Staging Guidelines by Interface Type

### Entry-Level (Scarlett Solo, UMC22, AudioBox)
```
1. Start gain at 9-10 o'clock
2. Play loudest part of performance
3. Increase gain until peaks hit -12dB in REAPER
4. If clip light shows, back off slightly
5. Better too quiet than clipping
```

### Mid-Range (Scarlett 2i2, MOTU M2, SSL 2)
```
1. These have more headroom - use it
2. Target -18dB RMS, -6dB peaks
3. Direct monitor at ~50% blend during tracking
4. 4K/Air modes: decide before recording (can't undo)
```

### Pro Level (Apollo, RME, Antelope)
```
1. Unison preamps allow gain staging in software
2. Near-zero latency monitoring
3. Target -18dBFS for optimal converter performance
4. DSP processing for zero-latency effects
```

## Latency Optimization by Interface

| Interface | Optimal Buffer | Expected Latency | Notes |
|-----------|---------------|------------------|-------|
| Scarlett Solo/2i2 | 64-128 | 3-6ms | Use Focusrite ASIO |
| AudioBox USB 96 | 128 | 5-7ms | Less stable at 64 |
| UMC202HD | 128-256 | 5-10ms | ASIO4ALL if needed |
| MOTU M2 | 32-64 | 2-4ms | Excellent low-latency |
| SSL 2 | 64-128 | 3-6ms | Great balance |

## ASIO Driver Priority

1. **Manufacturer's ASIO driver** - Always first choice
2. **ASIO4ALL** - Fallback for interfaces without ASIO
3. **WASAPI** - Better than DirectSound, worse than ASIO

## Direct Monitoring Strategies

### Interfaces with Monitor Blend (Scarlett 2i2, SSL 2)
```
Recording:
1. Turn blend knob toward Input for zero-latency
2. Adjust playback level separately in REAPER
3. Find comfortable balance
```

### Interfaces with Monitor On/Off (Scarlett Solo, UMC22)
```
Recording:
1. Enable direct monitor
2. Set REAPER track monitoring to OFF
3. Adjust interface output level for comfort
```

### No Direct Monitor (Some budget interfaces)
```
Use REAPER monitoring:
1. Set buffer to 64-128
2. Track monitoring ON
3. Accept small latency
4. Or use software like ASIO4ALL with low buffer
```

## Interface-Specific Recording Tips

### Scarlett 2i2 Solo 3rd Gen (User's Interface)
```
Optimal Settings for Recording:
├── Buffer: 128 samples (good balance)
├── Sample Rate: 48kHz (standard)
├── Driver: Focusrite USB ASIO
├── Instrument Input: For passive pickups
├── Direct Monitor: ON during tracking
└── Gain: Start low, increase to -12dB peaks

Kitaran kanssa:
├── Kytke kitara etupaneelin Hi-Z-sisääntuloon
├── Gain noin kello 11-13 asennossa
├── Direct monitor päälle (nollalatenssi)
├── REAPER:ssa raidan monitorointi OFF
└── Lisää amp sim erilliselle monitor-raidalle

Mikrofonin kanssa:
├── XLR-kaapeli takapaneelin sisääntuloon
├── Phantom 48V PÄÄLLE kondensaattorimikille
├── Gain noin kello 10-12 asennossa
└── Tarkista ettei punainen klippausvalo syty
```

## AI-Ohjeistus Audio Interface -asetuksiin

Kun käyttäjä mainitsee audio interfacen:

1. **Tunnista interface** → etsi yllä olevista spekseistä
2. **Suosittele oikeat asetukset** → buffer, sample rate, monitoring
3. **Gain staging** → anna interfacelle sopivat ohjeet
4. **Latenssi-ongelmat** → ohjaa direct monitoring tai buffer-säätöön
5. **Driver** → suosittele valmistajan ASIO-ajuria

Kun käyttäjä valittaa ongelmista:
- "Viive" → pienennä bufferia tai käytä direct monitoria
- "Ritinä/räiske" → kasvata bufferia
- "Ei signaalia" → tarkista gain, phantom power, input-valinta
- "Liian hiljainen" → nosta gainia, tarkista Hi-Z vs Line
