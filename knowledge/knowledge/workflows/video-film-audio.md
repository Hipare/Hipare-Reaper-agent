# Video & Film Audio Guide - Video- ja elokuva-ääni

## Yleiskatsaus

Video- ja elokuva-äänen tuotanto sisältää:
- Dialogin nauhoitus ja käsittely
- ADR (Automated Dialogue Replacement)
- Foley-tehosteet
- Äänitehoste-suunnittelu (SFX)
- Musiikkisävellys ja -editointi
- Synkronointi videon kanssa
- Surround-miksaus (5.1, 7.1, Atmos)
- Loudness-standardit (broadcast)

---

## REAPER ja video

### Videon tuonti REAPERiin

```
1. Insert → Media file (Ctrl+I)
2. Valitse video (MP4, MOV, AVI, MKV)
3. REAPER luo:
   - Video item (näkyy aikajalla)
   - Audio-raita (erotettu audiosta)
   
Tuetut formaatit: MP4, MOV, AVI, MKV, WMV
(Vaatii joskus VLC:n asennuksen codeceille)
```

### Video-ikkunan näyttö

```
View → Video (Ctrl+Shift+V)

Asetukset:
- Seuraa playheadia
- Koko säädettävissä
- Voi laittaa toiselle näytölle
```

### Frame-tarkka editointi

```
1. Options → Snap/Grid → Frame
2. Nyt leikkaukset osuvat frameihin

Framerates:
- 24 fps (elokuva)
- 25 fps (PAL TV)
- 29.97 fps (NTSC TV)
- 30 fps (web)
- 60 fps (gaming, smooth)
```

---

## Dialogi

### Dialogin nauhoitus

**Lavamikitys (production sound):**
```
- Boom mic (paras laatu)
- Lavalier/lapel mic (varmuus)
- Äänita molemmat erikseen

REAPER-workflow:
1. Luo raidat: "Boom", "Lav_Actor1", "Lav_Actor2"
2. Nauhoita synkassa videon kanssa
3. Synkronoi jälkikäteen: clap/slate tai timecode
```

### Dialogin käsittely

```
Tyypillinen ketju:

1. ReaGate (poista ambiens hiljaisista)
2. ReaEQ:
   - HPF 80-100 Hz
   - Cut 200-300 Hz (mutaisuus)
   - Boost 2-4 kHz (selkeys)
3. ReaComp (tasaa dynamiikka)
4. De-esser (jos tarvitaan)
```

### ADR (Automated Dialogue Replacement)

**Mikä on ADR?**
Studionauhoitus korvaamaan huono kenttä-ääni.

**REAPER ADR -workflow:**
```
1. Tuo alkuperäinen video + ääni
2. Luo uusi raita "ADR"
3. Tee region jokaiselle ADR-repliikille
4. Näyttelijä toistaa katsoessaan videota
5. Synkronoi huulten liikkeeseen

Vinkki: Käytä pre-roll (muutama sekunti ennen)
Options → Recording → Pre-roll
```

---

## Foley

### Mitä on Foley?

Foley = äänitehosteet jotka synkronoidaan kuvaan:
- Askeleet
- Vaatteiden kahina
- Esineiden käsittely
- Ovet, ikkunat
- Syöminen, juominen

### Foley REAPERissä

```
1. Luo raidat kategorioittain:
   - "Foley_Steps" (askeleet)
   - "Foley_Cloth" (vaatteet)
   - "Foley_Props" (esineet)

2. Nauhoita video-playbackin kanssa:
   - Katso videota
   - Tee äänet samaan aikaan
   - Tai editoi jälkikäteen
   
3. Synkronoi tarkasti:
   - Zoomaa sisään
   - Siirrä transientti oikeaan kohtaan
   - Framea ei tarvitse osua, silmä on tolerantti
```

### Foley-käsittely

