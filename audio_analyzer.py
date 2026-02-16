"""
Hipare Audio Analyzer Module
Analysoi WAV-tiedostoja ja palauttaa metriikat LLM:lle.
"""

import numpy as np
import os
import json
import tempfile
from pathlib import Path

try:
    from scipy.io import wavfile
    from scipy import signal
    from scipy.fft import fft, fftfreq
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    print("WARNING: scipy not installed. Audio analysis will be limited.")

# Genrekohtaiset tyypilliset taajuusjakaumat (referenssi)
GENRE_REFERENCE_BALANCE = {
    'pop': {'sub_bass': 5, 'bass': 20, 'low_mids': 15, 'mids': 25, 'high_mids': 15, 'highs': 20},
    'rock': {'sub_bass': 4, 'bass': 22, 'low_mids': 18, 'mids': 25, 'high_mids': 16, 'highs': 15},
    'metal': {'sub_bass': 3, 'bass': 18, 'low_mids': 15, 'mids': 28, 'high_mids': 20, 'highs': 16},
    'electronic': {'sub_bass': 12, 'bass': 20, 'low_mids': 10, 'mids': 18, 'high_mids': 15, 'highs': 25},
    'hiphop': {'sub_bass': 10, 'bass': 28, 'low_mids': 12, 'mids': 22, 'high_mids': 13, 'highs': 15},
    'jazz': {'sub_bass': 3, 'bass': 18, 'low_mids': 20, 'mids': 28, 'high_mids': 16, 'highs': 15},
}

# Pitkien tiedostojen raja sekunneissa - yli tämän analysoidaan otoksina
MAX_FULL_ANALYSIS_SECONDS = 60


# ============================================
# AUDIO ANALYSIS FUNCTIONS
# ============================================

def analyze_audio(wav_path: str) -> dict:
    """
    Analysoi WAV-tiedosto ja palauta metriikat.

    Returns:
        dict: {
            "duration": float,  # seconds
            "sample_rate": int,
            "channels": int,
            "rms_level": float,  # dB
            "peak_level": float,  # dB
            "crest_factor": float,  # dB (peak - rms)
            "dc_offset": float,
            "spectral_centroid": float,  # Hz
            "spectral_rolloff": float,  # Hz
            "frequency_balance": {
                "sub_bass": float,  # 20-60 Hz
                "bass": float,  # 60-250 Hz
                "low_mids": float,  # 250-500 Hz
                "mids": float,  # 500-2000 Hz
                "high_mids": float,  # 2000-4000 Hz
                "highs": float,  # 4000-20000 Hz
            },
            "estimated_lufs": float,  # Approximate LUFS
            "clipping_detected": bool,
            "issues": list  # Potential problems found
        }
    """
    if not SCIPY_AVAILABLE:
        return {"error": "scipy not installed", "issues": ["Install scipy: pip install scipy"]}

    if not os.path.exists(wav_path):
        return {"error": f"File not found: {wav_path}"}

    try:
        sample_rate, data = wavfile.read(wav_path)
    except Exception as e:
        return {"error": f"Cannot read WAV: {str(e)}"}

    # Normalize to float -1 to 1 (float64 for precision)
    if data.dtype == np.int16:
        data = data.astype(np.float64) / 32768.0
    elif data.dtype == np.int32:
        data = data.astype(np.float64) / 2147483648.0
    elif data.dtype == np.float32:
        data = data.astype(np.float64)
    elif data.dtype == np.uint8:
        data = (data.astype(np.float64) - 128) / 128.0

    # Handle mono/stereo
    if len(data.shape) == 1:
        channels = 1
        mono_data = data
        stereo_data = None
    else:
        channels = data.shape[1]
        stereo_data = data
        # Mix to mono for analysis
        mono_data = np.mean(data, axis=1)

    duration = len(mono_data) / sample_rate

    # Pitkien tiedostojen optimointi: analysoidaan 30s otoksia
    if duration > MAX_FULL_ANALYSIS_SECONDS:
        mono_data, stereo_data = _sample_long_audio(mono_data, stereo_data, sample_rate, duration)

    # Basic level analysis
    rms = np.sqrt(np.mean(mono_data ** 2))
    peak = np.max(np.abs(mono_data))

    # Convert to dB
    rms_db = 20 * np.log10(rms + 1e-10)
    peak_db = 20 * np.log10(peak + 1e-10)
    crest_factor = peak_db - rms_db

    # DC offset
    dc_offset = np.mean(mono_data)

    # Clipping detection
    clipping = peak >= 0.99

    # Spectral analysis
    spectral = analyze_spectrum(mono_data, sample_rate)

    # Frequency balance
    freq_balance = analyze_frequency_balance(mono_data, sample_rate)

    # Estimated LUFS (simplified K-weighting approximation)
    estimated_lufs = estimate_lufs(mono_data, sample_rate)

    # Stereoleveys-analyysi
    stereo_info = analyze_stereo_width(stereo_data) if stereo_data is not None else None

    # Detect potential issues
    issues = detect_issues(
        rms_db=rms_db,
        peak_db=peak_db,
        dc_offset=dc_offset,
        clipping=clipping,
        crest_factor=crest_factor,
        freq_balance=freq_balance,
        estimated_lufs=estimated_lufs,
        stereo_info=stereo_info
    )

    result = {
        "duration": round(duration, 2),
        "sample_rate": sample_rate,
        "channels": channels,
        "rms_level": round(rms_db, 1),
        "peak_level": round(peak_db, 1),
        "crest_factor": round(crest_factor, 1),
        "dc_offset": round(dc_offset, 4),
        "spectral_centroid": round(spectral["centroid"], 0),
        "spectral_rolloff": round(spectral["rolloff"], 0),
        "frequency_balance": freq_balance,
        "estimated_lufs": round(estimated_lufs, 1),
        "clipping_detected": clipping,
        "issues": issues
    }

    if stereo_info:
        result["stereo_width"] = stereo_info

    if duration > MAX_FULL_ANALYSIS_SECONDS:
        result["sampled_analysis"] = True
        result["note"] = f"Pitkä tiedosto ({round(duration, 0)}s) - analysoitu 30s otoksina tokenien säästämiseksi."

    return result


