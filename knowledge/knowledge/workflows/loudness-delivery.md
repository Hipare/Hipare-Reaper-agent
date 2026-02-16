# Loudness & Delivery Standards - Loudness ja toimitusstandardit

## Yleiskatsaus

Eri alustat vaativat eri loudness-tasoja. Väärä taso johtaa:
- Liian hiljainen → Alusta nostaa (voi lisätä kohinaa)
- Liian kova → Alusta laskee (dynamiikka kärsii turhaan)

Tämä opas kattaa standardit kaikille yleisille alustoille.

---

## Loudness-yksiköt

### LUFS (Loudness Units Full Scale)

```
LUFS = Moderni loudness-mittari
- Mittaa "koettua" äänekkyyttä
- Huomioi taajuuspainotuksen (K-weighting)
- Standardi kaikilla alustoilla

Tyypit:
- Integrated LUFS: Koko kappaleen keskiarvo
- Short-term LUFS: 3 sekunnin ikkuna
- Momentary LUFS: 400 ms ikkuna
```

### True Peak (dBTP)

```
True Peak = Todellinen huippuarvo digitaalisesti
- Perinteinen peak-mittari voi missata inter-sample peaks
- True Peak mittaa myös näiden välissä

Miksi tärkeä:
- Liian korkea True Peak → Clipping MP3/AAC-koodauksessa
- Standardi: -1 dBTP tai -2 dBTP
```

### LRA (Loudness Range)

```
LRA = Dynamiikan laajuus (hiljaisin vs. kovin kohta)
- Matala LRA = Kompressoitu, tasainen
- Korkea LRA = Dynaaminen

Tyypilliset arvot:
- Pop/EDM: 5-8 LU
- Rock: 8-12 LU
- Jazz/Klassinen: 12-20 LU
```

---

## Alusta-spesifiset standardit

### Spotify

```
Tavoite: -14 LUFS (integrated)
True Peak: -1 dBTP

Spotify normalisoi:
- Kovemmat lasketaan -14 LUFS:iin
- Hiljaisemmat nostetaan -14 LUFS:iin (jos "Loud" mode)

Suositus:
- Masteroi -14 LUFS
- Älä ylitä -1 dBTP
- Säilytä dynamiikkaa (ei tarvetta "loudness wariin")
```

### Apple Music / iTunes

```
Tavoite: -16 LUFS (integrated)
True Peak: -1 dBTP

Apple Sound Check:
- Normalisoi kovemmat alas
- EI nosta hiljaisempia (ero Spotifyyn!)

Suositus:
- -14 to -16 LUFS
- Dynamiikka säilyy paremmin hieman hiljaisemmalla
```

### YouTube

```
Tavoite: -14 LUFS (integrated)
True Peak: -1 dBTP

YouTube normalisoi:
- Kovemmat lasketaan
- Hiljaisempia EI nosteta

Suositus:
- -14 LUFS
- Älä masteroi liian hiljaiseksi (ei nouse)
```

### Tidal

```
Tavoite: -14 LUFS
True Peak: -1 dBTP

Samat säännöt kuin Spotify.
```

### SoundCloud

```
Tavoite: -14 LUFS (suositus)
True Peak: -1 dBTP

SoundCloud EI normalisoi automaattisesti!
- Kova kappale kuulostaa kovemmalta
- Tämä houkuttelee "loudness wariin"

Suositus: Silti -14 LUFS (dynamiikan säilytys)
```

### Podcast-alustat

```
Apple Podcasts: -16 LUFS, -1 dBTP
Spotify Podcasts: -14 LUFS, -1 dBTP
Yleinen standardi: -16 LUFS

Puheelle:
- -16 LUFS on hyvä kompromissi
- Dialogin selkeys tärkeintä
```

### Broadcast (TV/Radio)

```
EBU R128 (Eurooppa):
- -23 LUFS
- -1 dBTP
- LRA max 20 LU (suositus)

ATSC A/85 (USA):
- -24 LKFS
- -2 dBTP

Suomi (YLE):
- EBU R128: -23 LUFS
```

### Elokuva/Netflix

```
Netflix:
- Dialogi: -27 LUFS (anchor point)
- Kokonais: -24 LUFS (max)
- True Peak: -2 dBTP

Dolby Cinema:
- Calibroitu 85 dB SPL
- Dialogi: -27 LUFS
```

### Vinyyli

