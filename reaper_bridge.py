"""
HIPARE Reaper Bridge v3.0
-------------------------
Vakaa Python-silta Reaperin ja Hipare-sovelluksen valilla.
Parannettu yhteyden hallinta ja virheenkasittely.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time
import traceback
import os

app = Flask(__name__)
CORS(app)

class ReaperConnection:
    def __init__(self):
        self._reapy = None
        self._lock = threading.Lock()
        self._connected = False
        self._last_project_info = {}
        self._max_retries = 3
        
    def _import_reapy(self):
        if self._reapy is None:
            import reapy
            self._reapy = reapy
            print("Reapy-moduuli ladattu")
        return self._reapy
    
    def _safe_execute(self, func, *args, **kwargs):
        last_error = None
        for attempt in range(self._max_retries):
            try:
                reapy = self._import_reapy()
                with reapy.inside_reaper():
                    result = func(reapy, *args, **kwargs)
                    self._connected = True
                    return result
            except Exception as e:
                last_error = e
                error_str = str(e).lower()
                if 'connect' in error_str or 'socket' in error_str or 'timeout' in error_str:
                    print(f"Yhteysongelma (yritys {attempt + 1}/{self._max_retries}): {e}")
                    time.sleep(0.5)
                    continue
                else:
                    break
        self._connected = False
        raise last_error
    
    def check_connection(self):
        try:
            def _check(reapy):
                project = reapy.Project()
                return {"connected": True, "project_name": project.name or "Untitled", "track_count": project.n_tracks}
            result = self._safe_execute(_check)
            self._last_project_info = result
            return result
        except Exception as e:
            self._connected = False
            return {"connected": False, "error": str(e)}
    
    def get_project_info(self):
        try:
            def _get_info(reapy):
                project = reapy.Project()
                return {
                    "connected": True,
                    "project_name": project.name if project.name else "Untitled",
                    "track_count": project.n_tracks,
                    "tempo": round(project.bpm, 1),
                    "time_signature": f"{project.time_signature[0]}/{project.time_signature[1]}",
                    "length": round(project.length, 2),
                    "cursor_position": round(project.cursor_position, 2),
                    "is_playing": project.is_playing,
                    "is_recording": project.is_recording
                }
            result = self._safe_execute(_get_info)
            self._last_project_info = result
            return result
        except Exception as e:
            return {"connected": False, "error": str(e), **self._last_project_info}
    
    def get_tracks_info(self):
        try:
            def _get_tracks(reapy):
                project = reapy.Project()
                tracks = []
                for i, track in enumerate(project.tracks):
                    try:
                        track_info = {
                            "index": i, "name": track.name if track.name else f"Track {i+1}",
                            "muted": track.is_muted, "solo": track.is_solo, "armed": track.is_armed,
                            "volume_db": round(track.volume, 1), "pan": round(track.pan, 2),
                            "n_items": len(track.items), "fx_count": track.n_fxs
                        }
                        try:
                            track_info["color"] = track.color
                        except:
                            track_info["color"] = None
                        tracks.append(track_info)
                    except Exception as track_error:
                        tracks.append({"index": i, "name": f"Track {i+1}", "error": str(track_error)})
                return {"success": True, "tracks": tracks, "count": len(tracks)}
            return self._safe_execute(_get_tracks)
        except Exception as e:
            return {"success": False, "error": str(e), "tracks": [], "count": 0}
    
    def execute_code(self, code: str) -> dict:
        with self._lock:
            reapy = self._import_reapy()
            output_buffer = []
            
            def custom_print(*args, **kwargs):
                output_buffer.append(' '.join(str(arg) for arg in args))
            
            exec_globals = {'__builtins__': __builtins__, 'reapy': reapy, 'print': custom_print}
            
            try:
                with reapy.inside_reaper():
                    exec(code, exec_globals)
                self._connected = True
                return {"success": True, "output": '\n'.join(output_buffer) if output_buffer else ""}
            except IndexError as e:
                return {"success": False, "error": f"Indeksivirhe: {str(e)}", "hint": "Raitaa tai itemia ei loydy.", "error_type": "index_error"}
            except AttributeError as e:
                self._connected = True
                return {"success": False, "error": f"ReaPy API virhe: {str(e)}", "hint": "Tarkista metodin nimi", "error_type": "api_error"}
            except Exception as e:
                error_str = str(e).lower()
                if 'connect' in error_str or 'socket' in error_str:
                    self._connected = False
                    return {"success": False, "error": "Yhteys Reaperiin katkesi", "hint": "Varmista etta Reaper on kaynnissa", "error_type": "connection_error"}
                return {"success": False, "error": f"{type(e).__name__}: {str(e)}", "error_type": "execution_error"}

reaper = ReaperConnection()

@app.route('/health', methods=['GET'])
def health():
    info = reaper.get_project_info()
    if info.get("connected"):
        return jsonify({"status": "healthy", **info})
    else:
        return jsonify({"status": "disconnected", "connected": False, "error": info.get("error", "Ei yhteytta")}), 503

@app.route('/execute', methods=['POST'])
def execute():
    data = request.json
    if not data:
        return jsonify({"success": False, "error": "Ei JSON-dataa"}), 400
    code = data.get('code', '')
    if not code.strip():
        return jsonify({"success": False, "error": "Tyhja koodi"}), 400
    
    print("\n" + "="*50)
    print("SAAPUNUT KOODI:")
    print("-"*50)
    print(code[:500] + "..." if len(code) > 500 else code)
    print("-"*50)
    
    result = reaper.execute_code(code)
    
    if result["success"]:
        print("Suoritus onnistui!")
        if result.get("output"):
            print(f"Output: {result['output']}")
    else:
        print(f"Virhe: {result['error']}")
    print("="*50 + "\n")
    
    return jsonify(result)

@app.route('/project', methods=['GET'])
def get_project():
    return jsonify(reaper.get_project_info())

@app.route('/tracks', methods=['GET'])
def get_tracks():
    return jsonify(reaper.get_tracks_info())

@app.route('/action/<int:action_id>', methods=['POST'])
def run_action(action_id):
    code = f"reapy.perform_action({action_id})\nprint('Action {action_id} suoritettu')"
    return jsonify(reaper.execute_code(code))

@app.route('/transport/<action>', methods=['POST'])
def transport_control(action):
    actions = {'play': 'project.play()', 'stop': 'project.stop()', 'pause': 'project.pause()', 'record': 'project.record()'}
    if action not in actions:
        return jsonify({"success": False, "error": f"Tuntematon toiminto: {action}"}), 400
    code = f"project = reapy.Project()\n{actions[action]}\nprint('Transport: {action}')"
    return jsonify(reaper.execute_code(code))

def print_banner():
    print("""
========================================
   HIPARE REAPER BRIDGE v3.0
========================================
   Portti: 3003
   Endpoints:
     GET  /health   - Yhteyden tila
     POST /execute  - Suorita koodi
     GET  /project  - Projektin tiedot
     GET  /tracks   - Raitojen tiedot
========================================
""")

def check_initial_connection():
    print("Tarkistetaan Reaper-yhteys...")
    info = reaper.check_connection()
    if info.get("connected"):
        print(f"Yhteys OK! Projekti: {info.get('project_name', 'N/A')}, Raitoja: {info.get('track_count', 0)}")
    else:
        print("Ei yhteytta Reaperiin - odottaa...")

if __name__ == '__main__':
    print_banner()
    check_initial_connection()
    print("\nKaynnistetaan HTTP-palvelin...\n")
    host = os.environ.get('REAPER_BRIDGE_HOST', '127.0.0.1')
    bridge_port = int(os.environ.get('REAPER_BRIDGE_PORT', '3003'))
    app.run(host=host, port=bridge_port, threaded=True, debug=False)