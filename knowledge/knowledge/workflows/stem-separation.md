# Stem Separation Guide - Stemmojen Erottelu

## Mitä on stemmojen erottelu?

Stemmojen erottelu (stem separation / source separation) on AI-pohjainen tekniikka, jolla valmiista stereomiksauksesta erotetaan yksittäiset äänilähteet:

- **Vocals** (laulu/puhe)
- **Drums** (rummut)
- **Bass** (basso)
- **Other** (kitarat, syntetisaattorit, muut instrumentit)

Jotkut työkalut erottelevat myös:
- Piano
- Guitar (erikseen)
- Strings
- Wind instruments

## Milloin tarvitaan?

- Remixien tekeminen (vain laulu tai instrumentaali)
- Coverversiot (poista alkuperäinen laulu)
- Sample-pohjainen tuotanto
- Karaoke-versiot
- Opiskelutarkoitukset (kuuntele yksittäisiä soittimia)
- Miksauksen korjaaminen jälkikäteen
- Transkriptio (helpompi kuulla yksittäisiä soittimia)

## Tärkeä huomio

**Stem separation EI tapahdu REAPERin sisällä** - se tehdään erillisellä työkalulla ja tulokset tuodaan REAPERiin.

Workflow:
```
1. Vie miksaus WAV-tiedostona (tai käytä olemassaolevaa)
2. Prosessoi stem separation -työkalulla
3. Tuo erotellut stemmat REAPERiin omille raidoilleen
4. Jatkokäsittele REAPERissä
```

---

## Suositellut työkalut

### 1. Demucs (Meta AI) - PARAS ILMAINEN

**Laatu:** ⭐⭐⭐⭐⭐ (paras saatavilla)
**Hinta:** Ilmainen (avoin lähdekoodi)
**Käyttö:** Komentorivi (Python)

**Asennus:**
```bash
# Vaatii Python 3.8+
pip install demucs

# TAI Anacondalla:
conda install -c conda-forge demucs
```

**Käyttö:**
```bash
# Peruserottelu (4 stemmaa: vocals, drums, bass, other)
demucs "kappale.mp3"

# 6 stemmaa (lisää piano ja guitar)
demucs --two-stems=vocals "kappale.mp3"  # vain vocals + instrumentaali

# Paras laatu (hitaampi)
demucs -n htdemucs_ft "kappale.mp3"
```

**Tulostiedostot:**
```
separated/htdemucs/kappale/
├── vocals.wav
├── drums.wav
├── bass.wav
└── other.wav
```

**Mallit:**
- `htdemucs` - Oletusmalli, hyvä tasapaino
- `htdemucs_ft` - Hienosäädetty, paras laatu (hitaampi)
- `htdemucs_6s` - 6 stemmaa (+ piano, guitar)

---

### 2. Moises.ai - HELPOIN

**Laatu:** ⭐⭐⭐⭐
**Hinta:** Ilmainen (rajoitettu) / Premium ~$4-10/kk
**Käyttö:** Verkkosivu tai sovellus

**Edut:**
- Ei asennusta
- Helppokäyttöinen
- Mobiilisovellus
- Tempo/key detection

**Käyttö:**
1. Mene https://moises.ai
2. Lataa tiedosto
3. Valitse erottelutapa
4. Lataa stemmat

---

### 3. LALAL.AI - NOPEA VERKKOPALVELU

**Laatu:** ⭐⭐⭐⭐
**Hinta:** Ilmainen (10 min/kk) / Maksullinen paketit
**Käyttö:** Verkkosivu + API

**Käyttö:**
1. Mene https://www.lalal.ai
2. Lataa tiedosto
3. Valitse Vocal/Instrumental tai tarkempi erottelu
4. Lataa tulokset

---

### 4. Spleeter (Deezer) - NOPEIN

**Laatu:** ⭐⭐⭐
**Hinta:** Ilmainen
**Käyttö:** Komentorivi (Python)

**Asennus:**
```bash
pip install spleeter
```

**Käyttö:**
```bash
# 2 stemmaa (vocals + accompaniment)
spleeter separate -o output/ audio.mp3 -p spleeter:2stems

# 4 stemmaa
spleeter separate -o output/ audio.mp3 -p spleeter:4stems

# 5 stemmaa (vocals, drums, bass, piano, other)
spleeter separate -o output/ audio.mp3 -p spleeter:5stems
```

**Huom:** Spleeter on vanhempi ja laatu ei ole yhtä hyvä kuin Demucsilla.

---

