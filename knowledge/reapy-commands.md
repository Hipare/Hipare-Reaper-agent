# REAPY API REFERENCE - HIPARE
# Dokumentaatiosta vahvistetut komennot (v0.10.0)
# Päivitetty: 2026-01-11
# Lähde: https://python-reapy.readthedocs.io/

---

## PERUSRAKENNE (käytä AINA)

```python
project = reapy.Project()  # Nykyinen projekti
# koodisi tähän
```

---

## PROJECT (Projekti)

### Projektin luonti ja haku
```python
project = reapy.Project()              # Nykyinen projekti
project = reapy.Project(index=0)       # Ensimmäinen välilehti
project = reapy.Project(index=1)       # Toinen välilehti
```

### Projektin ominaisuudet (READ)
```python
project.name                  # Projektin nimi (str)
project.n_tracks              # Raitojen määrä (int)
project.bpm                   # Tempo (float) - MYÖS SETTABLE
project.length                # Projektin pituus sekunneissa (float)
project.cursor_position       # Kursorin sijainti sekunneissa (float) - MYÖS SETTABLE
project.time_signature        # Tahtilaji tuple, esim. (4, 4)
project.is_playing            # Toistetaanko (bool)
project.is_recording          # Äänitetäänkö (bool)
project.is_paused             # Onko tauolla (bool)
project.is_stopped            # Onko pysäytetty (bool)
project.any_track_solo        # Onko mikään raita soolo (bool)
project.can_undo              # Voiko perua (bool)
project.can_redo              # Voiko tehdä uudelleen (bool)
project.tracks                # TrackList - kaikki raidat
project.selected_tracks       # Valitut raidat
project.items                 # Kaikki itemit projektissa
project.markers               # Kaikki markerit
project.master_track          # Master-raita
```

### Projektin ominaisuudet (WRITE)
```python
project.bpm = 120.0                    # Aseta tempo
project.cursor_position = 5.0          # Aseta kursori (sekunteina)
```

### Projektin metodit
```python
project.play()                         # Aloita toisto
project.stop()                         # Pysäytä
project.pause()                        # Tauko
project.record()                       # Aloita äänitys
project.undo()                         # Peru viimeisin
project.make_current_project()         # Tee aktiiviseksi
project.close()                        # Sulje projekti

# Raitojen hallinta (kaikki kerralla)
project.mute_all_tracks(mute=True)     # Mykistä kaikki
project.unmute_all_tracks()            # Poista mykistys kaikilta
project.solo_all_tracks()              # Solo kaikille
project.unsolo_all_tracks()            # Poista solo kaikilta
project.unselect_all_tracks()          # Poista valinta kaikilta
project.disarm_rec_on_all_tracks()     # Poista äänitys-arm kaikilta
project.bypass_fx_on_all_tracks(bypass=True)  # Ohita FX kaikilla

# Markerit ja regiot
marker = project.add_marker(position=10.0, name="Kertosäe", color=(255, 0, 0))
region = project.add_region(start=0, end=30, name="Intro", color=(0, 255, 0))

# Toiminnot
project.perform_action(action_id)      # Suorita Reaper Action
```

---

## TRACK (Raita)

### Raidan luonti
```python
# ✅ OIKEIN - Luo raita ja aseta nimi ERIKSEEN
track = project.add_track()            # Lisää raita (loppuun)
track.name = "Kitara"                  # Aseta nimi

# ✅ OIKEIN - Lisää tiettyyn indeksiin
track = project.add_track(index=0)     # Lisää ensimmäiseksi
track.name = "Vokaalit"

# ✅ OIKEIN - Voi antaa nimen parametrina (korjaus: TOIMII!)
track = project.add_track(index=0, name="Basso")

# ❌ VÄÄRIN - ÄLÄ TEE NÄIN
# track = project.track(0)             # EI TOIMI
```

### Raidan haku
```python
track = project.tracks[0]              # Ensimmäinen raita (indeksi 0)
track = project.tracks[1]              # Toinen raita (indeksi 1)
track = project.tracks["Kitara"]       # Hae nimellä
track = project.tracks[-1]             # Viimeinen raita
```

### Raidan ominaisuudet (READ/WRITE)
```python
track.name                   # Raidan nimi (str)
track.name = "Uusi nimi"

track.color                  # Väri RGB-tuplena
track.color = (255, 0, 0)    # Punainen

track.volume                 # Äänenvoimakkuus (0.0 - 1.0+)
track.volume = 0.7

track.pan                    # Panorointi (-1.0 vasen ... 1.0 oikea)
track.pan = 0.0              # Keskellä

track.is_muted               # Onko mykistetty (bool)
track.is_muted = True        # Mykistä

track.is_solo                # Onko solo (bool)
track.is_solo = True         # Aseta solo

track.is_selected            # Onko valittu (bool)
```

