# Hipare-huolto - Kattava opas

Tämä on Hiparen huolto-keskustelun käyttämä knowledge-tiedosto. Se sisältää kaiken tarvittavan tiedon vianmäärityksestä, asennusohjeista ja Hiparen käytöstä.

## 1. REAPER-yhteyden vianmääritys

### Miten Hipare kommunikoi REAPERin kanssa

Hipare käyttää **MCP (Model Context Protocol)** -siltaa kommunikoidakseen REAPERin kanssa:

1. **MCP Python Server** (total-reaper-mcp) - Python-palvelin joka tarjoaa työkalut
2. **Lua Bridge** (mcp_bridge.lua) - REAPER-skripti joka lukee komentoja ja suorittaa ne
3. **Bridge Data -kansio** - Tiedostopohjainen viestintäkanava palvelimen ja Luan välillä

### Tarkistuslista yhteysongelmin selvittämiseen

```
1. Onko REAPER käynnissä?
   → Jos ei, käynnistä REAPER ensin

2. Onko Lua bridge ladattu REAPERiin?
   → REAPER → Actions → Show action list → etsi "mcp_bridge" → Run
   → Jos ei löydy: Load ReaScript → valitse mcp_bridge.lua
   → HUOM: Bridge pitää ladata JOKA KERTA kun REAPER käynnistetään!
   → VINKKI: Set as autorun -asetus pitää bridgen aina päällä

3. Onko Bridge Data -kansio olemassa ja oikein konfiguroitu?
   → Windowsissa yleensä: C:\Users\[käyttäjä]\AppData\Roaming\REAPER\Scripts\mcp_bridge_data
   → macOS: ~/Library/Application Support/REAPER/Scripts/mcp_bridge_data
   → Polun pitää olla sama Hiparen asetuksissa ja Luan konfiguraatiossa

4. Tarkista Hiparen asetukset
   → Asetukset → Yhteysasetukset → Bridge Data -kansion polku
   → Polun pitää vastata Luan bridge_data -kansiota

5. Testaa yhteys
   → Asetukset → Yhteysasetukset → "Testaa MCP-yhteys" -nappi
```

### Yleisimmät virheilmoitukset ja ratkaisut

#### "MCP timeout" / Hidas vastaus
- **Syy**: REAPER ei vastaa ajoissa tai bridge ei ole ladattu
- **Ratkaisu**:
  1. Tarkista että REAPER on käynnissä
  2. Lataa mcp_bridge.lua uudelleen
  3. Ensimmäinen pyyntö voi olla hidas - kokeile uudelleen
  4. Jos toistuvia timeout-virheitä: sulje REAPER → avaa → lataa bridge

#### "REAPER-yhteyttä ei ole"
- **Syy**: Bridge ei ole aktiivinen
- **Ratkaisu**: Lataa mcp_bridge.lua REAPERiin (Actions → mcp_bridge → Run)

#### "Python-riippuvuudet puuttuvat"
- **Syy**: MCP-palvelin tarvitsee Python-kirjastoja
- **Ratkaisu**:
  ```
  pip install mcp pydantic
  ```
  tai projektin juuressa:
  ```
  pip install -r requirements.txt
  ```

## 2. API-avaimet - Hankkiminen ja asennus

API-avaimet mahdollistavat tekoälymallien käytön Hipareen. Vähintään yksi avain tarvitaan.

### Groq (suositeltu aloittelijalle)
- **Miksi**: Nopein, täysin ilmainen, helppo käyttää
- **Rajoitukset**: ~30 pyyntöä/min, ~14 400 pyyntöä/päivä

**Hankkiminen:**
1. Mene osoitteeseen: https://console.groq.com
2. Rekisteröidy (Google-tili tai sähköposti)
3. Klikkaa "API Keys" vasemmasta valikosta
4. Klikkaa "Create API Key" → anna nimi → kopioi avain
5. Avain alkaa "gsk_"

**Asennus Hipareen:**
1. Asetukset → API-avaimet (sivupalkista ⚙️)
2. Liitä avain Groq-kenttään
3. Tallenna
4. Käynnistä Hipare uudelleen

**Mallit**: Llama 3.3 70B (paras laatu), Llama 3.1 8B (nopein)

### Google Gemini
- **Miksi**: Hyvä laatu, ilmainen
- **Rajoitukset**: 15 pyyntöä/min (Flash), 2 pyyntöä/min (Pro)

