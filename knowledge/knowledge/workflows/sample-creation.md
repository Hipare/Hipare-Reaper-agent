# Sample Creation Guide - Samplejen luonti

## Yleiskatsaus

Samplejen luonti REAPERissä:
- Drum loops (rumpulooppien luonti)
- One-shots (yksittäiset iskut)
- Melodic loops (melodiset loopit)
- Vocal chops (laulupätkät)
- Foley/texture samples
- Sample pack -tuotanto
- Oikea nimeäminen ja organisointi

---

## Perusperiaatteet

### Hyvän samplen ominaisuudet

```
1. Puhdas ääni (ei ylimääräistä kohinaa)
2. Oikea pituus (loopissa tasainen, one-shotissa tiivis)
3. Oikea taso (-3 to -6 dBFS peak)
4. Oikea alkupiste (transientti alussa)
5. Fade out (ei klikkejä lopussa)
6. Selkeä nimeäminen
```

### Tiedostoformaatit

```
WAV 24-bit 44.1 kHz - Standardi
WAV 24-bit 48 kHz - Video/ammattikäyttö
WAV 16-bit 44.1 kHz - Vanhemmat samplerit

EI MP3 - Häviöllinen, huonompi laatu
```

---

## Drum Loops

### Loop-nauhoitus REAPERissä

```
1. Aseta tempo:
   Project → Project settings → BPM (esim. 120)

2. Aseta grid:
   Options → Snap/Grid → Grid: 1/4 tai 1/8

3. Nauhoita:
   - Count-in: Options → Metronome → Count-in before recording
   - Nauhoita täydet tahdit (4, 8, 16)

4. Loop-piste:
   - Valitse tasainen alue (esim. 4 tahtia)
   - Trimm alku ja loppu TARKASTI beat-kohtiin
```

### Loop-editointi

```
1. Zoomaa alkuun - varmista transientti grid-kohdassa
2. Zoomaa loppuun - trimm ennen seuraavaa beatia
3. Testaa loop:
   - Item properties → Loop source
   - Venytä item ja kuuntele onko saumaton

4. Crossfade loopille:
   - Lyhyt fade-in (1-5 ms)
   - Lyhyt fade-out (5-20 ms)
   - Estää klikit
```

### Loop-tasoitus

```
Käsittelyketju:

1. ReaEQ - Muokkaa taajuudet halutuksi
2. ReaComp - Tasaa dynamiikkaa HIEMAN
   - Ratio: 2:1 - 3:1
   - Älä yli-kompressoi (sample-käyttäjä haluaa kontrollin)
3. Soft clip/limiter - Estä yli 0 dB

Peak-taso: -3 to -6 dBFS
(Jätä headroomia sample-käyttäjälle!)
```

---

## One-Shots (Yksittäiset iskut)

### Rumpujen one-shot nauhoitus

```
KICK:
1. Nauhoita useita iskuja
2. Valitse paras (transientti, sointi)
3. Trim: alku transientista, loppu kunnes decay loppuu
4. Fade out (5-20 ms ennen loppua)

SNARE:
1. Nauhoita eri dynamiikoilla (soft, medium, hard)
2. Trim kuten kick
3. Säilytä sustain ja reverb tail (tai leikkaa kuivaksi)

HI-HAT:
1. Open ja closed erikseen
2. Eri intensiteetit
3. Trim tiiviisti
```

### One-shot käsittely

```
Kick:
- ReaEQ: HPF 30 Hz (poista sub-rumble), nosta 60-80 Hz (punch)
- Soft clip: estä transient-clippailu
- Peak: -3 dBFS

Snare:
- ReaEQ: leikkaa 200-300 Hz (boxiness), nosta 4-5 kHz (crack)
- Peak: -3 dBFS

Hi-hat:
- ReaEQ: HPF 200-400 Hz (poista vuoto)
- Peak: -6 dBFS
```

---

## Melodic Loops

### Melodisen loopin luominen

```
1. Valitse sävellaji ja tempo
2. Soita/ohjelmoi loop
3. TÄRKEÄÄ: Pidä tempo ja key mukana tiedostonimessä!
   Esim: "Synth_Lead_Am_120BPM.wav"

4. Harmonic content:
   - Yksinkertaiset soinnut/melodiat toimivat parhaiten
   - Liian monimutkaiset vaikea sovittaa
```

### Tempo-synkka sample

```
REAPER-vienti loopille:

1. Valitse tasaiset tahdit
2. File → Render
3. Bounds: Time selection
4. Embed: Tempo + Time signature

Tai manuaalisesti:
- Laske tarkka kesto: tahdit × (60/BPM) × 4
- Esim. 4 tahtia @ 120 BPM = 4 × 0.5 × 4 = 8 sekuntia
```

---

## Vocal Chops

### Vocal chop -workflow

```
1. Tuo laulu/acappella
2. Etsi kiinnostavia tavuja, sanoja, huudahduksia
3. Leikkaa erikseen (S-työkalu)
4. Prosessoi:
   - Pitch shift (ReaPitch) - transponoi
   - Time stretch - venytä/tiivistä
   - Reverse - käännä takaperin
   - Chop + rearrange - leikkaa ja järjestä uudelleen

5. Vie yksittäisinä sampleina
```

### Vocal chop -efektit