```
ReaEQ:
- Säädä taajuudet sopimaan tilaan
- Esim. askeleet eri pinnalla = eri EQ

ReaVerbate:
- Sovita tilan kaikuun
- Jos kuva on sisällä → lyhyt reverb
- Jos kuva on ulkona → vähän/ei reverbiä
```

---

## Äänitehosteet (SFX)

### Tehosteiden lähteet

**Ilmaiset:**
- **Freesound.org** - laaja CC-kirjasto
- **BBC Sound Effects** - 16000+ ilmaista
- **Zapsplat** - ilmainen (rekisteröinti)
- **Sonniss GDC** - vuosittainen ilmaispaketti

**Maksulliset:**
- Boom Library
- Sound Ideas
- Pro Sound Effects

### SFX REAPERissä

```
1. Luo kansioraita "SFX"
   - Aliraidat: "SFX_Ambience", "SFX_Hard", "SFX_Soft"

2. Tuo tehosteet:
   - Vedä suoraan aikajanalle
   - Synkronoi kuvaan

3. Layering (kerrostus):
   - Yhdistä useita ääniä
   - Esim. räjähdys = pom + romahdus + lasinsirut

4. Käsittely:
   - Pitch shift (ReaPitch) - muuta äänen luonnetta
   - Reverse - käännä takaperin
   - Time stretch - venytä/tiivistä
```

---

## Musiikki

### Musiikki videossa

**Tyypit:**
- **Score** - sävelletty tälle videolle
- **Source music** - diegeettinen (kuuluu tarinassa)
- **Library music** - lisensoidtu valmis musiikki

### Musiikin editointi videoon

```
1. Timing-kohdat (hit points):
   - Leikkausten kohdat
   - Dramaattiset hetket
   - Merkitse markerilla (M)

2. Musiikin sovitus:
   - Stretch/shrink musiikin osia
   - Leikkaa ja crossfade
   - Käytä tempo-mappingia monimutkaisissa

3. Ducking (dialogin alta):
   - Sidechain compress musiikki dialogiin
   - Tai: automaatio volume envelope
```

### Temp track workflow

```
1. Lisää "temp" musiikki inspiraatioksi
2. Sävellä/etsi lopullinen musiikki
3. Korvaa temp lopullisella
4. ÄLÄ käytä temp-musiikkia lopullisessa!
```

---

## Synkronointi

### Videon ja äänen synkronointi

**Manuaalinen:**
```
1. Etsi synkronointipiste:
   - Clap/slate (käsien taputus)
   - Visuaalinen transientti
   
2. Zoomaa sisään
3. Siirrä audio oikeaan kohtaan
4. Tarkista huulsynkka
```

**Automaattinen (SWS Extension):**
```
SWS: Auto-sync items by transient
- Valitse items
- Toiminto etsii transientit ja synkaa

Tai: Item → Align items to grid (snap transients)
```

### Timecode

```
REAPER tukee timecodea:
- SMPTE timecode
- LTC (Linear Timecode)

View → Time display → Timecode

Synkaa kameraan:
- Käytä ulkoista timecode-generaattoria
- Tai: clap jokaisessa otossa
```

---

## Surround-ääni (5.1 / 7.1)

### 5.1 -kanavajärjestys

```
L  = Left front
R  = Right front
C  = Center
LFE = Subwoofer
Ls = Left surround
Rs = Right surround
```

### 5.1 REAPERissä

```
1. Project settings:
   - Track → Track channels: 6

2. Surround panner:
   - Klikkaa pan area → Valitse "5.1 surround pan"
   
3. Reititys:
   - Dialogi → Center
   - Musiikki → L/R
   - Ambiens → Ls/Rs
   - Bassot → LFE

4. Vienti:
   - 6 kanavan interleaved WAV
   - Tai: 6 erillistä mono WAV
```

---

## Loudness-standardit (Broadcast)

### TV/Broadcast standardit

