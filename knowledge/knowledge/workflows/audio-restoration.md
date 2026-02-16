# Audio Restoration Guide - Äänen restaurointi

## Yleiskatsaus

Äänen restaurointi tarkoittaa huonolaatuisen tai vaurioituneen äänen korjaamista:
- Kohinanpoisto (hiss, hum, buzz)
- Napsahdusten ja poksahdusten poisto
- Clipping-korjaus
- Sähköhuminan poisto (50/60 Hz)
- Tuulikohinan poisto
- Vinyylin restaurointi
- Vanhojen nauhoitusten elvytys

---

## REAPERin sisäänrakennetut työkalut

### ReaFIR - Monitoimityökalu

ReaFIR on tehokkain ilmainen työkalu restaurointiin.

**Kohinanpoisto (Noise Reduction):**
```
1. Lisää ReaFIR raidalle
2. Valitse Mode: "Subtract"
3. Etsi kohtaa jossa on VAIN kohinaa (ei signaalia)
4. Toista ja klikkaa "Automatically build noise profile"
5. Nyt ReaFIR vähentää tätä kohinaa koko raidalta

Varoitus: Liian aggressiivinen käyttö tekee "vesimäisen" äänen
```

**EQ-korjaukset:**
```
1. Mode: "EQ"
2. Piirrä taajuusvaste käsin
3. Voit leikata tietyt taajuudet tarkasti
```

### ReaEQ - Huminan poisto

**50 Hz huminan poisto (EU sähköverkko):**
```
1. Lisää ReaEQ
2. Tee notch filter:
   - Frequency: 50 Hz
   - Gain: -30 dB
   - Q: 10-20 (kapea)
3. Toista harmonikoille: 100 Hz, 150 Hz, 200 Hz, 250 Hz
```

**60 Hz huminan poisto (US sähköverkko):**
```
Sama kuin yllä, mutta taajuudet:
60 Hz, 120 Hz, 180 Hz, 240 Hz, 300 Hz
```

### ReaGate - Hiljaisten kohtien puhdistus

```
Poistaa kohinan kun signaalia ei ole:

Threshold: -40 to -50 dB
Attack: 1-5 ms
Hold: 50-100 ms
Release: 100-200 ms

Ei poista kohinaa signaalin aikana!
```

---

## Napsahdusten ja poksahdusten poisto

### Manuaalinen poisto REAPERissä

```
1. Zoomaa sisään napsahduskohtaan
2. Valitse napsahdus (muutama ms)
3. Kokeile:
   a) Edit → Heal selected media items
   b) Item properties → Fade in/out (lyhyt crossfade)
   c) Maalaa yli: valitse → Edit → Item → Repair (jos saatavilla)
```

### JS: Click/Pop eliminator

```
REAPERin mukana tulee:
JS: IX/Pops_Clicks_Fixer

Käyttö: Säädä threshold kunnes napsahdukset katoavat
```

### Ilmaiset VST-vaihtoehdot

- **Bertom Denoiser** - sisältää declicker
- **Izotope RX Elements** (joskus ilmaiseksi tarjouksissa)

---

## Clipping-korjaus

### Mitä on clipping?
Kun signaali ylittää 0 dBFS, se "leikkautuu" aiheuttaen säröä.

### Korjausvaihtoehdot

**Kevyt clipping:**
```
1. Laske äänenvoimakkuutta item gainilla
2. Lisää soft clipper/limiter
3. Saturaatio voi peittää säröä
```

**Vakava clipping:**
```
1. Käytä iZotope RX De-clip (maksullinen)
2. Tai: Accusonus ERA De-Clipper
3. Ei täydellistä ilmaista vaihtoehtoa

Ilmainen vaihtoehto (rajoitettu):
- Vedä volume alas
- Käytä multiband kompressoria tasoittamaan
- EQ: leikkaa teräviä ylätaajuuksia
```

---

## Vinyyli ja nauha -restaurointi

### Vinyylin tyypilliset ongelmat

1. **Napsahdukset ja poksahdukset** - pöly, naarmut
2. **Humina** - maasilmukka
3. **Wow ja flutter** - nopeusvaihtelut
4. **RIAA-korjaus** - väärä taajuusvaste

### Vinyylin restaurointi workflow

```
1. Digitoi WAV-muotoon (24-bit, 96 kHz suositeltava)
2. Normalisoi (ei yli -1 dBFS)
3. RIAA-korjaus (jos suoralinkki ilman preamppia)
4. Poista napsahdukset (declicker)
5. Poista humina (notch filter 50/60 Hz)
6. Kohinanpoisto (ReaFIR, varovainen)
7. EQ-korjaukset (palauta taajuudet)
8. Vie 16-bit 44.1 kHz
```

### Nauhan tyypilliset ongelmat

1. **Tape hiss** - korkeataajuinen kohina
2. **Dropout** - signaalin katoaminen
3. **Print-through** - edellisen kierroksen vuoto
4. **Azimuth error** - stereo-ongelmat