```
Luovia efektejä:

1. Vocode:
   - Carrier: synth pad
   - Modulator: vocal
   - Tulos: "robotti" -vocal

2. Formant shift:
   - ReaPitch → Formant shift
   - Muuttaa "sukupuolta" ja karakteria

3. Granular:
   - Käytä granular plugin (esim. Emergence)
   - Hajota vocal tekstuuriksi

4. Reverse reverb:
   - Lisää reverb
   - Käännä takaperin
   - Tulos: "swelling" ennen iskua
```

---

## Sample Pack -tuotanto

### Kansiorakenne

```
MyPack_DrumKit/
├── Kicks/
│   ├── Kick_Punchy_01.wav
│   ├── Kick_Punchy_02.wav
│   ├── Kick_Sub_01.wav
│   └── ...
├── Snares/
│   ├── Snare_Crack_01.wav
│   ├── Snare_Rimshot_01.wav
│   └── ...
├── Hi-Hats/
│   ├── HH_Closed_01.wav
│   ├── HH_Open_01.wav
│   └── ...
├── Percussion/
├── Loops/
│   ├── Loop_Funk_120BPM_01.wav
│   └── ...
└── _Info.txt
```

### Nimeämiskäytännöt

```
[Tyyppi]_[Kuvaus]_[Tempo/Key]_[Numero].wav

Esimerkkejä:
Kick_Punchy_01.wav
Snare_Tight_HiVel_01.wav
Loop_HipHop_90BPM_Cm_01.wav
Vocal_Chop_Ah_F#_01.wav
Synth_Pad_Am_80BPM_01.wav
```

### Batch-vienti REAPERissä

```
Kun haluat viedä useita sampleja kerralla:

1. Jaa samples erillisiksi itemeiksi
2. Valitse kaikki (Ctrl+A)
3. File → Render
4. Source: Selected media items
5. Tiedostonimeksi: $item (käyttää item-nimeä)
6. Render

Tuloksena: jokainen item omana WAV-tiedostona
```

---

## Erikoistapaukset

### Foley/Texture samples

```
Tekstuuri-samplet:
- Ambienssit (sade, tuuli, kahvila)
- Pintatekstuurit (hiekka, vesi, metalli)
- Liikkeet (vaatteet, askeleet)

Nauhoitus:
1. Kenttä-tallennin tai hyvä mikrofoni
2. Pitkiä ottoja (30 sek - 2 min)
3. Vältä selviä transientteja (tai sisällytä tarkoituksella)

Käsittely:
- Kevyt kohinanpoisto
- Normalisointi
- Seamless loop (crossfade päät yhteen)
```

### Resampling (synteettisistä äänistä)

```
1. Luo synth-ääni (Vital, Surge, jne.)
2. Soita eri nuotteja, eri modulaatioita
3. Nauhoita REAPER-raidalle
4. Leikkaa kiinnostavat kohdat
5. Vie sampleina

Vinkki: Nauhoita liikettä (filter sweep, LFO) pitkänä ottona
         → leikkaa palasiksi → ainutlaatuisia sampleja
```

---

## Mastering sampleille

### Sample-spesifinen mastering

```
Tavoitteet:
- Tasainen laatu koko pakin läpi
- Riittävä headroom (-3 to -6 dBFS)
- Puhdas, ei klikkejä

EI:
- Heavy limitteri (sample-käyttäjä haluaa dynamiikkaa)
- Heavy kompressio
- Leikkaamaton transientti (pidä punch)

Prosessointi:
1. ReaEQ - Vain korjaava EQ
2. Soft clipper - Estä harsh peaks
3. Normalisoi peak-tasoon -3 dBFS
```

### Batch-normalisointi

```
1. Valitse kaikki samplet
2. Item → Normalize items
3. Normalize to: -3 dB (peak)
4. Apply

Tai render-asetuksissa:
- Normalize/Limit: Normalize to -3 dB
```

---

## REAPER-asetukset sample-työhön

### Projektiasetus

```
Sample rate: 44100 Hz (standardi) tai 48000 Hz
Bit depth: 24-bit
Timebase: Beats (tempo-pohjaiselle työlle)

Grid: 1/16 tai pienempi (tarkkuus)
Snap: On (osuu gridiin)
```

### Hyödyllisiä pikanäppäimiä

```
S - Split item
Ctrl+L - Lock item (estä vahingossa siirto)
F2 - Rename item
G - Group selected items
Ctrl+Shift+R - Render selected items
```

---

## AI-vastausohjeet

Kun käyttäjä kysyy samplejen luomisesta:

1. **Kysy** sample-tyyppi (loop, one-shot, vocal chop?)
2. **Selvitä** käyttötarkoitus (oma tuotanto, myyntipaketti?)
3. **Neuvo** oikea taso ja formaatti
4. **Auta** nimeämisessä ja organisoinnissa
5. **Varoita** yli-prosessoinnista (jätä headroomia!)

**Esimerkki:**
```
Drum loop -samplelle:

1. Aseta tempo projektiin (Project settings → BPM)
2. Nauhoita tasaiset tahdit (4 tai 8)
3. Trim TARKASTI beattien kohtiin
4. Lisää lyhyet fadet (1-5 ms)

Komento: set_tempo
Args: { bpm: 120 }

Haluatko että luon raitarakenteen drum-nauhoitukselle?
```