### Raidan ominaisuudet (READ ONLY)
```python
track.index                  # Raidan indeksi (0-pohjainen)
track.n_items                # Itemien määrä raidalla
track.n_fxs                  # Efektien määrä
track.items                  # Lista itemeistä
track.fxs                    # Lista efekteistä (FXList)
track.sends                  # Lista lähetyksistä
track.envelopes              # Envelope-lista
track.instrument             # Ensimmäinen instrumentti-FX (tai None)
track.project                # Raidan projekti
track.has_valid_id           # Onko raita vielä olemassa
```

### Raidan metodit
```python
track.mute()                 # Mykistä
track.unmute()               # Poista mykistys
track.toggle_mute()          # Vaihda mykistys

track.solo()                 # Solo päälle
track.unsolo()               # Solo pois
track.toggle_solo()          # Vaihda solo

track.select()               # Valitse raita
track.unselect()             # Poista valinta
track.make_only_selected_track()  # Tee ainoaksi valituksi

track.delete()               # ✅ POISTA RAITA

# Lisää itemeja
item = track.add_item(start=0, end=10)           # Lisää item
item = track.add_item(start=0, length=5)         # Sama asia
midi_item = track.add_midi_item(start=0, end=4)  # Lisää MIDI-item

# Lisää send
send = track.add_send(destination=other_track)   # Send toiseen raitaan
send = track.add_send()                          # Hardware output
```

### Record Arm (Äänitysvalmius) - ERITYISHUOMIO!
```python
# ✅ OIKEIN - Käytä get_info_value/set_info_value
# Arm päälle:
track.set_info_value("I_RECARM", 1)

# Arm pois:
track.set_info_value("I_RECARM", 0)

# Tarkista tila:
is_armed = track.get_info_value("I_RECARM") == 1

# ❌ VÄÄRIN - Nämä EIVÄT toimi:
# track.arm()        # EI OLE OLEMASSA
# track.armed        # EI OLE OLEMASSA
# track.is_armed     # EI OLE OLEMASSA
```

### Raidan input ja monitorointi
```python
# Aseta input (-1 = ei inputtia, 0 = stereo 1/2, 1024 = mono 1, jne.)
track.set_info_value("I_RECINPUT", 0)     # Stereo input 1/2
track.set_info_value("I_RECINPUT", 1024)  # Mono input 1
track.set_info_value("I_RECINPUT", -1)    # Ei inputtia

# Monitorointi (0 = off, 1 = on, 2 = auto)
track.set_info_value("I_RECMON", 1)       # Monitor on

# Hae nykyinen input
current_input = track.get_info_value("I_RECINPUT")
```

### Hyödyllisiä get_info_value/set_info_value parametreja
```python
# Parametri            Kuvaus
# "I_RECARM"          Äänitys-arm (0/1)
# "I_RECINPUT"        Input-kanava
# "I_RECMON"          Monitorointi (0=off, 1=on, 2=auto)
# "I_FOLDERDEPTH"     Kansion syvyys
# "B_MUTE"            Mykistys (0/1)
# "I_SOLO"            Solo (0/1)
# "D_VOL"             Volume (lineaarinen)
# "D_PAN"             Pan (-1...1)
```

---

## FX (Efektit)

### FX:n lisääminen
```python
# Lisää FX raitaan - käytä TARKKAA nimeä!
fx = track.add_fx("ReaEQ")
fx = track.add_fx("ReaComp")
fx = track.add_fx("VST: TAL-Reverb-4 (TAL-Togu Audio Line)")

# even_if_exists=False estää duplikaatin
fx = track.add_fx("ReaEQ", even_if_exists=False)

# Input FX (recording FX)
fx = track.add_fx("ReaEQ", input_fx=True)
```

### FX:n haku
```python
fx = track.fxs[0]            # Ensimmäinen FX
fx = track.fxs[-1]           # Viimeinen FX
fx_count = track.n_fxs       # FX:ien määrä
instrument = track.instrument # Ensimmäinen instrumentti (tai None)
```

### FX:n ominaisuudet
```python
fx.name                      # FX:n nimi
fx.is_enabled                # Onko päällä (bool)
fx.is_enabled = True/False

fx.is_online                 # Onko online (bool)
fx.is_ui_open                # Onko UI auki (bool)

fx.n_params                  # Parametrien määrä
fx.params                    # Parametrilista

fx.preset                    # Nykyinen preset (str)
fx.preset_index              # Preset-indeksi (int)
fx.n_presets                 # Presettien määrä
```