### Nauhan restaurointi

```
Tape hiss -poisto:
1. ReaFIR "Subtract" mode
2. Ota profiili hiljaisesta kohdasta
3. Säädä varovasti (liika tekee tylsän)

Vaihtoehtoisesti:
- Low-pass filter 12-14 kHz (poistaa hissin, myös yläsävyt)
```

---

## Ilmaiset restaurointityökalut

### Suositellut ilmaiset pluginit

| Plugin | Käyttö | Linkki |
|--------|--------|--------|
| ReaFIR | Kohinanpoisto, EQ | REAPERin mukana |
| Bertom Denoiser | Kohinanpoisto | bertom.org |
| Voxengo SPAN | Analyysi | voxengo.com |
| TDR Nova | Dynaaminen EQ | tokyodawn.net |
| JS: Clickpop Fixer | Napsahdukset | REAPERin mukana |

### Maksulliset ammattilaistyökalut

| Plugin | Käyttö | Hinta |
|--------|--------|-------|
| iZotope RX | Kaikki restaurointi | $129-1199 |
| Accusonus ERA Bundle | Yksinkertainen käyttö | $99-399 |
| Acon Digital Restoration Suite | Edullinen vaihtoehto | $99 |
| Waves Z-Noise | Kohinanpoisto | $29-149 |

---

## Tyypilliset skenaariot

### 1. Haastattelunauhoitus kohinaisessa tilassa

```
Workflow:
1. ReaGate (poista hiljaiset kohdat)
2. ReaFIR (kohinaprofiili + subtract)
3. ReaEQ (HPF 80 Hz, presence boost)
4. ReaComp (tasaa dynamiikka)

Huom: Älä yritä poistaa kaikkea kohinaa - luonnollisuus kärsii
```

### 2. Vanha perhenauhoitus

```
Workflow:
1. Digitoi parhaalla laadulla
2. Poista selvä humina (notch filter)
3. Varovainen kohinanpoisto
4. ÄLÄ yli-prosessoi - "patina" voi olla toivottavaa
```

### 3. Live-nauhoitus, jossa feedbackia

```
Workflow:
1. Etsi feedback-taajuus (SPAN-analysaattori)
2. Tee kapea notch filter ko. taajuudelle
3. Tai: Dynaaminen EQ (TDR Nova) joka leikkaa vain kun feedback
```

### 4. Tuulikohinan poisto (ulkonauhoitus)

```
Workflow:
1. HPF 150-200 Hz (tuulen energia on matalilla)
2. ReaFIR subtract mode
3. Hyväksy että osa menee, osa jää
```

---

## Laatuvertailu: Ilmainen vs. maksullinen

| Tehtävä | Ilmainen ratkaisu | Maksullinen |
|---------|-------------------|-------------|
| Kohina | ReaFIR (hyvä) | iZotope RX (erinomainen) |
| Napsahdukset | JS: Clickpop (ok) | iZotope RX De-click (erinomainen) |
| Clipping | Ei hyvää | iZotope RX De-clip (hyvä) |
| Humina | ReaEQ notch (hyvä) | RX De-hum (erinomainen) |
| Kokonaisratkaisu | Työläämpi | Helppo ja nopea |

---

## Yleiset virheet restauroinnissa

1. **Liian aggressiivinen kohinanpoisto**
   - Aiheuttaa "vesimäisen" tai "robottimaisen" äänen
   - Ratkaisu: Vähemmän on enemmän
   
2. **Liian kapea notch filter**
   - Aiheuttaa faasiongelmia
   - Ratkaisu: Käytä hieman leveämpää Q:ta

3. **Dynaamisten kohtien tuhoaminen**
   - Liika kompressio hävittää luonnollisuuden
   - Ratkaisu: Säilytä dynamiikka

4. **Alkuperäisen tuhoutuminen**
   - AINA säilytä alkuperäinen tiedosto!
   - Työskentele kopion kanssa

---

## AI-vastausohjeet

Kun käyttäjä kysyy restauroinnista:

1. **Kysy** mikä ongelma (kohina, napsahdukset, humina, clipping?)
2. **Selvitä** kuinka vakava ongelma on
3. **Ehdota** ReaFIR + ReaEQ -yhdistelmää perustilanteisiin
4. **Varoita** yli-prosessoinnista
5. **Suosittele** maksullisia työkaluja vakaviin ongelmiin

**Esimerkki:**
```
Kohinanpoistoon käytä ReaFIR:iä:

Komento: add_fx
Args: { track: "Nauhoitus", fx_name: "ReaFIR" }

Käyttö:
1. Etsi kohta jossa on VAIN kohinaa
2. Valitse "Subtract" mode
3. Klikkaa "Automatically build noise profile"
4. Säädä amount varovasti - liika tekee robottimaisen äänen

Haluatko että lisään myös gaten hiljaisille kohdille?
```
