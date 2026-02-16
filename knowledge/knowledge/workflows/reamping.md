# Re-amping Guide - Uudelleenvahvistus

## Mitä on re-amping?

Re-amping tarkoittaa DI-signaalin (suora kitara/basso ilman vahvistinta) lähettämistä vahvistimeen jälkikäteen nauhoituksen jälkeen.

**Workflow:**
```
1. Nauhoita DI (puhdas signaali)
2. Miksausvaiheessa: Lähetä DI vahvistimeen
3. Nauhoita vahvistettu signaali
4. Yhdistä parhaiten sopiva tone miksaukseen
```

**Edut:**
- Kokeilet rajattomasti eri soundeja
- Ei kiire nauhoituksessa
- Voit yhdistää DI + amped signaalia
- Korjaa huono tone jälkikäteen

---

## Laitteisto-reamping

### Tarvittavat laitteet

```
1. Audio interface (vähintään 2 lähtöä)
2. Reamp-box (impedanssin sovitus)
3. Kitara/basso-vahvistin
4. Mikrofoni vahvistimelle
5. Kaapelit

Signaaliketju:
Interface OUT → Reamp Box → Amp → Mic → Interface IN
```

### Miksi reamp-box?

```
Audio interface output = Line level (~+4 dBu, low impedance)
Kitara/vahvistin input = Instrument level (~-20 dBu, high impedance)

Reamp-box:
- Laskee tason
- Nostaa impedanssin
- Poistaa ground loopit

Suosittuja reamp-boxeja:
- Radial ProRMP (~$100)
- Radial X-Amp (~$200)
- Palmer Daccapo (~$150)
- DIY (edullinen, toimii)
```

### REAPER-asetukset (hardware reamping)

```
1. Luo uusi raita "Reamped"
2. Input: Mikrofoni-input (mikattu vahvistin)
3. Routing:
   - DI-raita → Hardware output (reamp-boxiin)
   
4. Aseta latenssi-kompensointi:
   - Options → Preferences → Recording → Use input monitoring
   - Tai: Manuaalinen kompensointi jälkikäteen

5. Paina Record - nauhoita reampattu signaali
```

---

## Software Re-amping (Amp Sims)

### Miksi software?

```
+ Ei tarvita laitteistoa
+ Rajaton kokeilu
+ Recall (tallennetut asetukset)
+ Ilmaisia vaihtoehtoja

- Ei "oikean" vahvistimen fiilistä (joillekin)
- CPU-kuorma
```

### Ilmaiset amp-simulaattorit

| Plugin | Tyyli | Linkki |
|--------|-------|--------|
| Ignite Emissary | High gain | igniteamps.com |
| Ignite NadIR | IR Loader | igniteamps.com |
| LePou Legion | Marshall JCM800 | lepouplugins.blogspot.com |
| LePou Lecto | Mesa Rectifier | lepouplugins.blogspot.com |
| LePou HyBrit | Fender/Marshall | lepouplugins.blogspot.com |
| TSE X50 | 5150 | tseaudio.com |
| TSE 808 | Tube Screamer | tseaudio.com |
| ML Sound Lab Amped Roots | Modern metal | mlsoundlab.com |

### Software reamp -ketju REAPERissä

```
Tyypillinen ketju:

1. DI Guitar (raaka signaali)
   ↓
2. TSE 808 (Tube Screamer - tighten)
   - Drive: 0-20%
   - Level: boost
   - Tone: 50-70%
   ↓
3. Ignite Emissary (Amp sim)
   - Gain: 50-80%
   - EQ: tarpeen mukaan
   ↓
4. NadIR tai LePou LeCab2 (Cabinet IR)
   - Valitse sopiva IR
   ↓
5. ReaEQ (viimeistely)
   - HPF 80 Hz
   - Leikkaa mud (200-300 Hz)
   - Presence (3-5 kHz)
```

### REAPER-toteutus

```
Komento: add_fx
Args: { track: "Guitar_DI", fx_name: "TSE808" }

Komento: add_fx
Args: { track: "Guitar_DI", fx_name: "Ignite Emissary" }

Komento: add_fx
Args: { track: "Guitar_DI", fx_name: "NadIR" }

Komento: add_fx
Args: { track: "Guitar_DI", fx_name: "ReaEQ" }
```

---

## Cabinet IRs (Impulse Responses)

### Mitä ovat IRs?

```
IR = Impulse Response
= "Valokuva" kaiuttimen/tilan äänestä
= Sisältää: kaappi + mikrofoni + sijainti + huone

Käytetään simuloimaan kaiutinkaappia ilman fyysistä kaappia.
```

### Ilmaiset IR-kirjastot

| Lähde | Sisältö | Linkki |
|-------|---------|--------|
| Ignite NadIR | Mukana IReja | igniteamps.com |
| Ownhammer Free | 412 kaappeja | ownhammer.com |
| Seacow Cabs | Eri kaappeja | seacowcabs.wordpress.com |
| Wilkinson Audio | Mesa, Marshall | wilkinsonaudio.com |
| GuitarHack | Eri malleja | guitarhacks.net |
| Redwirez | Free pack | redwirez.com |

### IR-käyttö REAPERissä