| Standardi | Loudness | True Peak | Käyttö |
|-----------|----------|-----------|--------|
| EBU R128 | -23 LUFS | -1 dBTP | Eurooppa TV |
| ATSC A/85 | -24 LKFS | -2 dBTP | USA TV |
| ARIB TR-B32 | -24 LKFS | -1 dBTP | Japani |
| Netflix | -27 LUFS (dialogi) | -2 dBTP | Streaming |
| YouTube | -14 LUFS | -1 dBTP | Web |

### Loudness-mittaus REAPERissä

```
1. JS: Loudness Meter (Peak/RMS/LUFS)
2. Tai: Youlean Loudness Meter (ilmainen, parempi)

Tarkista:
- Integrated LUFS (koko ohjelma)
- Short-term (3 sek)
- Momentary (400 ms)
- True Peak
```

### Dialogue-normalisointi

```
Netflix/elokuva:
- Dialogi = -27 LUFS
- Efektit ja musiikki = suhteessa dialogiin

Workflow:
1. Miksaa dialogi -27 LUFS
2. Balansoi muut elementit suhteessa
3. Tarkista kokonais-loudness
```

---

## Vienti (Delivery)

### Tyypilliset toimitusmuodot

**Web/YouTube:**
```
- Stereo WAV tai AAC
- -14 LUFS, -1 dBTP
- 48 kHz, 16/24-bit
```

**Broadcast/TV:**
```
- Stereo tai 5.1
- -23 LUFS (EBU) tai -24 LKFS (ATSC)
- 48 kHz, 24-bit
- PCM WAV tai AES
```

**Elokuva (DCP):**
```
- 5.1 tai 7.1
- 48 kHz, 24-bit
- Erillinen dialogi/musiikki/efektit (stems)
```

### REAPER-vienti

```
File → Render (Ctrl+Alt+R)

Video + audio:
- Source: Master mix
- Output: Video (MP4/MOV)
- Video codec: H.264 tai ProRes
- Audio: AAC tai PCM

Vain audio:
- WAV 48 kHz 24-bit
- Tai: AAC (lossy, pienempi koko)
```

---

## Projektinhallinta

### Kansiorakenne

```
Projekti/
├── _Project_Files/
│   └── projekti.RPP
├── Audio/
│   ├── Production/
│   ├── ADR/
│   ├── Foley/
│   └── SFX/
├── Music/
├── Video/
│   ├── Reference/
│   └── Exports/
└── Exports/
    ├── Stems/
    └── Final/
```

### Raitarakenne

```
📁 DIALOGUE
  ├── Boom
  ├── Lav_1
  └── Lav_2
📁 ADR
📁 FOLEY
  ├── Steps
  ├── Cloth
  └── Props
📁 SFX
  ├── Hard FX
  ├── Soft FX
  └── Ambience
📁 MUSIC
  ├── Score
  └── Source
📁 SUBMIX
  ├── DX (dialogue)
  ├── MX (music)
  └── FX (effects)
MASTER
```

---

## AI-vastausohjeet

Kun käyttäjä kysyy video-äänestä:

1. **Kysy** projektin tyyppi (lyhytelokuva, YouTube, mainos?)
2. **Selvitä** mitä elementtejä tarvitaan (dialogi, musiikki, SFX?)
3. **Auta** raitarakenteen luomisessa
4. **Neuvo** synkronoinnissa
5. **Muistuta** loudness-standardeista (kohde-alusta)

**Esimerkki:**
```
Video-projektille suosittelen tätä raitarakennetta:

Komento: create_track
Args: { name: "Dialogue", role: "vocal" }

Komento: create_track
Args: { name: "SFX", role: "generic" }

Komento: create_track
Args: { name: "Music", role: "generic" }

Tuo video REAPERiin (Ctrl+I) ja varmista että frame rate täsmää projektin kanssa.

Mikä on kohde-alusta? (YouTube, TV, elokuva?)
```