**Hankkiminen:**
1. Mene: https://aistudio.google.com
2. Kirjaudu Google-tilillä
3. Klikkaa "Get API key" → "Create API key"
4. Valitse projekti → kopioi avain
5. Avain alkaa "AIza"

### OpenRouter
- **Miksi**: Laajin mallivalikoma, pääsy premium-malleihin
- **Rajoitukset**: Ilmaisia malleja rajallisesti, parhaat maksullisia

**Hankkiminen:**
1. Mene: https://openrouter.ai
2. Rekisteröidy
3. Klikkaa "Keys" → "Create Key"
4. Kopioi avain (alkaa "sk-or-v1-")

**Huom**: Claude, GPT-4 jne. vaativat saldon lataamista tilille.

### 429-virhe (Rate limit)
- **Syy**: Liikaa pyyntöjä lyhyessä ajassa
- **Ratkaisu**: Odota 1 minuutti ja kokeile uudelleen
- **Ehkäisy**: Käytä useampaa API-palvelua vuorotellen

### Invalid API key -virhe
- **Syy**: Avain on virheellinen tai vanhentunut
- **Ratkaisu**: Luo uusi avain palvelun sivulta

## 3. VST-pluginien asennus

### Mitä VST-pluginit ovat?

VST-pluginit ovat lisäohjelmia jotka lisäävät REAPERiin:
- **Instrumentteja** (VSTi): rummut, piano, syntetisaattorit
- **Efektejä**: kompressorit, EQ:t, reverbit, vahvistinsimulaattorit

REAPER sisältää peruspluginit (ReaEQ, ReaComp, ReaVerb jne.), mutta kolmannen osapuolen pluginit laajentavat mahdollisuuksia merkittävästi.

### Asennuspolut (Windows)

```
VST2-pluginit (.dll):
C:\Program Files\VSTPlugins\

VST3-pluginit (.vst3):
C:\Program Files\Common Files\VST3\
```

### Asennuspolut (macOS)

```
VST-pluginit:
/Library/Audio/Plug-Ins/VST/

VST3-pluginit:
/Library/Audio/Plug-Ins/VST3/

AU-pluginit (vain macOS):
/Library/Audio/Plug-Ins/Components/
```

### Asennus vaihe vaiheelta

1. **Lataa plugin** valmistajan sivulta
   - Varmista että lataat **64-bit** version

2. **Asenna plugin**
   - Jos asennusohjelma (.exe/.pkg): suorita ja valitse oikea polku
   - Jos pelkkä DLL/VST-tiedosto: kopioi oikeaan kansioon

3. **Skannaa pluginit REAPERissa**
   - Options → Preferences → Plug-ins → VST
   - Tarkista että asennuspolku on listalla ("Edit path list")
   - Klikkaa "Re-scan"

4. **Testaa plugin**
   - Luo raita → FX-nappi → etsi plugin listalta

### Plugin ei näy skannnauksen jälkeen?

Tarkistuslista:
```
□ Onko plugin 64-bittinen? (REAPER on 64-bit)
□ Onko DLL/VST oikeassa kansiossa?
□ Onko kansio lisätty REAPERin VST-polkuihin?
□ Kokeilitko Re-scan uudelleen?
□ Vaatiiko plugin rekisteröintiä/iLokia?
□ Onko plugin yhteensopiva Windows/macOS-versiosi kanssa?
```

### Suositellut ilmaiset pluginit

#### Rummut (VSTi)
- **MT Power Drum Kit** - https://www.powerdrumkit.com/
  - Monipuolinen, sopii kaikkiin genreihin
- **Steven Slate Drums Free** - https://stevenslatedrums.com/ssd5free/
  - Erinomainen rock/metal-rumpuihin

#### Kitara/Basso (Amp simulators)
- **Ignite Amps Emissary** - https://www.igniteamps.com/#emissary
  - Ilmainen high-gain vahvistin, erinomainen metaliin
- **NadIR** - https://www.igniteamps.com/#nadir
  - IR-loader kabinetille, käytä Emissaryn kanssa
- **LePou HyBrit** - https://lepouplugins.blogspot.com/
  - Marshall-tyylinen, sopii rockiin
- **TSE 808** - https://www.tseaudio.com/software/tse808
  - Tubescreamer-klooni boost-pedaali