```
Ei LUFS-standardia, mutta:
- Dynamiikka tärkeää (ei heavy limiting)
- Basso mono (leikkuupään rajoitus)
- Ei liikaa high-frequency content
- Tavoite: -10 to -14 LUFS tyypillisesti
```

### CD

```
Ei virallista standardia, mutta:
- "Loudness war" johti -6 to -8 LUFS äärimmäisyyksiin
- Suositus nykyään: -12 to -14 LUFS
- True Peak: -0.3 dBTP (CD:llä voi olla tarkempi)
```

---

## Yhteenvetotaulukko

| Alusta | Loudness | True Peak | Huom |
|--------|----------|-----------|------|
| Spotify | -14 LUFS | -1 dBTP | Normalisoi molemmat suunnat |
| Apple Music | -16 LUFS | -1 dBTP | EI nosta hiljaisempia |
| YouTube | -14 LUFS | -1 dBTP | EI nosta hiljaisempia |
| Tidal | -14 LUFS | -1 dBTP | - |
| SoundCloud | -14 LUFS | -1 dBTP | EI normalisoi! |
| Podcast | -16 LUFS | -1 dBTP | Apple/Spotify |
| TV (EBU) | -23 LUFS | -1 dBTP | Eurooppa |
| TV (ATSC) | -24 LKFS | -2 dBTP | USA |
| Netflix | -27 LUFS (dial) | -2 dBTP | Dialogi-anchor |
| CD | -12 to -14 | -0.3 dBTP | Suositus |

---

## Loudness-mittaus REAPERissä

### Sisäänrakennetut työkalut

```
JS: Loudness Meter Peak/RMS/LUFS
- View → Monitoring FX → Add → JS: Loudness
- Näyttää Integrated, Short-term, Momentary
- Riittävä perustarpeisiin
```

### Ilmaiset pluginit

```
1. Youlean Loudness Meter (SUOSITUS)
   - Ilmainen versio riittää
   - Graafinen näyttö
   - History, export
   - youlean.co/youlean-loudness-meter

2. dpMeter 3 (TB Software)
   - Ilmainen
   - LUFS + True Peak
   - Hyvä perus-mittari

3. MLoudnessAnalyzer (Melda)
   - Ilmainen
   - Osa MFreeFXBundle
```

### Mittaus-workflow

```
1. Lisää Loudness Meter Master-raitaan
2. Toista koko kappale alusta loppuun
3. Lue "Integrated LUFS"
4. Tarkista True Peak (max)
5. Säädä master-fader tai limiter tarpeen mukaan
```

---

## Loudness-säätö REAPERissä

### Limiter-säätö (ReaLimit)

```
1. Lisää ReaLimit Master-raitaan
2. Aseta Ceiling/Threshold:
   - -1 dB (streaming)
   - -2 dB (broadcast)
3. Toista ja tarkista LUFS
4. Säädä input gain tarpeen mukaan
```

### Automaattinen loudness match

```
SWS Extension:
- Item → Loudness → Analyze loudness
- Analyze → Set to -14 LUFS (tai muu tavoite)

Tai render-asetuksissa:
- Normalize/Limit: Normalize to -14 LUFS
```

### LUFS-pohjainen normalisointi

```
Render-asetukset:

File → Render (Ctrl+Alt+R)
Options:
- Normalize/Limit to: -14 LUFS
- Limit to True Peak: -1 dBTP

REAPER normalisoi automaattisesti oikeaan tasoon.
```

---

## Tiedostoformaatit ja koodaus

### Streaming-jakelu

```
Spotify/Apple/Tidal vastaanottaa:
- WAV 16-bit 44.1 kHz (CD-laatu)
- FLAC (häviötön)
- Palvelut tekevät itse MP3/AAC/Ogg

Aggregaattorit (DistroKid, TuneCore):
- WAV 16-bit 44.1 kHz
- Tai 24-bit 44.1/48 kHz
```

### YouTube/SoundCloud

```
Suositus:
- WAV tai FLAC (paras laatu)
- Tai: MP3 320 kbps / AAC 256 kbps

YouTube konvertoi itse, joten:
- Lähetä paras mahdollinen laatu
```

### Podcast

```
MP3:
- 128 kbps (mono) - standardi
- 192 kbps (stereo) - jos musiikkia

Tai: AAC 128 kbps (parempi laatu samalla bitratella)
```

### Broadcast

