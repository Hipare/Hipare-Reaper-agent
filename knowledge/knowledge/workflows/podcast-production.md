# Podcast Production Guide - Podcast-tuotanto REAPERissä

## Yleiskatsaus

Podcast-tuotanto REAPERissä kattaa:
- Puheäänen nauhoitus ja käsittely
- Intro/outro-musiikki
- Äänenvoimakkuuden tasaus (leveling)
- Kohinanpoisto
- Multi-host nauhoitus
- Etähaastattelut
- Julkaisuvalmis vienti

---

## REAPER-asetukset podcastille

### Projektin perusasetukset

```
Sample rate: 48000 Hz (standardi podcast/video)
Bit depth: 24-bit (nauhoitus)
Vienti: 16-bit / 44100 Hz MP3 tai WAV (julkaisu)
```

### Suositeltu raitarakenne

```
Track 1: Host (sinä)
Track 2: Co-host / Vieras (jos on)
Track 3: Etävieras (Zoom/Discord audio)
Track 4: Intro-musiikki
Track 5: Outro-musiikki
Track 6: Sound effects / jingles
Track 7: Music beds (taustamusiikki)
```

---

## Puheäänen käsittely

### Perus podcast-ketju (signal chain)

```
1. ReaGate (portti) - poista taustahiljaisuus
2. ReaEQ (EQ) - muokkaa taajuudet
3. ReaComp (kompressori) - tasaa dynamiikka
4. ReaLimit (limitteri) - estä clippailu
```

### Gate-asetukset (ReaGate)

```
Threshold: -40 to -50 dB (säädä huoneen mukaan)
Attack: 1-5 ms
Hold: 100 ms
Release: 100-200 ms
Hysteresis: 6 dB

Tarkoitus: Poistaa hengitykset, taustahumina kun et puhu
```

### EQ-asetukset (ReaEQ)

```
HPF (High Pass): 80-100 Hz (poista pörinä/rumble)
Leikkaa: 200-300 Hz (-2 to -4 dB) jos "mutainen"
Nosta: 2-4 kHz (+2-3 dB) selkeyttä
Nosta: 8-10 kHz (+1-2 dB) "ilmaa"

Proximity effect (lähimikki):
- Jos kuulostaa "boomaavalta", leikkaa 150-250 Hz
```

### Kompressori (ReaComp)

```
Ratio: 3:1 to 4:1
Threshold: -20 to -15 dB (niin että GR on 3-6 dB)
Attack: 10-20 ms
Release: 100-150 ms
Makeup gain: Kompensoi menetetty volyymi

Tarkoitus: Tasaa kovaääniset ja hiljaiset kohdat
```

### Limitteri (ReaLimit)

```
Threshold/Ceiling: -1 dB (estää clippauksen)
Release: Auto tai 100 ms

Käytä viimeisenä ketjussa!
```

---

## Loudness-standardit podcasteille

### Suositellut tasot

| Alusta | Loudness | True Peak |
|--------|----------|-----------|
| Apple Podcasts | -16 LUFS | -1 dBTP |
| Spotify | -14 LUFS | -1 dBTP |
| YouTube | -14 LUFS | -1 dBTP |
| Yleinen standardi | -16 LUFS | -1.5 dBTP |

### Loudness-mittaus REAPERissä

```
1. Lisää Master-raidalle: JS: Loudness Meter
2. Tai käytä: Youlean Loudness Meter (ilmainen)
3. Integrated LUFS pitäisi olla -14 to -16
```

---

## Kohinanpoisto

### ReaFIR (REAPERin sisäänrakennettu)

```
1. Lisää ReaFIR raidalle
2. Valitse "Subtract" mode
3. Toista kohta jossa on VAIN kohinaa (ei puhetta)
4. Klikkaa "Automatically build noise profile"
5. Toista normaalisti - kohina vähenee

Huom: Älä käytä liian aggressiivisesti, voi kuulostaa "robotilta"
```

### Ilmaiset vaihtoehdot

- **Bertom Denoiser** (ilmainen) - yksinkertainen, tehokas
- **ReaGate** - poistaa hiljaisen ajan kohinan (ei puheen aikana)

---

## Multi-host nauhoitus

### Paikallinen nauhoitus (samassa tilassa)

```
Vaihtoehto A: Yksi mikrofoni per henkilö
- Jokainen omalle raidalleen
- Säädä gain erikseen

Vaihtoehto B: Yksi mikki kahdelle
- Cardioid-mikki väliin
- Kompromissi laadusta
```

### Etänauhoitus (Zoom, Discord, Riverside)

**Paras käytäntö:**
```
1. Jokainen osallistuja nauhoittaa PAIKALLISESTI oman äänensä
2. Kokousohjelma vain kommunikaatioon
3. Synkronoi jälkikäteen REAPERissä

Miksi: Zoom/Discord-ääni on pakattu ja huonolaatuinen
```