### FX:n metodit
```python
fx.enable()                  # Päälle
fx.disable()                 # Pois

fx.make_online()             # Online
fx.make_offline()            # Offline

fx.open_ui()                 # Avaa käyttöliittymä
fx.close_ui()                # Sulje käyttöliittymä
fx.open_chain()              # Avaa FX-ketju
fx.close_chain()             # Sulje FX-ketju
fx.open_floating_window()    # Avaa kelluva ikkuna
fx.close_floating_window()   # Sulje kelluva ikkuna

fx.delete()                  # ✅ POISTA FX

fx.copy_to_track(track, index=0)   # Kopioi toiseen raitaan
fx.move_to_track(track, index=0)   # Siirrä toiseen raitaan
```

### FX Parametrit
```python
# Hae parametri indeksillä
param = fx.params[0]
print(param)                 # Arvo (float)
print(param.name)            # Parametrin nimi
print(param.range)           # (min, max) tuple

# Hae parametri nimellä
param = fx.params["Dry Gain"]

# Aseta parametri
fx.params[0] = 0.5
fx.params["Dry Gain"] = 0.3

# Normalisoitu arvo (0-1)
print(fx.params[0].normalized)
fx.params[0].normalized = 0.5

# Preset
fx.preset = "Vocal Compression"     # Aseta nimellä
fx.preset = 3                       # Aseta indeksillä
```

---

## ITEM (Media Item)

### Itemin ominaisuudet
```python
item.position                # Sijainti (sekunteina)
item.position = 5.0

item.length                  # Pituus (sekunteina)
item.length = 10.0

item.is_selected             # Onko valittu (bool)

item.active_take             # Aktiivinen take
item.takes                   # Kaikki taket
item.n_takes                 # Takejen määrä
```

### Itemin metodit
```python
item.delete()                # ✅ POISTA ITEM
item.add_take()              # Lisää take
item.update()                # Päivitä näkymä
```

---

## TAKE

### Taken ominaisuudet
```python
take.name                    # Taken nimi
take.source                  # Lähde (Source-objekti)
take.n_notes                 # MIDI-nuottien määrä
take.notes                   # Nuottilista (NoteList)
take.fxs                     # Take FX:t
take.n_fxs                   # Take FX:ien määrä
```

### MIDI-nuottien lisääminen
```python
# Lisää nuotti
take.add_note(
    start=0,                 # Alkuaika (sekunteina)
    end=1,                   # Loppuaika (sekunteina)
    pitch=60,                # Sävelkorkeus (60 = C4)
    velocity=100,            # Voimakkuus (0-127)
    channel=0,               # MIDI-kanava (0-15)
    selected=False,          # Onko valittu
    muted=False,             # Onko mykistetty
    unit="seconds"           # Yksikkö: "seconds", "beats", "ppq"
)

# Esimerkki: C-duurisointu
for pitch in [60, 64, 67]:   # C, E, G
    take.add_note(start=0, end=2, pitch=pitch, velocity=100)
```

### Take FX
```python
fx = take.add_fx("ReaEQ")    # Lisää FX takeen
```

---

## SEND (Lähetys)

### Sendin ominaisuudet
```python
send.volume                  # Äänenvoimakkuus
send.volume = 0.5

send.pan                     # Panorointi (-1...1)
send.pan = 0.0

send.is_muted                # Onko mykistetty
send.dest_track              # Kohderaita
send.source_track            # Lähderaita
```

### Sendin metodit
```python
send.mute()                  # Mykistä
send.unmute()                # Poista mykistys
send.delete()                # ✅ POISTA SEND
send.flip_phase()            # Käännä vaihe
```

---

## TOP-LEVEL FUNKTIOT

```python
import reapy

reapy.print("Viesti")              # Tulosta Reaper-konsoliin
reapy.clear_console()              # Tyhjennä konsoli
reapy.get_reaper_version()         # Reaperin versio (esim. "7.0/x64")

reapy.perform_action(action_id)    # Suorita Action
reapy.open_project("polku.rpp")    # Avaa projekti

# Tehokkuus (ulkoisessa käytössä)
with reapy.inside_reaper():
    # Nopeat operaatiot tässä
    pass
```

---

## YLEISIÄ REAPER ACTION ID:TÄ

```python
# Transport
reapy.perform_action(1007)   # Play/Stop
reapy.perform_action(1016)   # Stop
reapy.perform_action(1013)   # Pause
reapy.perform_action(1008)   # Pause (toggle)
reapy.perform_action(1007)   # Play
reapy.perform_action(1013)   # Pause
reapy.perform_action(40044)  # Transport: Go to start
reapy.perform_action(40043)  # Transport: Go to end

# Tallentaminen
reapy.perform_action(40026)  # Save project
reapy.perform_action(40022)  # Save as...

# Raidat
reapy.perform_action(40001)  # Insert new track
reapy.perform_action(40005)  # Remove tracks

# Valinta
reapy.perform_action(40296)  # Select all tracks
reapy.perform_action(40297)  # Unselect all tracks

# Undo
reapy.perform_action(40029)  # Undo
reapy.perform_action(40030)  # Redo
```

