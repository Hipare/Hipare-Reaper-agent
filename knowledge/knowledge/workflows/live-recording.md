# Live Recording Guide - Live-nauhoitus

## Yleiskatsaus

Live-nauhoitus kattaa:
- Konserttinauhoitus (multitrack)
- Harjoitusten nauhoitus
- Livekeikan tallennus
- Soundcheck ja line check
- Virtuaalinen soundcheck

---

## Multitrack live -nauhoitus

### Laitteisto

```
Tarvitset:
1. Audio interface (riittävästi kanavia)
   - 8-16 kanavaa pienille bändeille
   - 24-32 kanavaa isoille kokoonpanoille
   
2. Stage box / snake (pitkä kaapeli lavalta)
3. Splitter (jakaa signaalit PA:lle ja nauhoitukselle)
4. Tietokone + REAPER
5. Varmuuskopiointi (toinen tallennin/drive)

Signaaliketju:
Mikrofoni → Splitter → PA (live-miksaus)
                    → Interface → REAPER (nauhoitus)
```

---

## REAPER-asetukset

### Projektiasetus

```
Sample rate: 48 kHz (standardi live)
Bit depth: 24-bit (headroomia)

File → Project settings → Media
- WAV bit depth: 24
- Large files: checked (yli 2 GB)
```

### Raitarakenne

```
📁 DRUMS
  ├── Kick In
  ├── Kick Out
  ├── Snare Top
  ├── Snare Bottom
  ├── Hi-Hat
  ├── OH L / OH R
📁 BASS
  ├── Bass DI
  └── Bass Amp
📁 GUITARS
📁 VOCALS
  ├── Lead Vocal
  └── Backing Vocals
📁 AUDIENCE
  ├── Audience L
  └── Audience R
```

---

## Soundcheck

### Gain staging

```
Live-nauhoituksessa:
- Peak: -12 to -6 dBFS
- Jätä PALJON headroomia!
- Live voi olla kovempaa kuin soundcheckissa

KRIITTISTÄ: Clipping ei voi korjata jälkikäteen!
```

### Virtuaalinen soundcheck

```
= Soita nauhoitettua multitrackia PA:sta

1. Nauhoita soundcheck
2. Aja nauhoitus REAPER → Interface → PA
3. Säädä PA-miksaus ilman bändiä
```

---

## Nauhoituksen aikana

### Markerit

```
Käytä markereita merkitsemään:
- Kappaleiden alut (M = add marker)
- Ongelmat ("FEEDBACK", "CLIP")
- Erikoiskohdat ("GREAT SOLO")
```

### Varmuuskopiointi

```
KRIITTISTÄ: Tallenna useaan paikkaan!

1. Ensisijainen: SSD/NVMe
2. Backup: Toinen drive
3. Auto-save: 5 min välein
```

---

## Jälkikäsittely

### Live-miksauksen erityispiirteet

```
1. Vuotoa (bleed):
   - Käytä gating varovasti
   - Hyväksy osa vuodosta (live-fiilis)

2. Ei täydellisiä ottoja:
   - Säilytä energia ja fiilis
   - Älä yritä tehdä "studiolevystä"

3. Yleisö-ääni:
   - TÄRKEIN live-elementti
   - Säädä taso sopivaksi
```

---

## Yleisö-nauhoitus

```
Mikitys:
- Stereopari lavalta yleisöön päin
- Noin 2-3m korkeuteen

Käsittely:
- HPF 150-200 Hz (poista basso-vuoto)
- Boost 2-5 kHz (aplodien selkeys)
- Tasoita kompressorilla
```

---

## Checklist ennen keikkaa

```
□ Interface + kaapelit testattu
□ REAPER-projekti valmiina
□ Input routing tarkistettu
□ Kovalevytila riittävä (1h ≈ 10 GB @ 24 raitaa)
□ Backup-ratkaisu valmiina
□ Auto-save päällä
□ Markerit valmiina
```

---

## AI-vastausohjeet

Kun käyttäjä kysyy live-nauhoituksesta:

1. **Kysy** kokoonpanon koko
2. **Neuvo** gain staging (-12 to -6 dBFS headroom!)
3. **Muistuta** varmuuskopioinnista
4. **Auta** raitarakenteen luomisessa

**Esimerkki:**
```
Komento: create_track
Args: { name: "Kick", role: "drums" }

Komento: create_track  
Args: { name: "Snare", role: "drums" }

Komento: create_track
Args: { name: "Audience_L", role: "generic" }

TÄRKEÄÄ: Jätä gain -12 to -6 dBFS!
```