def analyze_spectrum(data: np.ndarray, sample_rate: int) -> dict:
    """Laske spektraaliset ominaisuudet."""
    # FFT
    n = len(data)
    yf = np.abs(fft(data))[:n // 2]
    xf = fftfreq(n, 1 / sample_rate)[:n // 2]

    # Normalize
    yf_norm = yf / (np.sum(yf) + 1e-10)

    # Spectral centroid (brightness indicator)
    centroid = np.sum(xf * yf_norm)

    # Spectral rolloff (95% of energy)
    cumsum = np.cumsum(yf_norm)
    rolloff_idx = np.where(cumsum >= 0.95)[0]
    rolloff = xf[rolloff_idx[0]] if len(rolloff_idx) > 0 else xf[-1]

    return {
        "centroid": centroid,
        "rolloff": rolloff
    }


def analyze_frequency_balance(data: np.ndarray, sample_rate: int) -> dict:
    """Analysoi taajuusjakauma eri alueilla."""
    # FFT
    n = len(data)
    yf = np.abs(fft(data))[:n // 2]
    xf = fftfreq(n, 1 / sample_rate)[:n // 2]

    # Power in each band
    total_power = np.sum(yf ** 2) + 1e-10

    def band_power(low, high):
        mask = (xf >= low) & (xf < high)
        return np.sum(yf[mask] ** 2) / total_power * 100

    return {
        "sub_bass": round(band_power(20, 60), 1),      # 20-60 Hz
        "bass": round(band_power(60, 250), 1),         # 60-250 Hz
        "low_mids": round(band_power(250, 500), 1),    # 250-500 Hz (mud zone)
        "mids": round(band_power(500, 2000), 1),       # 500-2000 Hz
        "high_mids": round(band_power(2000, 4000), 1), # 2-4 kHz (presence)
        "highs": round(band_power(4000, 20000), 1)     # 4-20 kHz (air)
    }


def _sample_long_audio(mono_data: np.ndarray, stereo_data, sample_rate: int, duration: float):
    """
    Pitkien tiedostojen optimointi: poimitaan 3x10s otokset (alku, keski, loppu).
    Säästää tokeneita ja nopeuttaa analyysiä.
    """
    sample_len = 10 * sample_rate  # 10 sekuntia per otos
    total_samples = len(mono_data)

    # 3 otosta: alku (10%), keskikohta, loppu (90%)
    start_pos = int(total_samples * 0.10)
    mid_pos = int(total_samples * 0.50) - sample_len // 2
    end_pos = int(total_samples * 0.85)

    # Varmista etteivät ylitä rajoja
    positions = [
        max(0, start_pos),
        max(0, mid_pos),
        min(total_samples - sample_len, end_pos)
    ]

    mono_samples = []
    stereo_samples = []
    for pos in positions:
        end = min(pos + sample_len, total_samples)
        mono_samples.append(mono_data[pos:end])
        if stereo_data is not None:
            stereo_samples.append(stereo_data[pos:end])

    sampled_mono = np.concatenate(mono_samples)
    sampled_stereo = np.concatenate(stereo_samples) if stereo_samples else None

    return sampled_mono, sampled_stereo


def analyze_stereo_width(stereo_data: np.ndarray) -> dict:
    """
    Analysoi stereoleveys ja kanavien korrelaatio.

    Returns:
        dict: {
            "correlation": float,  # -1 (out of phase) to 1 (mono)
            "width": float,  # 0 (mono) to 1 (wide) to 2 (out of phase)
            "balance": float,  # -1 (left heavy) to 1 (right heavy)
            "description": str
        }
    """
    if stereo_data.shape[1] < 2:
        return None

    left = stereo_data[:, 0].astype(np.float64)
    right = stereo_data[:, 1].astype(np.float64)

    # Korrelaatio (Pearson)
    left_norm = left - np.mean(left)
    right_norm = right - np.mean(right)
    correlation = np.sum(left_norm * right_norm) / (
        np.sqrt(np.sum(left_norm ** 2) * np.sum(right_norm ** 2)) + 1e-10
    )

    # Stereoleveys: 1 - correlation (0 = mono, 1 = wide stereo, >1 = out of phase)
    width = 1.0 - correlation

    # Kanavabalanssi: RMS-ero
    left_rms = np.sqrt(np.mean(left ** 2))
    right_rms = np.sqrt(np.mean(right ** 2))
    total_rms = left_rms + right_rms + 1e-10
    balance = (right_rms - left_rms) / total_rms  # -1 = left, 0 = center, 1 = right

    # Kuvaus
    if width < 0.1:
        desc = "mono (ei stereoleveys)"
    elif width < 0.3:
        desc = "kapea stereo"
    elif width < 0.6:
        desc = "normaali stereoleveys"
    elif width < 0.9:
        desc = "leveä stereo"
    elif width < 1.2:
        desc = "hyvin leveä stereo"
    else:
        desc = "vaiheongelma (anti-phase)"

    return {
        "correlation": round(float(correlation), 3),
        "width": round(float(width), 3),
        "balance": round(float(balance), 3),
        "description": desc
    }


def compare_to_genre_reference(freq_balance: dict, genre: str) -> dict:
    """
    Vertaa taajuusjakaumaa genren tyypilliseen jakaumaan.
    Palauttaa erot prosenttiyksikköinä.
    """
    genre = genre.lower()
    ref = GENRE_REFERENCE_BALANCE.get(genre)
    if not ref:
        return None

    comparison = {}
    for band in ['sub_bass', 'bass', 'low_mids', 'mids', 'high_mids', 'highs']:
        actual = freq_balance.get(band, 0)
        target = ref[band]
        diff = actual - target
        comparison[band] = {
            "actual": actual,
            "target": target,
            "diff": round(diff, 1),
            "status": "OK" if abs(diff) < 5 else ("liikaa" if diff > 0 else "liian vähän")
        }

    return comparison


def estimate_lufs(data: np.ndarray, sample_rate: int) -> float:
    """
    Estimoi LUFS (Loudness Units Full Scale).
    Yksinkertaistettu K-weighting approksimaatio.
    """
    # Simple K-weighting approximation using high-shelf boost
    # Real LUFS would need proper ITU-R BS.1770-4 implementation

    # High-pass at 60 Hz (simplified)
    b, a = signal.butter(2, 60 / (sample_rate / 2), btype='high')
    filtered = signal.filtfilt(b, a, data)

    # High-shelf boost at 2kHz (simplified K-weighting)
    b, a = signal.butter(2, 2000 / (sample_rate / 2), btype='high')
    k_weighted = signal.filtfilt(b, a, filtered) * 1.5 + filtered * 0.5

    # Calculate gated loudness (simplified - no gating)
    rms = np.sqrt(np.mean(k_weighted ** 2))
    lufs = 20 * np.log10(rms + 1e-10) - 0.691

    return lufs


def detect_issues(rms_db, peak_db, dc_offset, clipping, crest_factor, freq_balance, estimated_lufs, stereo_info=None) -> list:
    """Tunnista mahdolliset ongelmat audioissa."""
    issues = []

    # Clipping
    if clipping:
        issues.append("CLIPPING: Audio klippaa! Laske tasoa.")

    # Too loud
    if peak_db > -1:
        issues.append("LIIAN KOVAA: Peak liian korkea, jätä headroomia masteroinnille.")

    # Too quiet
    if rms_db < -30:
        issues.append("LIIAN HILJAINEN: RMS erittäin matala, nosta tasoa.")

    # DC offset
    if abs(dc_offset) > 0.01:
        issues.append("DC OFFSET: Signaali ei ole keskitetty, lisää HPF.")

    # Low crest factor (over-compressed)
    if crest_factor < 6:
        issues.append("YLIKOMPRESSOITU: Crest factor matala, dynamiikkaa puuttuu.")

    # Mud zone too high
    if freq_balance["low_mids"] > 30:
        issues.append("MUDDY: Paljon energiaa 250-500 Hz alueella, leikkaa mutaisuutta.")

    # Not enough highs
    if freq_balance["highs"] < 5:
        issues.append("TUMMA: Vähän ylätaajuuksia, lisää kirkkautta.")

    # Too much highs
    if freq_balance["highs"] > 40:
        issues.append("KIRKAS: Paljon ylätaajuuksia, voi olla särisevä.")

    # LUFS check for streaming
    if estimated_lufs > -8:
        issues.append("LIIAN KOVAA STREAMAUKSEEN: LUFS yli -8, streaming-palvelut normalisoivat alas.")

    if estimated_lufs < -20:
        issues.append("HILJAINEN: LUFS matala, miksaus kuulostaa hiljaiselta kilpailijoihin verrattuna.")

    # Stereo issues
    if stereo_info:
        if stereo_info["width"] > 1.2:
            issues.append("VAIHEONGELMA: Stereokanavat ovat osittain vastavaiheessa, voi kuulostaa oudolta monona.")
        if stereo_info["width"] < 0.05:
            issues.append("MONO: Signaali on käytännössä mono, harkitse stereoleveyden lisäämistä.")
        if abs(stereo_info["balance"]) > 0.15:
            side = "vasemmalle" if stereo_info["balance"] < 0 else "oikealle"
            issues.append(f"EPÄTASAPAINO: Miksaus kallistuu {side}, tarkista panorointi.")

    return issues


# ============================================
# LLM PROMPT FORMATTING
# ============================================

def format_analysis_for_llm(analysis: dict, genre: str = None, track_name: str = None) -> str:
    """
    Muotoile analyysi LLM-promptiksi suomeksi.
    """
    if "error" in analysis:
        return f"Analyysi epäonnistui: {analysis['error']}"

    prompt = f"""## Audio-analyysin tulokset
{"Raita: " + track_name if track_name else "Koko miksaus"}
{"Genre: " + genre if genre else ""}

### Perustiedot
- Kesto: {analysis['duration']} sekuntia
- Näytteenottotaajuus: {analysis['sample_rate']} Hz
- Kanavat: {analysis['channels']} ({'stereo' if analysis['channels'] == 2 else 'mono'})

### Tasot
- RMS (keskitaso): {analysis['rms_level']} dB
- Peak (huippu): {analysis['peak_level']} dB
- Crest factor: {analysis['crest_factor']} dB {'(hyvä dynamiikka)' if analysis['crest_factor'] > 10 else '(kompressoitu)' if analysis['crest_factor'] < 6 else ''}
- Arvioitu LUFS: {analysis['estimated_lufs']} LUFS

### Taajuusjakauma
- Sub-basso (20-60 Hz): {analysis['frequency_balance']['sub_bass']}%
- Basso (60-250 Hz): {analysis['frequency_balance']['bass']}%
- Alakeskitaajuudet (250-500 Hz): {analysis['frequency_balance']['low_mids']}% {'(MUD ZONE - tarkista!)' if analysis['frequency_balance']['low_mids'] > 25 else ''}
- Keskitaajuudet (500-2000 Hz): {analysis['frequency_balance']['mids']}%
- Yläkeskitaajuudet (2-4 kHz): {analysis['frequency_balance']['high_mids']}%
- Ylätaajuudet (4-20 kHz): {analysis['frequency_balance']['highs']}%

### Spektraalianalyysi
- Spectral centroid (kirkkaus): {analysis['spectral_centroid']} Hz {'(tumma)' if analysis['spectral_centroid'] < 1500 else '(kirkas)' if analysis['spectral_centroid'] > 4000 else '(neutraali)'}
- Spectral rolloff (95% energia): {analysis['spectral_rolloff']} Hz
"""

    # Stereoleveys-osio
    if 'stereo_width' in analysis and analysis['stereo_width']:
        sw = analysis['stereo_width']
        prompt += f"""
### Stereoleveys
- Korrelaatio: {sw['correlation']} {'(mono)' if sw['correlation'] > 0.95 else '(normaali)' if sw['correlation'] > 0.3 else '(leveä)' if sw['correlation'] > 0 else '(vaiheongelma!)'}
- Leveys: {sw['width']} - {sw['description']}
- Kanavabalanssi: {sw['balance']} {'(keskitetty)' if abs(sw['balance']) < 0.05 else '(vasemmalle)' if sw['balance'] < -0.05 else '(oikealle)'}
"""

    if analysis.get('sampled_analysis'):
        prompt += f"\n*Huom: {analysis.get('note', 'Pitkä tiedosto analysoitu otoksina.')}*\n"

    prompt += "\n### Havaitut ongelmat\n"

    if analysis['issues']:
        for issue in analysis['issues']:
            prompt += f"- {issue}\n"
    else:
        prompt += "- Ei merkittäviä ongelmia havaittu.\n"

    if analysis['clipping_detected']:
        prompt += "\n**VAROITUS: KLIPPAUS HAVAITTU!**\n"

    # Add genre-specific advice with frequency comparison
    if genre:
        prompt += f"\n### Genre-kohtaiset huomiot ({genre})\n"
        prompt += get_genre_specific_advice(analysis, genre)

        # Genre-vertailu
        comparison = compare_to_genre_reference(analysis['frequency_balance'], genre)
        if comparison:
            prompt += f"\n### Taajuusvertailu: {genre}-referenssi\n"
            band_names = {
                'sub_bass': 'Sub-basso', 'bass': 'Basso', 'low_mids': 'Alakeskitaajuudet',
                'mids': 'Keskitaajuudet', 'high_mids': 'Yläkeskitaajuudet', 'highs': 'Ylätaajuudet'
            }
            for band, info in comparison.items():
                if info['status'] != 'OK':
                    prompt += f"- {band_names.get(band, band)}: {info['actual']}% (tavoite {info['target']}%) → {info['status']} ({info['diff']:+.1f}%)\n"

    prompt += """
### Pyydä AI:lta
Anna konkreettisia miksausneuvoja yllä olevan analyysin perusteella.
Kerro mitä EQ-leikkauksia/korostuksia tekisit ja miksi.
Suosittele kompression asetuksia jos tarpeen.
"""

    return prompt


def get_genre_specific_advice(analysis: dict, genre: str) -> str:
    """Palauta genre-kohtaiset neuvot."""
    genre = genre.lower()
    advice = ""

    freq = analysis['frequency_balance']
    lufs = analysis['estimated_lufs']
    crest = analysis['crest_factor']

    if genre in ['metal', 'rock']:
        # Metal/Rock specific
        if freq['low_mids'] > 20:
            advice += "- Metal: Leikkaa 200-400 Hz alueelta 3-6 dB mudaisuuden poistamiseksi.\n"
        if freq['high_mids'] < 15:
            advice += "- Metal: Lisää 2-4 kHz alueelle 2-4 dB kitaran pureutuvuutta varten.\n"
        if crest < 8:
            advice += "- Metal: Crest factor matala - varo ylikompressointia, säilytä punch.\n"
        if lufs > -10:
            advice += f"- Metal: LUFS {lufs} on OK metallille (tyypillisesti -8 to -10).\n"
        elif lufs < -14:
            advice += f"- Metal: LUFS {lufs} on hiljainen metallille, harkitse masterointia kovemmaksi.\n"

    elif genre == 'electronic':
        # Electronic specific
        if freq['sub_bass'] < 10:
            advice += "- Elektroninen: Sub-basso vähäinen, lisää 40-60 Hz alueelle painoa.\n"
        if freq['highs'] < 20:
            advice += "- Elektroninen: Ylätaajuudet vähäiset, lisää ilmavuutta 10+ kHz alueelle.\n"
        if crest > 12:
            advice += "- Elektroninen: Korkea crest factor - harkitse enemmän kompressiota EDM:lle.\n"

    elif genre in ['hiphop', 'rap']:
        # Hip-hop specific
        if freq['bass'] < 25:
            advice += "- Hip-hop: Basso voisi olla voimakkaampi, boostaa 60-100 Hz.\n"
        if freq['mids'] > 35:
            advice += "- Hip-hop: Keskitaajuudet dominoivat, anna tilaa vokaalille.\n"

    elif genre == 'jazz':
        # Jazz specific
        if crest < 10:
            advice += "- Jazz: Dynamiikka tärkeää - vältä ylikompressiota.\n"
        if lufs > -14:
            advice += "- Jazz: LUFS voisi olla matalampi (-14 to -18) dynamiikan säilyttämiseksi.\n"

    elif genre == 'pop':
        # Pop specific
        if lufs < -12:
            advice += "- Pop: LUFS matala kilpailukykyiseen pop-soundiin, tavoite -8 to -10.\n"
        if freq['high_mids'] < 15:
            advice += "- Pop: Lisää presence-aluetta (2-5 kHz) vokaalin selkeyttämiseksi.\n"

    return advice if advice else "- Ei erityisiä genre-kohtaisia huomioita.\n"


# ============================================
# REAPER INTEGRATION HELPERS
# ============================================

def get_render_path() -> str:
    """Palauta temp-kansio renderöinneille."""
    temp_dir = tempfile.gettempdir()
    render_dir = os.path.join(temp_dir, "hipare_renders")
    os.makedirs(render_dir, exist_ok=True)
    return render_dir


def get_analysis_filename(prefix: str = "analysis") -> str:
    """Generoi uniikki tiedostonimi analyysille."""
    import time
    timestamp = int(time.time())
    return f"{prefix}_{timestamp}.wav"


# ============================================
# MAIN TEST
# ============================================

if __name__ == "__main__":
    # Test with a sample file
    import sys

    if len(sys.argv) > 1:
        wav_file = sys.argv[1]
        print(f"Analyzing: {wav_file}")

        analysis = analyze_audio(wav_file)

        if "error" in analysis:
            print(f"Error: {analysis['error']}")
        else:
            # Print formatted for LLM
            prompt = format_analysis_for_llm(analysis, genre="metal", track_name="Test Track")
            print(prompt)

            # Also print raw JSON
            print("\n--- Raw JSON ---")
            print(json.dumps(analysis, indent=2))
    else:
        print("Usage: python audio_analyzer.py <wav_file>")
        print("\nTest with scipy availability:", "OK" if SCIPY_AVAILABLE else "MISSING")