```
Tyypillisesti:
- WAV 24-bit 48 kHz
- Broadcast WAV (BWF) metatiedoilla
```

---

## Loudness workflow eri genreille

### Pop/EDM

```
Tavoite: -14 LUFS, -1 dBTP
LRA: 5-8 LU (tiukka dynamiikka ok)

Workflow:
1. Miksaa tavoite -18 LUFS
2. Master-ketju: EQ → Comp → Limiter
3. Limiter nostaa -14 LUFS:iin
4. Tarkista True Peak
```

### Rock/Metal

```
Tavoite: -14 LUFS, -1 dBTP
LRA: 6-10 LU

Workflow:
1. Älä ylikompressoi (dynamiikka tärkeää)
2. Limiter vain estämään clippausta
3. Jos liian hiljainen, tarkista miksaus
```

### Jazz/Klassinen

```
Tavoite: -14 to -18 LUFS
LRA: 12-20 LU (säilytä dynamiikka!)

Workflow:
1. VÄHÄN tai EI kompressiota
2. Kevyt limiter vain turvallisuudeksi
3. Hyväksy "hiljaisempi" loudness
4. Streamit normalisoivat ylös
```

### Podcast/Puhe

```
Tavoite: -16 LUFS, -1 dBTP
LRA: 5-10 LU

Workflow:
1. Kompressio tasaa dynamiikkaa
2. Limiter estää huudot clippaamiselta
3. Selkeys tärkeämpi kuin loudness
```

---

## Yleisimmät virheet

### 1. Liian kova masteri

```
Ongelma: -8 LUFS, ei dynamiikkaa
Tulos: Spotify laskee -14 LUFS:iin, kappale kuulostaa "litteältä"

Ratkaisu: Masteroi -14 LUFS, säilytä dynamiikka
```

### 2. True Peak -ylitys

```
Ongelma: 0 dBTP tai yli
Tulos: Clipping MP3/AAC-koodauksessa (palvelun päässä)

Ratkaisu: Limiter ceiling -1 dBTP
```

### 3. Eri loudness joka kappaleessa (albumi)

```
Ongelma: Kappale 1 = -10 LUFS, Kappale 2 = -16 LUFS
Tulos: Epätasainen kuuntelukokemus

Ratkaisu: Tarkista jokaisen kappaleen LUFS, tasaa
```

### 4. Mono-compatibility unohtuu

```
Ongelma: Miksaus kuulostaa hyvältä stereona, huonolta monona
Tulos: Bluetooth-kaiuttimet, some-videot kärsii

Ratkaisu: Tarkista aina mono (JS: Mono Button)
```

---

## REAPER Render -asetukset

### Streaming-julkaisuun

```
File → Render

Format: WAV
Sample rate: 44100 Hz
Channels: Stereo
WAV bit depth: 16 (tai 24 jos aggregaattori hyväksyy)

Normalize/Limit:
☑ Normalize to: -14 LUFS
☑ Limit to true peak: -1 dBTP
```

### YouTube-videoon

```
Format: WAV (tai video container)
Sample rate: 48000 Hz (video-standardi)
Channels: Stereo
Bit depth: 24

Normalize/Limit:
☑ -14 LUFS
☑ -1 dBTP
```

### Podcastiin

```
Format: MP3
Bitrate: 128 kbps (mono) tai 192 kbps (stereo)
Sample rate: 44100 Hz

Normalize/Limit:
☑ -16 LUFS
☑ -1 dBTP
```

---

## AI-vastausohjeet

Kun käyttäjä kysyy loudnessista tai julkaisusta:

1. **Kysy** kohde-alusta (Spotify, YouTube, podcast, TV?)
2. **Kerro** oikea LUFS-tavoite
3. **Neuvo** True Peak -raja
4. **Auta** render-asetuksissa
5. **Varoita** yli-limitoinnista

**Esimerkki:**
```
Spotify-julkaisuun:

Tavoite: -14 LUFS, -1 dBTP

Komento: add_fx
Args: { track: "Master", fx_name: "ReaLimit" }

Aseta ReaLimit:
- Ceiling: -1 dB
- Käytä Youlean Loudness Meter tarkistamaan taso

Render-asetuksissa voit myös valita:
"Normalize to -14 LUFS" + "Limit true peak to -1 dBTP"

Haluatko että lisään loudness-mittarin Master-raitaan?
```