```
1. Lisää NadIR tai ReaVerb (impulse mode)
2. Lataa IR-tiedosto (.wav)
3. Säädä:
   - Mix: 100% (kuiva signaali amp simista)
   - Low cut: tarpeen mukaan
   - High cut: poista fizz

Vinkki: Kokeile useita IReja - eri mikit, sijainnit
```

---

## Yhdistetty DI + Amped

### Miksi yhdistää?

```
DI = Selkeä, määritelty low-end, atakki
Amped = Karakteri, harmoniset, "elävyys"

Yhdistämällä saat molempien parhaat puolet.
```

### Blend-tekniikka REAPERissä

```
1. DI-raita (puhdas)
   - Prosessoi: ReaEQ (HPF, presence)
   - Pan: center
   
2. Amp-raita (kopioitu DI + amp sim)
   - Prosessoi: TSE 808 → Amp → IR
   - Pan: center (tai hieman eri)

3. Blend:
   - DI: -6 to -12 dB
   - Amp: 0 dB (täysi)
   - Säädä suhde kuunnellen

4. Faasin tarkistus:
   - Kuuntele mono
   - Jos ohut → flip phase DI-raidalla
   - Item properties → Phase: Invert
```

### Latenssin kompensointi

```
Amp sim -pluginit voivat aiheuttaa latenssia.

REAPER hoitaa automaattisesti (PDC), mutta tarkista:
1. Toista DI ja Amped yhtä aikaa
2. Zoomaa waveformiin
3. Jos ei ole linjassa → siirrä toista track delay:lla

Track → Track settings → Track delay (ms)
```

---

## Eri käyttötapaukset

### 1. Metal (Meshuggah-tyylinen)

```
Signaaliketju:
DI → TSE 808 → Ignite Emissary (Lead) → NadIR (Mesa 412)

TSE 808:
- Drive: 5-15%
- Level: MAX
- Tone: 60-70%

Emissary:
- Gain: 70-85%
- Treble: 6
- Mids: 5
- Bass: 5

ReaEQ (jälkeen):
- HPF 80 Hz
- Cut 200-300 Hz (mud)
- Boost 800 Hz (chunk)
- Boost 2-4 kHz (attack)
```

### 2. Blues/Classic Rock

```
Signaaliketju:
DI → LePou HyBrit → NadIR (Greenback)

HyBrit:
- Gain: 40-60%
- Treble: 7
- Bass: 4

EI tube screameria (halutaan dynaamisuus)
```

### 3. Clean (Jazzy/Pop)

```
Signaaliketju:
DI → LePou HyBrit (Clean) → NadIR → TAL-Chorus-LX

HyBrit:
- Gain: 15-25%
- Treble: 5
- Bass: 6

Lisää:
- Chorus (TAL-Chorus-LX)
- Reverb (Valhalla Supermassive)
```

---

## Bass Re-amping

### Bass-spesifiset huomiot

```
Bass amp simit:
- Ignite SHB-1 (SVT-tyylinen, ilmainen)
- TSE BOD (SansAmp-tyylinen)
- Analog Obsession (useita basso-plugineja)

Ketju:
DI → ReaEQ (HPF 30 Hz) → Amp sim → Optional: Saturation
```

### Bass blend -tekniikka

```
Track 1: DI (puhdas low-end)
- HPF 30 Hz
- LPF 200-300 Hz (vain sub)

Track 2: Amped (mid/high)
- HPF 200-300 Hz
- Amp sim + grit

Yhdistä: Tarkka low + karakteri mid/high
```

---

## Troubleshooting

### Ongelma: Ääni kuulostaa "fizzy"

```
Ratkaisu:
1. Laske treble amp simissä
2. LPF IRin jälkeen (5-8 kHz)
3. ReaEQ: leikkaa 4-6 kHz
```

### Ongelma: Liikaa "mud"

```
Ratkaisu:
1. Tube Screamer ennen amppia (tightens)
2. HPF 80-100 Hz
3. Leikkaa 200-400 Hz ReaEQ:lla
```

### Ongelma: Phase issues (ohut ääni)

```
Ratkaisu:
1. Tarkista mono-compatibility
2. Flip phase toisella raidalla
3. Siirrä aikaa track delay:lla
```

---

## AI-vastausohjeet

Kun käyttäjä kysyy re-ampingista:

1. **Kysy** onko DI jo nauhoitettu vai tarvitseeko neuvoa siinä
2. **Suosittele** software reampingia (ilmainen, helppoa)
3. **Ehdota** sopiva amp sim + IR -yhdistelmä genren mukaan
4. **Neuvo** tube screamer -käytössä (metal/rock)
5. **Muistuta** faasin tarkistuksesta jos blendaa

**Esimerkki:**
```
Software re-reamping DI-kitaralle:

Komento: add_fx
Args: { track: "Guitar_DI", fx_name: "TSE808" }

Komento: add_fx
Args: { track: "Guitar_DI", fx_name: "Ignite Emissary" }

Komento: add_fx
Args: { track: "Guitar_DI", fx_name: "NadIR" }

TSE 808 tiukentaa low-endin, Emissary antaa särösoinnin ja NadIR simuloi kaiutinkaappia. Haluatko metallia, rockia vai cleaniä soundia?
```