---

## KIELLETYT / VIRHEELLISET METODIT

Nämä EIVÄT toimi - älä käytä!

```python
# ❌ VÄÄRIN                         ✅ OIKEIN
project.track(0)                    project.tracks[0]
project.tracks.add()                project.add_track()
project.buffer_size                 # EI OLE OLEMASSA
project.config_audio_device()       # EI OLE OLEMASSA
track.arm()                         track.set_info_value("I_RECARM", 1)
track.armed                         track.get_info_value("I_RECARM")
track.is_armed                      track.get_info_value("I_RECARM") == 1
track.monitor                       track.set_info_value("I_RECMON", 1)
track.gain                          track.volume
track.input                         track.set_info_value("I_RECINPUT", value)
```

---

## VÄRIT

```python
# RGB tuple
track.color = (255, 0, 0)      # Punainen
track.color = (0, 255, 0)      # Vihreä
track.color = (0, 0, 255)      # Sininen
track.color = (255, 165, 0)    # Oranssi
track.color = (128, 0, 128)    # Purppura

# Markereiden ja regionien värit
project.add_marker(10.0, "Kertosäe", color=(255, 0, 0))
project.add_region(0, 30, "Intro", color=(0, 255, 0))
```

---

## ESIMERKKEJÄ

### Luo raita ja lisää FX
```python
project = reapy.Project()
track = project.add_track()
track.name = "Lead Vocal"
track.color = (255, 100, 50)

# Lisää efektit
track.add_fx("ReaEQ")
track.add_fx("ReaComp")
track.add_fx("ReaVerbate")

print(f"Luotu raita '{track.name}' {track.n_fxs} efektillä")
```

### Arm raita äänitykseen ja aseta input
```python
project = reapy.Project()
track = project.tracks[0]

# Aseta mono input 1
track.set_info_value("I_RECINPUT", 1024)

# Ota monitorointi päälle
track.set_info_value("I_RECMON", 1)

# Arm äänitys
track.set_info_value("I_RECARM", 1)

print(f"Raita '{track.name}' valmiina äänitykseen!")
```

### Listaa kaikki raidat
```python
project = reapy.Project()
print(f"Projekti: {project.name}")
print(f"Raitoja: {project.n_tracks}")
print("-" * 30)

for i, track in enumerate(project.tracks):
    status = []
    if track.is_muted:
        status.append("MUTED")
    if track.is_solo:
        status.append("SOLO")
    if track.get_info_value("I_RECARM") == 1:
        status.append("ARMED")
    
    status_str = " ".join(status) if status else ""
    print(f"{i}: {track.name or 'Unnamed'} [{track.n_fxs} FX] {status_str}")
```

### Poista kaikki efektit valitulta raidalta
```python
project = reapy.Project()
selected = project.selected_tracks

if selected:
    track = selected[0]
    fx_count = track.n_fxs
    
    # Poista kaikki FX:t (takaperin indeksiongelmien välttämiseksi)
    for i in range(fx_count - 1, -1, -1):
        track.fxs[i].delete()
    
    print(f"Poistettu {fx_count} FX raidalta '{track.name}'")
else:
    print("Ei valittua raitaa")
```

### Luo MIDI-item ja lisää nuotteja
```python
project = reapy.Project()
track = project.add_track()
track.name = "MIDI Piano"

# Luo MIDI-item (4 tahtia 120 BPM = 8 sekuntia)
item = track.add_midi_item(start=0, end=8)
take = item.active_take

# Lisää C-duurisointu
for pitch in [60, 64, 67]:  # C, E, G
    take.add_note(start=0, end=2, pitch=pitch, velocity=100)

print(f"Luotu MIDI-item {take.n_notes} nuotilla")
```

---

## VIRHEENKÄSITTELY

```python
# Tarkista että raita on olemassa
try:
    track = project.tracks[10]
except IndexError:
    print("Raitaa 10 ei ole olemassa")

# Tarkista FX:n olemassaolo
try:
    fx = track.add_fx("TuntemationFX")
except ValueError as e:
    print(f"FX:ää ei löydy: {e}")

# Tarkista onko raita vielä olemassa
if track.has_valid_id:
    track.name = "Uusi nimi"
else:
    print("Raita on poistettu")
```

---

## MUISTIINPANOJA KÄYTTÄJÄLLE

Tähän voit lisätä omia huomioitasi:

<!-- 
Esimerkki:
- ReaComp toimii hyvin laulussa parametreilla: threshold -20, ratio 4:1
- Suosikkikaiut: Valhalla VintageVerb, TAL-Reverb-4
-->