**Synkronointi REAPERissä:**
```
1. Tuo kaikki paikalliset nauhoitukset
2. Etsi yhteinen kohta (esim. "Aloitetaan nyt" -merkki)
3. Siirrä raidat kohdakkain (snap to grid off)
4. Käytä transientteja apuna
```

**Varasuunnitelma (jos ei paikallista):**
```
- Nauhoita Zoom-ääni varmuudeksi
- Käytä erillistä tallennuspalvelua:
  - Riverside.fm (korkealaatuinen)
  - Zencastr
  - SquadCast
```

---

## Intro ja Outro

### Intro-musiikki

```
Tyypillinen rakenne:
[Musiikki 3-5 sek] → [Fade under puhe] → [Sisältö alkaa]

REAPER:
1. Tuo musiikki omalle raidalle
2. Aseta volume envelope (V)
3. Luo fade: täysi → -15 to -20 dB kun puhe alkaa
4. Tai fade out kokonaan
```

### Ducking (musiikki väistyy puheelle)

```
Automaattinen ducking:

1. Lisää musiikkiraidalle ReaComp
2. Sidechain: routing → Receive from "Host" track
3. ReaComp asetukset:
   - Ratio: 8:1 to 10:1
   - Threshold: -30 dB
   - Attack: 50-100 ms
   - Release: 300-500 ms
   
Tulos: Musiikki hiljenee automaattisesti kun puhut
```

---

## Editointi

### Tyypilliset editointitarpeet

1. **Poista "öö", "mm", täytesanat**
   - Valitse (S-työkalu) → Delete
   
2. **Poista pitkät tauot**
   - Valitse tyhjä kohta → Delete → Siirry seuraavaan

3. **Korjaa virheet**
   - Leikkaa virhe pois (S split) → Delete → Crossfade

### Ripple editing (ketjueditointi)

```
REAPERissä:
1. Options → Ripple editing per track (tai all tracks)
2. Kun poistat kohdan, kaikki siirtyy automaattisesti kiinni

Keyboard: Alt+P (toggle ripple per track)
```

### Crossfade leikkausten välillä

```
1. Vedä itemit päällekkäin
2. REAPER luo automaattisen crossfaden
3. Säädä crossfade-tyyppi: oikea-klikkaa → Crossfade options
```

---

## Vienti (Export)

### Podcast-vienti

```
File → Render (Ctrl+Alt+R)

Asetukset:
- Format: MP3
- Bitrate: 128 kbps (stereo) tai 96 kbps (mono puhe)
- Sample rate: 44100 Hz
- Channels: Mono (puhe) tai Stereo (jos musiikkia)

Loudness:
- Lisää ReaLimit ennen vientiä
- Tarkista -16 LUFS (Integrated)
```

### Chapteri-merkit (Podcast Chapters)

```
1. Lisää markers (M) tärkeisiin kohtiin
2. Vie MP3 + chapters:
   - Render → Embed metadata
   - Tai käytä Forecast-ohjelmaa (Mac) tai mp3tag (Windows)
```

---

## Podcast-template REAPERiin

### Luo template:

1. Tee projekti valmiilla raitarakenteella:
   - Host track (EQ, Comp, Gate)
   - Guest track (sama ketju)
   - Music track
   - SFX track
   
2. File → Save as → Project template

### Avaa uusi jakso:
```
File → New project → From template → [Valitse podcast-template]
```

---

## Ilmaiset resurssit

### Podcast-musiikki (royalty-free)

- **YouTube Audio Library** - ilmainen
- **Free Music Archive** - CC-lisensoitu
- **Incompetech** - Kevin MacLeod
- **Uppbeat** - ilmainen tier

### Äänitehosteet

- **Freesound.org** - CC-lisensoitu
- **Zapsplat** - ilmainen (rekisteröityminen)
- **BBC Sound Effects** - laaja kokoelma

---

## AI-vastausohjeet

Kun käyttäjä kysyy podcast-tuotannosta:

1. **Kysy** montako puhujaa ja nauhoitetaanko paikallisesti vai etänä
2. **Ehdota** perus-signaalliketju (Gate → EQ → Comp → Limiter)
3. **Muistuta** loudness-standardeista (-16 LUFS)
4. **Auta** template-luomisessa
5. **Neuvo** editoinnissa (ripple editing, crossfades)

**Esimerkki:**
```
Podcast-äänelle suosittelen tämän ketjun:

Komento: add_fx
Args: { track: "Host", fx_name: "ReaGate" }

Komento: add_fx
Args: { track: "Host", fx_name: "ReaEQ" }

Komento: add_fx
Args: { track: "Host", fx_name: "ReaComp" }

Näillä asetuksilla saat selkeän podcast-äänen. Haluatko että säädän parametrit?
```