#### Instrumentit (Piano, Synth)
- **LABS by Spitfire Audio** - https://labs.spitfireaudio.com/
  - Ilmaisia orkesteri/piano/pad-ääniä
- **Vital** - https://vital.audio/
  - Moderni wavetable-synth
- **Keyzone Classic** - Etsi googlesta
  - Ilmainen piano-plugin

#### Efektit
- **TDR Nova** - https://www.tokyodawn.net/tdr-nova/
  - Dynaaminen EQ, erittäin laadukas
- **TDR Kotelnikov** - https://www.tokyodawn.net/tdr-kotelnikov/
  - Mastering-kompressori
- **Valhalla Supermassive** - https://valhalladsp.com/shop/reverb/valhalla-supermassive/
  - Reverb/delay, ilmainen
- **OTT** - https://xferrecords.com/freeware
  - Multiband-kompressori, suosittu EDM:ssä

## 4. Studion perusasetus

### Äänikortti/Audio Interface

**Mikä se on?**
Äänikortti muuntaa analogisen äänen digitaaliseksi (nauhoitus) ja takaisin (kuuntelu).

**REAPER-asetukset:**
1. Options → Preferences → Audio → Device
2. Valitse Audio System: **ASIO** (Windows) tai **CoreAudio** (macOS)
3. Valitse oma äänikorttisi (esim. "Focusrite ASIO")
4. Jos ei omaa ASIO-ajuria: käytä **ASIO4ALL** (https://www.asio4all.org/)

**Buffer Size (puskurikoko):**
- Nauhoitus: 128-256 samples (matala latenssi)
- Miksaus: 512-1024 samples (vakaampi)
- Raskas projekti: 1024-2048 samples

**Sample Rate:**
- 44100 Hz = CD-laatu, standardi musiikin tuotantoon
- 48000 Hz = videoprojekteihin
- 96000 Hz = korkea resoluutio (harvoin tarpeen)

### Kitara/Basso - Kytkentä

1. Kytke kitara äänikortin **Hi-Z / Instrument** -tuloon
2. Hi-Z = korkea impedanssi, sopii suoraan kitaralle
3. Jos äänikortissa ei Hi-Z-tuloa: käytä DI-boxia

**DI-signaali**:
- = puhdas signaali ilman vahvistinta
- Tähän lisätään virtuaalivahvistin REAPERissa (Emissary, NadIR jne.)
- Hipare voi lisätä vahvistimen automaattisesti musiikkikeskustelussa

### Mikrofoni - Kytkentä

**Kondensaattorimikrofoni** (AT2020, Rode NT1 jne.):
- Vaatii 48V phantom power → kytke päälle äänikortista
- XLR-kaapeli äänikortin XLR-tuloon
- Herkkä, sopii lauluun ja akustisiin instrumentteihin

**Dynaaminen mikrofoni** (SM57, SM58):
- EI tarvitse phantom poweria
- Kestävä, sopii voimakkaille äänilähteille

**Gain-säätö**: Säädä niin ettei REAPER näytä punaista. Tavoite: huiput noin -6 dB.

### MIDI-ohjain

1. Kytke USB-kaapelilla
2. Options → Preferences → MIDI Devices
3. Ota ohjain käyttöön (Enable input)

**Huom**: Hipare voi luoda MIDI-rumpuja ja -sointuja ilman fyysistä MIDI-ohjainta!

## 5. Hiparen käyttö

### Uuden keskustelun avaaminen

1. Klikkaa **"+ Uusi keskustelu"** sivupalkissa
2. Valitse **genre** (vaikuttaa AI:n neuvoihin):
   - Metal: raskas miksaus, high-gain, tupla-basari
   - Rock: perinteinen, vahvistinsimulaattorit
   - Jazz: orgaaninen, kevyt kompressio, tilaa
   - Electronic: synteettiset, sidechain, basso
   - Pop: puhdas, laulu edessä, moderni
   - Blues: lämmin, putki-emulatio, reverb
   - Hip-hop: raskas basso, näytteenotin
   - Orchestral: tilallinen, dynaaminen alue
3. Valitse **tekoälymalli** yläpalkista
4. Kirjoita mitä haluat tehdä!

### Genren vaikutus

- Genre lataa AI:lle genrekohtaiset miksausohjeet
- "Metal" → tiedot rumpujen tuningista, kitaran signaaliketjusta jne.
- Voit pyytää tietyn artistin soundia (esim. "Meshuggah kitarasoundi")
- Genre EI rajoita mitä voit tehdä

### Mitä Hipare osaa musiikkikeskusteluissa

**Raidan luonti:**
- "Luo kitararaita"
- "Tee rumpuraita"
- "Lisää lauluraita"

**Efektien lisäys:**
- "Lisää kitaraan kompressori ja EQ"
- "Laita lauluun reverb"
- "Lisää kitaraan Emissary-vahvistin"

**Efektien säätö:**
- "Säädä kompressorin ratio kovemmaksi"
- "Tee reverb märemmäksi"

**MIDI-rumpujen luonti:**
- "Tee rock-komppi"
- "Luo metallibeat"
- "Jazz-rummut"
- HUOM: Tarvitset rumpu-VSTi:n (esim. MT Power Drum Kit) kuullaksesi rummut

**MIDI-sointujen luonti:**
- "Soita C-duuri pianolla"
- "Tee pop-sointukierto"
- HUOM: Tarvitset piano-VSTi:n kuullaksesi

**Miksauksen säätö:**
- "Panoroi kitara vasemmalle"
- "Hiljennä bassoa 3dB"

**Neuvot:**
- "Miten miksaan laulut?"
- "Mikä on hyvä kitarasoundi metalliin?"

### Mitä Hipare EI osaa (vielä)

- Kuunnella tai analysoida ääntä reaaliajassa (kehitteillä)
- Soittaa MIDI-instrumentteja livenä
- Muokata yksittäisiä MIDI-nuotteja tarkasti
- Ohjata kaikkien kolmansien osapuolien pluginien erikoisparametreja

### Huolto-keskustelu (tämä)

- Tarkoitettu VAIN apuun, vianmääritykseen ja neuvontaan
- EI voi antaa REAPER-komentoja
- Ohjaa käyttäjä avaamaan uusi musiikkikeskustelu musiikkitehtäviä varten
- Aina saatavilla sivupalkissa (alin keskustelu)

## 6. Mallin valinta

### Groq - Llama-mallit

**Llama 3.3 70B (llama)**
- Paras laatu Groq:ssa
- Suositeltu yleiskäyttöön

**Llama 3.1 8B**
- Nopeampi, kevyempi
- Yksinkertaisiin tehtäviin

### Google Gemini

**Gemini Flash**
- Nopea vastaus
- Hyvä peruskäyttöön

**Gemini Pro**
- Parempi laatu
- Tiukempi rate limit

### OpenRouter

- Pääsy laajempaan mallivalikoimaan
- Claude, GPT-4 jne. (vaatii saldoa)
- Ilmaisia malleja myös saatavilla

### Mallin vaihtaminen

1. Klikkaa mallin nimeä keskustelun yläpalkissa
2. Valitse uusi malli pudotusvalikosta
3. Malli vaihtuu heti

## 7. Usein kysytyt kysymykset

### "AI ei vastaa" / tyhjä vastaus
1. Tarkista API-avain: Asetukset → API-avaimet
2. 429-virhe = rate limit, odota minuutti
3. Kokeile vaihtaa mallia

### "REAPER ei reagoi komentoihin"
1. Onko REAPER auki?
2. Onko mcp_bridge.lua ladattu? (Actions → mcp_bridge → Run)
3. Testaa yhteys: Asetukset → Yhteysasetukset → Testaa MCP-yhteys

### "Plugin ei näy REAPERissa"
1. Onko plugin 64-bit?
2. Onko oikeassa kansiossa?
3. Kokeile Re-scan: Options → Preferences → Plug-ins → VST → Re-scan

### "Rummut/Piano ei kuulu"
- MIDI-raidat tarvitsevat VSTi-instrumentin kuuluakseen
- Asenna rumpu-VSTi (MT Power Drum Kit) tai piano-VSTi (LABS, Keyzone)
- Hipare lisää instrumentin automaattisesti jos mahdollista

### "Ääni pätkii/rätisee"
1. Nosta buffer size: Options → Preferences → Audio → Device
2. Sulje muut ohjelmat
3. Kokeile eri ASIO-ajuria

### "Latenssi on liian korkea"
1. Laske buffer size (128-256)
2. Käytä Direct Monitoring -ominaisuutta äänikortista
3. Käytä REAPERin Low Latency Mode: Options → Preferences → Audio → Recording