### 5. Ultimate Vocal Remover (UVR) - GUI

**Laatu:** ⭐⭐⭐⭐⭐
**Hinta:** Ilmainen
**Käyttö:** Graafinen käyttöliittymä (Windows/Mac/Linux)

**Edut:**
- Käyttää useita malleja (Demucs, MDX-Net, VR Arch)
- Graafinen käyttöliittymä
- Batch-prosessointi

**Lataus:** https://github.com/Anjok07/ultimatevocalremovergui

---

### 6. iZotope RX (Music Rebalance) - AMMATTILAINEN

**Laatu:** ⭐⭐⭐⭐⭐
**Hinta:** ~$399+ (RX Standard/Advanced)
**Käyttö:** Standalone tai VST

**Edut:**
- Integroituu suoraan DAW:iin
- Ammattilaistason laatu
- Music Rebalance -työkalu

**Huom:** Kallis, mutta ainoa joka toimii suoraan REAPERin sisällä VST:nä.

---

## REAPER-integraatio

### Stemmojen tuonti REAPERiin

**Manuaalinen tapa:**
1. Erottele stemmat valitsemallasi työkalulla
2. REAPERissa: Insert → Media file (Ctrl+I)
3. Valitse kaikki stemma-tiedostot
4. REAPER luo jokaiselle oman raidan
5. Varmista että stemmat alkavat samasta kohdasta (synkronointi)

**Vinkki:** Nimeä raidat selkeästi (Vocals, Drums, Bass, Other)

### Automaattinen workflow (edistynyt)

REAPERin ReaScript/Python-integraatiolla voi automatisoida:
```lua
-- Esimerkki: Luo raidat stemmoille
local stem_folder = "C:/separated/htdemucs/kappale/"
local stems = {"vocals.wav", "drums.wav", "bass.wav", "other.wav"}

for i, stem in ipairs(stems) do
    reaper.InsertMedia(stem_folder .. stem, 0)
end
```

---

## Laatuvertailu

| Työkalu | Vocals | Drums | Bass | Other | Nopeus |
|---------|--------|-------|------|-------|--------|
| Demucs htdemucs_ft | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Hidas |
| Demucs htdemucs | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Keskiverto |
| UVR (MDX-Net) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Keskiverto |
| Moises | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Nopea |
| Spleeter | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Erittäin nopea |
| LALAL.AI | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Nopea |

---

## Rajoitukset ja ongelmat

### Tyypilliset ongelmat:

1. **Artefaktit** - Kaikissa työkaluissa esiintyy jonkin verran "vuotoa" stemmojen välillä
2. **Stereo-ongelmat** - Joskus stereo-kuva kärsii
3. **Transientit** - Terävät iskut voivat mennä väärään stemmaan
4. **Reverb** - Kaiut jakautuvat usein useaan stemmaan

### Parhaat käytännöt:

- Käytä parasta mahdollista lähtötiedostoa (WAV > MP3)
- Kokeile useita työkaluja ja valitse paras tulos
- Jatkokäsittele REAPERissä (EQ, gate) artefaktien vähentämiseksi
- Hyväksy että täydellistä erottelua ei ole olemassa

---

## Suomenkieliset termit

| Suomi | Englanti |
|-------|----------|
| Stemmojen erottelu | Stem separation |
| Lähde-erottelu | Source separation |
| Lauluraita | Vocal track |
| Instrumentaali | Instrumental |
| Taustamusiikki | Backing track |
| Karaoke-versio | Karaoke version |
| Vuoto | Bleed/leakage |
| Artefakti | Artifact |

---

## AI-vastausohjeet

Kun käyttäjä kysyy stemmojen erottelusta:

1. **Selitä** että se tehdään REAPERin ulkopuolella
2. **Suosittele** Demucsia (paras ilmainen) tai Moisesta (helpoin)
3. **Kerro** workflow: erottele → tuo REAPERiin → jatkokäsittele
4. **Varoita** artefakteista ja laadun rajoituksista
5. **Tarjoa** apua stemmojen jatkokäsittelyssä REAPERissä

**Esimerkki vastaus:**
```
Stemmojen erottelu tehdään REAPERin ulkopuolella erillisellä työkalulla.

Suosittelen Demucsia (ilmainen, paras laatu):
1. Asenna: pip install demucs
2. Aja: demucs "kappale.mp3"
3. Tuo tulokset REAPERiin (Ctrl+I)

Voin auttaa stemmojen jatkokäsittelyssä kun olet tuonut ne REAPERiin!
```
