/**
 * HIPARE - Reaper AI Agent Server v1.0
 * - KORJATTU: UTF-8 merkistö
 * - KORJATTU: Action ID -pohjainen lähestymistapa
 * - KORJATTU: Yksinkertaistettu prompt
 * - UUSI: Asetukset API
 */

const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { spawn } = require('child_process');
const readline = require('readline');
require('dotenv').config();

// ============================================
// CURSOR DEBUG LOGGER
// ============================================
const DEBUG_LOG_PATH = path.join(__dirname, 'cursor_debug.log');
const MAX_LOG_SIZE = 50000;

function logForCursor(type, data) {
    try {
        const timestamp = new Date().toISOString();
        const entry = { time: timestamp, type, data };
        const logLine = JSON.stringify(entry) + '\n';
        if (fs.existsSync(DEBUG_LOG_PATH)) {
            const stats = fs.statSync(DEBUG_LOG_PATH);
            if (stats.size > MAX_LOG_SIZE) {
                fs.writeFileSync(DEBUG_LOG_PATH, '');
            }
        }
        fs.appendFileSync(DEBUG_LOG_PATH, logLine, 'utf8');
    } catch (e) {
        // silently fail
    }
}

// ============================================
// MCP CLIENT - Modern REAPER Bridge
// ============================================
class MCPClient {
    constructor(pythonPath, serverPath, profile = 'dsl-production') {
        this.pythonPath = pythonPath;
        this.serverPath = serverPath;
        this.profile = profile;
        this.process = null;
        this.connected = false;
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.bridgeDataPath = null;
        this.autoRestart = true;
    }

    getBridgeDataPath() {
        if (!this.bridgeDataPath) {
            const home = process.env.USERPROFILE || process.env.HOME;
            if (process.platform === 'win32') {
                this.bridgeDataPath = path.join(home, 'AppData', 'Roaming', 'REAPER', 'Scripts', 'mcp_bridge_data');
            } else if (process.platform === 'darwin') {
                this.bridgeDataPath = path.join(home, 'Library', 'Application Support', 'REAPER', 'Scripts', 'mcp_bridge_data');
            } else {
                this.bridgeDataPath = path.join(home, '.config', 'REAPER', 'Scripts', 'mcp_bridge_data');
            }
        }
        return this.bridgeDataPath;
    }

    async start() {
        return new Promise((resolve, reject) => {
            const args = ['-m', 'server.app', '--profile', this.profile];
            this.process = spawn(this.pythonPath, args, {
                cwd: this.serverPath,
                env: {
                    ...process.env,
                    PYTHONUNBUFFERED: '1',
                    REAPER_MCP_BRIDGE_DIR: this.getBridgeDataPath()
                }
            });

            const rl = readline.createInterface({
                input: this.process.stdout,
                crlfDelay: Infinity
            });

            rl.on('line', (line) => {
                try {
                    const message = JSON.parse(line);
                    this.handleMessage(message);
                } catch (error) {
                    // Ei JSON-viesti, todennäköisesti loki
                }
            });

            this.process.stderr.on('data', (data) => {
                const lines = data.toString().split('\n');
                lines.forEach(line => {
                    if (line.includes('Server ready') || line.includes('MCP server running')) {
                        this.connected = true;
                        console.log('✅ MCP Server valmis');
                        resolve();
                    }
                    if (line.trim()) console.log('[MCP]', line.trim());
                });
            });

            this.process.on('error', (error) => {
                console.error('❌ MCP process error:', error);
                reject(error);
            });

            this.process.on('exit', (code) => {
                this.connected = false;
                console.log(`MCP process exited with code ${code}`);

                if (this.autoRestart && code !== 0) {
                    console.log('🔄 Yritetään MCP:n uudelleenkäynnistystä 5 sekunnin kuluttua...');
                    setTimeout(() => {
                        this.start().catch(err => {
                            console.error('Uudelleenkäynnistys epäonnistui:', err);
                        });
                    }, 5000);
                }
            });

            setTimeout(() => {
                if (!this.connected) {
                    reject(new Error('MCP startup timeout (10s)'));
                }
            }, 10000);
        });
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.requestId++;
            const currentRequestId = this.requestId;
            const request = {
                jsonrpc: '2.0',
                method: 'initialize',
                params: {
                    protocolVersion: '2024-11-05',
                    capabilities: {},
                    clientInfo: {
                        name: 'hipare-mcp-client',
                        version: '6.0'
                    }
                },
                id: currentRequestId
            };

            this.pendingRequests.set(currentRequestId, { resolve, reject, timestamp: Date.now() });
            this.process.stdin.write(JSON.stringify(request) + '\n');

            setTimeout(() => {
                if (this.pendingRequests.has(currentRequestId)) {
                    this.pendingRequests.delete(currentRequestId);
                    reject(new Error('MCP initialize timeout'));
                }
            }, 5000);
        });
    }

    async callTool(toolName, args) {
        return new Promise((resolve, reject) => {
            if (!this.connected || !this.process) {
                console.error('❌ MCP callTool epäonnistui: Ei yhteyttä');
                return reject(new Error('MCP ei ole yhdistetty'));
            }

            this.requestId++;
            const currentRequestId = this.requestId; // Capture for timeout closure
            const request = {
                jsonrpc: '2.0',
                method: 'tools/call',
                params: {
                    name: toolName,
                    arguments: args
                },
                id: currentRequestId
            };

            console.log(`📤 MCP REQUEST [${currentRequestId}]:`, JSON.stringify(request, null, 2));

            this.pendingRequests.set(currentRequestId, { resolve, reject, timestamp: Date.now() });

            this.process.stdin.write(JSON.stringify(request) + '\n');

            setTimeout(() => {
                if (this.pendingRequests.has(currentRequestId)) {
                    console.error(`⏱️ MCP TIMEOUT [${currentRequestId}]: ${toolName} ei vastannut 15s sisällä`);
                    this.pendingRequests.delete(currentRequestId);
                    reject(new Error(`MCP tool call timeout (15s): ${toolName}`));
                }
            }, 15000);
        });
    }

    async request(req) {
        return new Promise((resolve, reject) => {
            if (!this.connected || !this.process) {
                return reject(new Error('MCP ei ole yhdistetty'));
            }

            this.requestId++;
            const currentRequestId = this.requestId;
            const request = {
                jsonrpc: '2.0',
                method: req.method,
                params: req.params || {},
                id: currentRequestId
            };

            this.pendingRequests.set(currentRequestId, { resolve, reject, timestamp: Date.now() });
            this.process.stdin.write(JSON.stringify(request) + '\n');

            setTimeout(() => {
                if (this.pendingRequests.has(currentRequestId)) {
                    this.pendingRequests.delete(currentRequestId);
                    reject(new Error(`MCP request timeout: ${req.method}`));
                }
            }, 15000);
        });
    }

    handleMessage(message) {
        console.log(`📥 MCP RESPONSE [${message.id}]:`, JSON.stringify(message, null, 2));

        if (message.id && this.pendingRequests.has(message.id)) {
            const { resolve, reject } = this.pendingRequests.get(message.id);
            this.pendingRequests.delete(message.id);

            if (message.error) {
                console.error(`❌ MCP ERROR [${message.id}]:`, message.error);
                reject(new Error(message.error.message || 'MCP error'));
            } else {
                console.log(`✅ MCP SUCCESS [${message.id}]`);
                resolve(message.result);
            }
        } else if (message.id) {
            console.warn(`⚠️ MCP response for unknown request: ${message.id}`);
        }
    }

    async stop() {
        if (this.process) {
            this.autoRestart = false;
            this.process.kill();
            this.process = null;
            this.connected = false;
        }
    }
}

let mcpClient = null;

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());
app.use(express.static('public'));

console.log(`
╔══════════════════════════════════════════════════════╗
║   HIPARE - REAPER AI AGENT v1.0                      ║
║   MCP Edition                                        ║
╚══════════════════════════════════════════════════════╝
`);

// ============================================
// ASETUKSET - Ladataan .env:stä tai oletukset
// ============================================
let CONFIG = {
    REAPER_PATH: process.env.REAPER_PATH || path.join(process.env.USERPROFILE || process.env.HOME, 'AppData', 'Roaming', 'REAPER'),
    REAPER_MCP_BRIDGE_DIR: null,  // Asetetaan dynaamisesti MCPClient:ssä
    MCP_PROFILE: process.env.MCP_PROFILE || 'dsl-production',
    PYTHON_PATH: process.env.PYTHON_PATH || 'python',
    REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT) || 15000
};

const apiKeys = {
    google: process.env.GOOGLE_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    groq: process.env.GROQ_API_KEY
};

console.log('API Keys: ' +
    `Google: ${apiKeys.google ? '✓' : '✗'} | ` +
    `OpenRouter: ${apiKeys.openrouter ? '✓' : '✗'} | ` +
    `Groq: ${apiKeys.groq ? '✓' : '✗'}`);

const API_CONFIG = {
    // Gemini mallit - paras ensin
    'gemini-2.5-pro': {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKeys.google}`,
        type: 'google', name: 'Gemini 2.5 Pro', icon: '👑',
        description: 'Paras laatu, thinking mode. Kallis.',
        quality: 5, speed: 2, cost: 5, context: '1M'
    },
    'gemini-2.5-flash': {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeys.google}`,
        type: 'google', name: 'Gemini 2.5 Flash', icon: '⚡',
        description: 'Nopea ja älykäs, thinking mode.',
        quality: 4, speed: 4, cost: 3, context: '1M'
    },
    'gemini-2.0-flash': {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKeys.google}`,
        type: 'google', name: 'Gemini 2.0 Flash', icon: '🤖',
        description: 'Hyvä perusmalli, nopea.',
        quality: 3, speed: 5, cost: 2, context: '1M'
    },
    'gemini-2.0-flash-lite': {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKeys.google}`,
        type: 'google', name: 'Gemini 2.0 Lite', icon: '💨',
        description: 'Halvin ja nopein, perustehtäviin.',
        quality: 2, speed: 5, cost: 1, context: '1M'
    },
    // Legacy alias
    'gemini': {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKeys.google}`,
        type: 'google', name: 'Gemini 2.0 Flash', icon: '🤖',
        description: 'Hyvä perusmalli.',
        quality: 3, speed: 5, cost: 2, context: '1M'
    }
};

// Dynaaminen API-konfiguraation haku
function getModelConfig(modelId) {
    // Jos löytyy staattisesta configista, käytä sitä
    if (API_CONFIG[modelId]) {
        return API_CONFIG[modelId];
    }

    // Määritä ikoni mallin perusteella
    let icon = '🤖';
    if (modelId.includes('llama')) icon = '🦙';
    else if (modelId.includes('claude') && modelId.includes('opus')) icon = '👑';
    else if (modelId.includes('claude') && modelId.includes('sonnet')) icon = '🎨';
    else if (modelId.includes('claude') && modelId.includes('haiku')) icon = '⚡';
    else if (modelId.includes('gemini') || modelId.includes('google')) icon = '🤖';
    else if (modelId.includes('gpt-4')) icon = '🧠';
    else if (modelId.includes('gpt-3.5')) icon = '💬';
    else if (modelId.includes('mistral')) icon = '🌬️';
    else if (modelId.includes('mixtral')) icon = '🌀';

    // Lyhennä nimi jos liian pitkä
    let name = modelId.split('/').pop().replace(/-instruct|-chat|-versatile/g, '');

    // Tunnista palvelu modelId:n muodosta
    // Groq: alkaa "groq/" TAI ei sisällä "/" (esim. "groq/llama-3.3-70b-versatile" tai "llama-3.3-70b-versatile")
    // OpenRouter: sisältää "/" mutta ei ala "groq/" (esim. "meta-llama/llama-3.3-70b-instruct:free")
    // Google: alkaa "gemini-" tai "models/gemini-"

    if (modelId.startsWith('groq/') || !modelId.includes('/')) {
        // Groq-malli - poista "groq/" prefix jos on
        const groqModel = modelId.replace('groq/', '');
        return {
            url: 'https://api.groq.com/openai/v1/chat/completions',
            apiKey: apiKeys.groq,
            type: 'groq',
            model: groqModel,
            name: name,
            icon: icon + ' ⚡'  // Groq on nopea
        };
    } else if (modelId.startsWith('gemini-') || modelId.startsWith('models/gemini-')) {
        // Google-malli
        const geminiModel = modelId.replace('models/', '');
        return {
            url: `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKeys.google}`,
            type: 'google',
            model: geminiModel,
            name: name,
            icon: icon
        };
    } else {
        // OpenRouter-malli
        return {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            apiKey: apiKeys.openrouter,
            type: 'openrouter',
            model: modelId,
            name: name,
            icon: icon
        };
    }
}

// ============================================
// REAPER ACTION ID:T - Luotettavat komennot!
// ============================================
const REAPER_ACTIONS = {
    // Track
    INSERT_TRACK: 40001,
    REMOVE_TRACKS: 40005,
    SELECT_ALL_TRACKS: 40296,
    UNSELECT_ALL_TRACKS: 40731,
    DUPLICATE_TRACKS: 41538,
    TOGGLE_RECORD_ARM: 9,
    MUTE_UNMUTE: 40730,
    SOLO_UNSOLO: 40728,
    RENAME_TRACK: 42667,
    
    // Transport
    PLAY: 1007,
    STOP: 1016,
    PAUSE: 1008,
    RECORD: 1013,
    
    // File
    SAVE_PROJECT: 40026,
    NEW_PROJECT: 41569,
    
    // View
    FX_BROWSER: 42678,
    
    // Track selection (1-10)
    SELECT_TRACK_01: 40939,
    SELECT_TRACK_02: 40940,
    SELECT_TRACK_03: 40941,
    SELECT_TRACK_04: 40942,
    SELECT_TRACK_05: 40943,
    SELECT_TRACK_06: 40944,
    SELECT_TRACK_07: 40945,
    SELECT_TRACK_08: 40946,
    SELECT_TRACK_09: 40947,
    SELECT_TRACK_10: 40948,
};

// Track selection by index (helper)
function getSelectTrackAction(index) {
    if (index < 0 || index > 9) return null;
    return 40939 + index; // 40939 = track 1, 40940 = track 2, etc.
}

// ============================================
// VIRHEIDEN KÄSITTELY
// ============================================
function humanizeError(error) {
    const errorStr = String(error).toLowerCase();
    
    if (errorStr.includes("can't find fx") || errorStr.includes("valueerror")) {
        const match = error.match(/named\s+(\S+)/i);
        const fxName = match ? match[1] : 'efektia';
        return `En loytanyt "${fxName}" nimista efektia. Haluatko etta etsin vastaavia?`;
    }
    if (errorStr.includes("indexerror") || errorStr.includes("index out of range")) {
        return "Raitaa tai kohdetta ei loytynyt. Tarkistetaanko mita raitoja projektissa on?";
    }
    if (errorStr.includes("connection") || errorStr.includes("socket") || errorStr.includes("timeout")) {
        return "Yhteys Reaperiin katkesi. Tarkista etta Reaper ja Bridge ovat kaynnissa.";
    }
    return "Hmm, tuo ei onnistunut. Kokeillaan uudelleen?";
}

// ============================================
// VST PLUGINS
// ============================================
function getVSTPlugins() {
    try {
        const vstIniPath = path.join(CONFIG.REAPER_PATH, 'reaper-vstplugins64.ini');
        if (!fs.existsSync(vstIniPath)) return [];
        const content = fs.readFileSync(vstIniPath, 'utf-8');
        const plugins = [];
        for (let line of content.split('\n')) {
            if (line.includes('.dll') && !line.toLowerCase().includes('reaper')) {
                const match = line.match(/([^\\\/]+)\.dll/i);
                if (match) plugins.push({ name: match[1], path: line.match(/^(.+\.dll)/i)?.[1] || '' });
            }
        }
        return [...new Map(plugins.map(p => [p.name, p])).values()].sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        return [];
    }
}

function getVSTCategories(vstList) {
    const categories = { reverb: [], delay: [], compressor: [], eq: [], distortion: [], amp: [], drums: [], instruments: [], other: [] };
    for (const vst of vstList) {
        const name = vst.name.toLowerCase();
        if (/drum|mt.?power|slate.?drum|ssd5|ezdrummer|superior.?drum|addictive.?drum|sitala|sean.?pandy|battery|bfd|steven.?slate/i.test(name)) categories.drums.push(vst.name);
        else if (/piano|keys|keyzone|labs|vital|surge|synth|kontakt|omnisphere|serum|diva|massive|spire|organ|electric.?piano|rhodes|wurlitz/i.test(name)) categories.instruments.push(vst.name);
        else if (/reverb|hall|room|plate|verb/i.test(name)) categories.reverb.push(vst.name);
        else if (/delay|echo|tap/i.test(name)) categories.delay.push(vst.name);
        else if (/comp|limit|dynamic/i.test(name)) categories.compressor.push(vst.name);
        else if (/eq|equal|filter|tone/i.test(name)) categories.eq.push(vst.name);
        else if (/amp|emissary|ignite|cabinet|cab|ir\b|impulse/i.test(name)) categories.amp.push(vst.name);
        else if (/dist|overdrive|drive|satur|fuzz|808|tube/i.test(name)) categories.distortion.push(vst.name);
        else categories.other.push(vst.name);
    }
    return categories;
}

// ============================================
// MCP BRIDGE FUNCTIONS
// ============================================
// ============================================
// MIDI HELPER FUNCTIONS
// ============================================

/**
 * Muuntaa nuottinimi (C4, D#5, Bb3) MIDI pitch-numeroksi
 * @param {string} noteName - Nuotin nimi (esim. "C4", "D#5", "Bb3")
 * @returns {number} - MIDI pitch (0-127)
 */
function noteNameToPitch(noteName) {
    const noteMap = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };

    // Parsitaan nuotti ja oktaavi (esim. "C4" -> C, 4)
    const match = noteName.match(/^([A-G][#b]?)(-?\d+)$/i);
    if (!match) {
        console.warn(`Virheellinen nuottinimi: ${noteName}, käytetään C4 (60)`);
        return 60;
    }

    const note = match[1].toUpperCase();
    const octave = parseInt(match[2]);

    const noteValue = noteMap[note];
    if (noteValue === undefined) {
        console.warn(`Tuntematon nuotti: ${note}, käytetään C4 (60)`);
        return 60;
    }

    // MIDI pitch = (oktaavi + 1) * 12 + nuottiarvo
    // C4 = 60, C5 = 72, jne.
    const pitch = (octave + 1) * 12 + noteValue;
    return Math.max(0, Math.min(127, pitch)); // Rajataan 0-127
}

/**
 * Luo MIDI-pattern yksinkertaisella formaatilla
 * @param {Object} args - Yksinkertainen: { track: "nimi", note: "C4", duration: 1 }
 *                        TAI monimutkainen: { track: "nimi", notes: [{pitch, start, duration}] }
 */
async function createMidiPattern(args) {
    try {
        // 0. Jos pattern-preset annettu, muunna se nuoteiksi
        const patternKey = args.pattern || args.preset; // Tue molempia
        if (patternKey && !args.notes && !args.note) {
            args.pattern = patternKey; // Normalisoi
            const drumPatterns = {
                // MIDI drum map: kick=36, snare=38, hihat=42, open_hh=46, crash=49, ride=51, tom_hi=48, tom_mid=47, tom_lo=45
                'basic_rock': {
                    notes: (() => {
                        const n = [];
                        // 8 tahtia rock-komppi vaihtelulla
                        for (let bar = 0; bar < 8; bar++) {
                            const b = bar * 4;
                            // Perus kick-snare
                            n.push({pitch: 36, start: b, duration: 0.5, velocity: 110});      // kick beat 1
                            n.push({pitch: 38, start: b + 1, duration: 0.5, velocity: 100});   // snare beat 2
                            n.push({pitch: 36, start: b + 2, duration: 0.5, velocity: 105});   // kick beat 3
                            n.push({pitch: 38, start: b + 3, duration: 0.5, velocity: 100});   // snare beat 4
                            // Hihats kahdeksasosina
                            for (let s = 0; s < 4; s += 0.5) {
                                n.push({pitch: 42, start: b + s, duration: 0.25, velocity: s % 1 === 0 ? 80 : 65});
                            }
                            // Vaihtelua: ghost kick ja open hihat joka toisessa tahdissa
                            if (bar % 2 === 1) {
                                n.push({pitch: 36, start: b + 1.5, duration: 0.25, velocity: 75}); // ghost kick
                                n.push({pitch: 46, start: b + 3.5, duration: 0.25, velocity: 80}); // open hihat
                            }
                        }
                        // Filli tahdissa 4 ja 8
                        n.push({pitch: 48, start: 14, duration: 0.25, velocity: 90});  // tom hi
                        n.push({pitch: 47, start: 14.5, duration: 0.25, velocity: 85}); // tom mid
                        n.push({pitch: 49, start: 15, duration: 0.5, velocity: 95});   // crash
                        n.push({pitch: 48, start: 30, duration: 0.25, velocity: 95});   // fill bar 8
                        n.push({pitch: 47, start: 30.5, duration: 0.25, velocity: 90});
                        n.push({pitch: 45, start: 31, duration: 0.25, velocity: 90});   // tom lo
                        n.push({pitch: 49, start: 31.5, duration: 0.5, velocity: 100}); // crash
                        return n;
                    })(),
                    length: 32
                },
                'metal': {
                    notes: (() => {
                        const n = [];
                        // 8 tahtia: tupla-basari metalli - vaihteleva groove
                        for (let bar = 0; bar < 8; bar++) {
                            const b = bar * 4;
                            // Tupla-basari 16-osanuotteina
                            for (let s = 0; s < 4; s += 0.25) {
                                n.push({pitch: 36, start: b + s, duration: 0.2, velocity: 115 + (s % 0.5 === 0 ? 5 : -5)});
                            }
                            // Hihat kahdeksasosina
                            for (let s = 0; s < 4; s += 0.5) {
                                n.push({pitch: 42, start: b + s, duration: 0.25, velocity: 85});
                            }
                            // Snare beats 2 & 4
                            n.push({pitch: 38, start: b + 1, duration: 0.5, velocity: 120});
                            n.push({pitch: 38, start: b + 3, duration: 0.5, velocity: 120});
                            // Vaihtelua joka 4. tahti: blast beat tai filli
                            if (bar === 3) {
                                n.push({pitch: 38, start: b + 2, duration: 0.25, velocity: 110}); // extra snare
                                n.push({pitch: 38, start: b + 2.5, duration: 0.25, velocity: 105});
                            }
                            if (bar === 7) {
                                // Filli viimeisessä tahdissa
                                n.push({pitch: 48, start: b + 2, duration: 0.25, velocity: 100});
                                n.push({pitch: 47, start: b + 2.5, duration: 0.25, velocity: 95});
                                n.push({pitch: 45, start: b + 3, duration: 0.25, velocity: 100});
                            }
                        }
                        // Crash tahdeissa 1 ja 5
                        n.push({pitch: 49, start: 0, duration: 0.5, velocity: 110});
                        n.push({pitch: 49, start: 16, duration: 0.5, velocity: 110});
                        n.push({pitch: 49, start: 31.5, duration: 0.5, velocity: 115}); // loppu crash
                        return n;
                    })(),
                    length: 32
                },
                'funk': {
                    notes: (() => {
                        const n = [];
                        // 8 tahtia synkopoitu funk groove
                        for (let bar = 0; bar < 8; bar++) {
                            const b = bar * 4;
                            // Synkopoitu kick
                            n.push({pitch: 36, start: b, duration: 0.5, velocity: 110});
                            n.push({pitch: 36, start: b + 1.5, duration: 0.25, velocity: 90});
                            n.push({pitch: 36, start: b + 2.75, duration: 0.25, velocity: 95});
                            // Snare ghost notes + backbeat
                            n.push({pitch: 38, start: b + 1, duration: 0.5, velocity: 100});
                            n.push({pitch: 38, start: b + 3, duration: 0.5, velocity: 100});
                            n.push({pitch: 38, start: b + 0.5, duration: 0.25, velocity: 45}); // ghost
                            n.push({pitch: 38, start: b + 2.5, duration: 0.25, velocity: 45}); // ghost
                            // 16th note hihats vaihtelevalla dynamiikalla
                            for (let s = 0; s < 4; s += 0.25) {
                                const vel = s % 1 === 0 ? 90 : s % 0.5 === 0 ? 70 : 50;
                                n.push({pitch: 42, start: b + s, duration: 0.2, velocity: vel});
                            }
                            // Open hihat vaihtelussa
                            if (bar % 2 === 1) {
                                n.push({pitch: 46, start: b + 3.75, duration: 0.25, velocity: 85});
                            }
                        }
                        // Filli
                        n.push({pitch: 48, start: 30, duration: 0.25, velocity: 90});
                        n.push({pitch: 47, start: 30.5, duration: 0.25, velocity: 85});
                        n.push({pitch: 45, start: 31, duration: 0.25, velocity: 90});
                        n.push({pitch: 49, start: 31.5, duration: 0.5, velocity: 95});
                        return n;
                    })(),
                    length: 32
                },
                'jazz': {
                    notes: (() => {
                        const n = [];
                        // 8 tahtia jazz-swing komppi vaihtelevalla comping-tyylillä
                        for (let bar = 0; bar < 8; bar++) {
                            const b = bar * 4;
                            // Ride: swing-pattern (triolipohjainen)
                            n.push({pitch: 51, start: b, duration: 0.5, velocity: 80});
                            n.push({pitch: 51, start: b + 0.67, duration: 0.33, velocity: 55});
                            n.push({pitch: 51, start: b + 1, duration: 0.5, velocity: 78});
                            n.push({pitch: 51, start: b + 1.67, duration: 0.33, velocity: 55});
                            n.push({pitch: 51, start: b + 2, duration: 0.5, velocity: 80});
                            n.push({pitch: 51, start: b + 2.67, duration: 0.33, velocity: 55});
                            n.push({pitch: 51, start: b + 3, duration: 0.5, velocity: 78});
                            n.push({pitch: 51, start: b + 3.67, duration: 0.33, velocity: 55});
                            // Hi-hat jalan painallus beats 2 & 4
                            n.push({pitch: 44, start: b + 1, duration: 0.25, velocity: 55});
                            n.push({pitch: 44, start: b + 3, duration: 0.25, velocity: 55});
                            // Kick: vaihteleva, ei joka tahtiin sama
                            if (bar % 4 === 0) {
                                n.push({pitch: 36, start: b, duration: 0.5, velocity: 70});
                            } else if (bar % 4 === 1) {
                                n.push({pitch: 36, start: b + 2.67, duration: 0.33, velocity: 60});
                            } else if (bar % 4 === 2) {
                                n.push({pitch: 36, start: b, duration: 0.5, velocity: 65});
                                n.push({pitch: 36, start: b + 2, duration: 0.5, velocity: 60});
                            } else {
                                n.push({pitch: 36, start: b + 0.67, duration: 0.33, velocity: 55});
                                n.push({pitch: 36, start: b + 2.67, duration: 0.33, velocity: 60});
                            }
                            // Snare ghost notes - vaihtelevia
                            if (bar % 2 === 0) {
                                n.push({pitch: 38, start: b + 1.67, duration: 0.2, velocity: 35});
                                n.push({pitch: 38, start: b + 3.67, duration: 0.2, velocity: 30});
                            } else {
                                n.push({pitch: 38, start: b + 0.67, duration: 0.2, velocity: 30});
                                n.push({pitch: 38, start: b + 2.67, duration: 0.2, velocity: 35});
                            }
                        }
                        // Brush-tyylinen filli viimeisessä tahdissa
                        n.push({pitch: 38, start: 30, duration: 0.33, velocity: 50});
                        n.push({pitch: 38, start: 30.5, duration: 0.33, velocity: 55});
                        n.push({pitch: 38, start: 31, duration: 0.33, velocity: 60});
                        n.push({pitch: 49, start: 31.5, duration: 0.5, velocity: 70}); // crash (kevyt)
                        return n;
                    })(),
                    length: 32
                },
                'pop': {
                    notes: (() => {
                        const n = [];
                        // 8 tahtia pop/dance: four-on-floor + clap + offbeat hihat
                        for (let bar = 0; bar < 8; bar++) {
                            const b = bar * 4;
                            // Four-on-floor kick
                            for (let beat = 0; beat < 4; beat++) {
                                n.push({pitch: 36, start: b + beat, duration: 0.5, velocity: 100});
                            }
                            // Clap/snare 2 & 4
                            n.push({pitch: 39, start: b + 1, duration: 0.5, velocity: 90});
                            n.push({pitch: 39, start: b + 3, duration: 0.5, velocity: 90});
                            // Offbeat hihats
                            for (let s = 0.5; s < 4; s += 1) {
                                n.push({pitch: 42, start: b + s, duration: 0.25, velocity: 70});
                            }
                            // Lisävaihtelua: ghost kick ja open hihat
                            if (bar % 4 === 3) {
                                n.push({pitch: 36, start: b + 3.5, duration: 0.25, velocity: 80}); // pickup kick
                                n.push({pitch: 46, start: b + 3.75, duration: 0.25, velocity: 75}); // open hh
                            }
                        }
                        // Crash ja fillit
                        n.push({pitch: 49, start: 0, duration: 0.5, velocity: 95});
                        n.push({pitch: 49, start: 16, duration: 0.5, velocity: 95});
                        n.push({pitch: 48, start: 30, duration: 0.25, velocity: 85});
                        n.push({pitch: 47, start: 30.5, duration: 0.25, velocity: 80});
                        n.push({pitch: 49, start: 31, duration: 0.5, velocity: 100});
                        return n;
                    })(),
                    length: 32
                },
                // === UUDET LAAJENNETUT PRESETIT (8 tahtia vaihteluineen) ===
                'pop_verse': {
                    notes: (() => {
                        const n = [];
                        // 8 tahtia: hiljainen pop-verse groovi hihateilla ja pehmeillä kickeillä
                        for (let bar = 0; bar < 8; bar++) {
                            const b = bar * 4;
                            n.push({pitch: 36, start: b, duration: 0.5, velocity: 85}); // kick
                            n.push({pitch: 42, start: b + 0.5, duration: 0.25, velocity: 60}); // hihat
                            n.push({pitch: 36, start: b + 1, duration: 0.5, velocity: 80});
                            n.push({pitch: 38, start: b + 1, duration: 0.5, velocity: 75}); // snare
                            n.push({pitch: 42, start: b + 1.5, duration: 0.25, velocity: 55});
                            n.push({pitch: 42, start: b + 2, duration: 0.25, velocity: 60});
                            n.push({pitch: 42, start: b + 2.5, duration: 0.25, velocity: 55});
                            n.push({pitch: 36, start: b + 3, duration: 0.5, velocity: 85});
                            n.push({pitch: 38, start: b + 3, duration: 0.5, velocity: 75});
                            n.push({pitch: 42, start: b + 3.5, duration: 0.25, velocity: 60});
                        }
                        // Filli viimeisessä tahdissa
                        n.push({pitch: 48, start: 28, duration: 0.25, velocity: 85}); // tom hi
                        n.push({pitch: 47, start: 28.5, duration: 0.25, velocity: 80}); // tom mid
                        n.push({pitch: 45, start: 29, duration: 0.25, velocity: 85}); // tom lo
                        n.push({pitch: 49, start: 29.5, duration: 0.5, velocity: 95}); // crash
                        return n;
                    })(),
                    length: 32
                },
                'pop_chorus': {
                    notes: (() => {
                        const n = [];
                        // 8 tahtia: energinen chorus, four-on-floor + clap
                        for (let bar = 0; bar < 8; bar++) {
                            const b = bar * 4;
                            for (let beat = 0; beat < 4; beat++) {
                                n.push({pitch: 36, start: b + beat, duration: 0.5, velocity: 105}); // kick every beat
                                n.push({pitch: 42, start: b + beat + 0.5, duration: 0.25, velocity: 75}); // offbeat hihat
                            }
                            n.push({pitch: 39, start: b + 1, duration: 0.5, velocity: 95}); // clap on 2
                            n.push({pitch: 39, start: b + 3, duration: 0.5, velocity: 95}); // clap on 4
                        }
                        // Crash ja filli 8. tahdissa
                        n.push({pitch: 49, start: 0, duration: 0.5, velocity: 100}); // crash bar 1
                        n.push({pitch: 49, start: 28, duration: 0.5, velocity: 100}); // crash fill
                        n.push({pitch: 48, start: 30, duration: 0.25, velocity: 90}); // fill toms
                        n.push({pitch: 45, start: 30.5, duration: 0.25, velocity: 90});
                        n.push({pitch: 49, start: 31, duration: 0.5, velocity: 110}); // final crash
                        return n;
                    })(),
                    length: 32
                },
                'metal_verse': {
                    notes: (() => {
                        const n = [];
                        // 8 tahtia: aggressiivinen metalli-verse tupla-basarilla
                        for (let bar = 0; bar < 8; bar++) {
                            const b = bar * 4;
                            // Tupla-basari joka tahdissa
                            for (let s = 0; s < 4; s += 0.5) {
                                n.push({pitch: 36, start: b + s, duration: 0.25, velocity: 115 + (s % 1 === 0 ? 5 : -5)});
                            }
                            // Hihat kahdeksasosanuoteilla
                            for (let s = 0; s < 4; s += 0.5) {
                                n.push({pitch: 42, start: b + s, duration: 0.25, velocity: 80});
                            }
                            // Snare 2 ja 4
                            n.push({pitch: 38, start: b + 1, duration: 0.5, velocity: 120});
                            n.push({pitch: 38, start: b + 3, duration: 0.5, velocity: 120});
                        }
                        // Crash bar 1 ja viimeisen tahdin filli
                        n.push({pitch: 49, start: 0, duration: 0.5, velocity: 110});
                        n.push({pitch: 49, start: 28, duration: 0.5, velocity: 110});
                        return n;
                    })(),
                    length: 32
                },
                'metal_breakdown': {
                    notes: (() => {
                        const n = [];
                        // 8 tahtia: raskas breakdown, harva mutta iskevä
                        for (let bar = 0; bar < 8; bar++) {
                            const b = bar * 4;
                            n.push({pitch: 36, start: b, duration: 0.5, velocity: 127}); // kick + snare yhdessä
                            n.push({pitch: 38, start: b, duration: 0.5, velocity: 127});
                            n.push({pitch: 49, start: b, duration: 0.5, velocity: 110}); // crash
                            // Lyhyt tauko, sitten kick-snare uudestaan
                            n.push({pitch: 36, start: b + 1.5, duration: 0.25, velocity: 120});
                            n.push({pitch: 38, start: b + 1.5, duration: 0.25, velocity: 110});
                            // Staccato kick-pattern
                            n.push({pitch: 36, start: b + 2.5, duration: 0.25, velocity: 115});
                            n.push({pitch: 36, start: b + 3, duration: 0.25, velocity: 120});
                            n.push({pitch: 38, start: b + 3, duration: 0.5, velocity: 120});
                            n.push({pitch: 36, start: b + 3.5, duration: 0.25, velocity: 110});
                        }
                        return n;
                    })(),
                    length: 32
                }
            };

            const normalizedPattern = args.pattern.toLowerCase().replace(/[^a-z_]/g, '_');
            const preset = drumPatterns[normalizedPattern];

            if (preset) {
                args.notes = preset.notes;
                args.length = preset.length;
                console.log(`🥁 Käytetään rumpupresettiä: ${normalizedPattern} (${preset.notes.length} nuottia)`);
            } else {
                return { success: false, error: `Tuntematon preset: ${args.pattern}. Tuetut: basic_rock, metal, funk, jazz, pop, pop_verse, pop_chorus, metal_verse, metal_breakdown` };
            }
        }

        // Valmistele nuotit
        const trackName = args.track || 'MIDI';
        let notes = [];

        if (args.note) {
            // YKSINKERTAINEN FORMAATTI: { track: "Piano", note: "C4", duration: 1 }
            const pitch = noteNameToPitch(args.note);
            notes = [{
                pitch: pitch,
                start: 0.0,
                length: args.duration || 1,
                velocity: args.velocity || 100
            }];
            console.log(`🎵 Yksinkertainen nuotti: ${args.note} -> pitch ${pitch}`);
        } else if (args.notes && Array.isArray(args.notes)) {
            // MONIMUTKAINEN FORMAATTI: { track: "Piano", notes: [{pitch: 60, ...}] }
            notes = args.notes.map(note => {
                const pitch = typeof note.pitch === 'string' ? noteNameToPitch(note.pitch) : note.pitch;
                return {
                    pitch: pitch,
                    start: note.start || 0.0,
                    length: note.duration || note.length || 1,
                    velocity: note.velocity || 100
                };
            });
            console.log(`🎵 Lisätään ${notes.length} nuottia...`);
        } else {
            return { success: false, error: 'Anna joko "note" (yksinkertainen), "notes" (array) tai "pattern" (preset)' };
        }

        // Käytä dsl_midi_insert DSL-työkalua (tukee raidan nimeä suoraan)
        const bars = args.length || args.bars || 4;
        console.log(`🎹 Luodaan MIDI pattern raidalle "${trackName}" (${notes.length} nuottia, ${bars} tahtia)`);

        const result = await mcpClient.callTool('dsl_midi_insert', {
            track: trackName,
            time: `${bars} bars`,
            midi_data: { notes: notes }
        });

        const resultText = result.content?.[0]?.text || '';
        const isError = result.isError || resultText.includes('error') || resultText.includes('Error');

        return {
            success: !isError,
            output: isError ? resultText : `MIDI pattern luotu: ${notes.length} nuottia raidalla "${trackName}"`
        };

    } catch (error) {
        console.error('❌ MIDI pattern virhe:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Luo sointu MIDI-raidalle
 * @param {Object} args - { track: "nimi", chord: "C", start: 0, duration: 4, velocity: 100 }
 */
async function createChord(args) {
    // Sointutaulukko: root note (C=60) + tyyppi
    const chordMap = {
        'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63,
        'E': 64, 'F': 65, 'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68,
        'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71
    };

    // Sointu-intervallit (major, minor, dim, aug, jne.)
    const chordTypes = {
        'major': [0, 4, 7],
        'maj': [0, 4, 7],
        '': [0, 4, 7],  // Default major
        'minor': [0, 3, 7],
        'min': [0, 3, 7],
        'm': [0, 3, 7],
        'dim': [0, 3, 6],
        'aug': [0, 4, 8],
        'maj7': [0, 4, 7, 11],
        'min7': [0, 3, 7, 10],
        'm7': [0, 3, 7, 10],
        'dom7': [0, 4, 7, 10],
        '7': [0, 4, 7, 10],
        'sus2': [0, 2, 7],
        'sus4': [0, 5, 7]
    };

    // Parsitaan sointu (esim. "Cm", "Gmaj7", "F#")
    const chordStr = args.chord || 'C';
    let root = 60;  // Default C
    let intervals = [0, 4, 7];  // Default major

    // Etsi root note
    for (const [noteName, midiNote] of Object.entries(chordMap)) {
        if (chordStr.startsWith(noteName)) {
            root = midiNote;
            const typeStr = chordStr.slice(noteName.length);
            intervals = chordTypes[typeStr] || chordTypes['major'];
            break;
        }
    }

    // Luo nuotit - käytä args.start offsettina
    const startOffset = args.start || 0;
    const notes = intervals.map((interval, index) => ({
        pitch: root + interval,
        start: startOffset,
        duration: args.duration || 4,
        velocity: args.velocity || 80,
        channel: 0
    }));

    // Käytä create_midi_pattern sisäisesti
    return await createMidiPattern({
        track: args.track,
        start: args.start || 0,
        length: args.duration || 4,
        notes: notes
    });
}

/**
 * Luo sointukierto yhdellä komennolla
 * Esim: { track: "Piano", progression: "A-F#m-D-E", duration_per_chord: 4, bars: 8 }
 */
async function createChordProgression(args) {
    const progression = args.progression || 'C-Am-F-G';
    const durationPerChord = args.duration_per_chord || 4;
    const totalBars = args.bars || null;
    const track = args.track || 'Piano';

    // Parsitaan sointukierron osat
    const chords = progression.split('-').map(c => c.trim());
    if (chords.length === 0) {
        return { success: false, error: 'Tyhjä sointukierto' };
    }

    // Lasketaan montako kertaa sointukierto toistetaan
    let repeats = 1;
    if (totalBars && totalBars > chords.length * durationPerChord) {
        repeats = Math.ceil(totalBars / (chords.length * durationPerChord));
    }

    const results = [];
    let currentStart = 0;

    for (let rep = 0; rep < repeats; rep++) {
        for (const chord of chords) {
            try {
                const result = await createChord({
                    track: track,
                    chord: chord,
                    start: currentStart,
                    duration: durationPerChord,
                    velocity: 80
                });
                results.push({ chord, start: currentStart, success: result.success });
            } catch (e) {
                results.push({ chord, start: currentStart, success: false, error: e.message });
            }
            currentStart += durationPerChord;
        }
    }

    const successCount = results.filter(r => r.success).length;
    const totalChords = results.length;

    return {
        success: successCount > 0,
        output: `Loin sointukierron ${progression} (${totalChords} sointua, ${successCount} onnistui). Kesto: ${currentStart} tahtia raidalle '${track}'.`
    };
}

/**
 * Luo masterointiketju master-raidalle
 * Esim: { genre: "pop" }
 */
async function createMasteringChain(args) {
    const genre = (args.genre || 'pop').toLowerCase();

    // Genre-kohtaiset asetukset
    const genreSettings = {
        'pop': { eqHighShelf: 0.55, compRatio: 0.4, compThreshold: 0.5, limiterCeiling: 0.9 },
        'rock': { eqHighShelf: 0.5, compRatio: 0.5, compThreshold: 0.45, limiterCeiling: 0.85 },
        'metal': { eqHighShelf: 0.45, compRatio: 0.6, compThreshold: 0.4, limiterCeiling: 0.8 },
        'electronic': { eqHighShelf: 0.6, compRatio: 0.55, compThreshold: 0.45, limiterCeiling: 0.85 },
        'jazz': { eqHighShelf: 0.45, compRatio: 0.25, compThreshold: 0.6, limiterCeiling: 0.95 },
        'hiphop': { eqHighShelf: 0.5, compRatio: 0.5, compThreshold: 0.45, limiterCeiling: 0.85 },
    };

    const settings = genreSettings[genre] || genreSettings['pop'];

    // LUFS-tavoitteet genren mukaan
    const lufsTargets = {
        'pop': '-9 to -11 LUFS', 'rock': '-10 to -12 LUFS', 'metal': '-8 to -10 LUFS',
        'electronic': '-8 to -10 LUFS', 'jazz': '-14 to -18 LUFS', 'hiphop': '-9 to -11 LUFS',
    };
    const lufsTarget = lufsTargets[genre] || '-12 to -14 LUFS';

    const steps = [];

    // 1. Lisää korjaava EQ (HPF + mud cut)
    try {
        const eq1 = await sendToReaper('add_fx', { track: 'Master', fx_name: 'ReaEQ' });
        steps.push({ step: 'Korjaava EQ (ReaEQ)', success: eq1.success });
    } catch (e) {
        steps.push({ step: 'Korjaava EQ', success: false, error: e.message });
    }

    // Pieni viive efektien välillä
    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. Lisää kompressori (bus compression)
    try {
        const comp = await sendToReaper('add_fx', { track: 'Master', fx_name: 'ReaComp' });
        steps.push({ step: 'Bus-kompressori (ReaComp)', success: comp.success });
    } catch (e) {
        steps.push({ step: 'Bus-kompressori', success: false, error: e.message });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Lisää tonaalinen EQ
    try {
        const eq2 = await sendToReaper('add_fx', { track: 'Master', fx_name: 'ReaEQ' });
        steps.push({ step: 'Tonaalinen EQ (ReaEQ)', success: eq2.success });
    } catch (e) {
        steps.push({ step: 'Tonaalinen EQ', success: false, error: e.message });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // 4. Lisää limiter
    try {
        const limit = await sendToReaper('add_fx', { track: 'Master', fx_name: 'ReaLimit' });
        steps.push({ step: 'Limiter (ReaLimit)', success: limit.success });
    } catch (e) {
        steps.push({ step: 'Limiter', success: false, error: e.message });
    }

    const successCount = steps.filter(s => s.success).length;
    const chainDescription = steps.map((s, i) => `${i+1}. ${s.step} [${s.success ? 'OK' : 'VIRHE'}]`).join('\n');

    return {
        success: successCount >= 2,
        output: `Masterointiketju luotu master-raidalle (${genre}):\n${chainDescription}\n\nGenre: ${genre}\nLUFS-tavoite: ${lufsTarget}\nSäädä parametreja adjust_effect-komennolla.`
    };
}

/**
 * Suorita Python audio analyzer WAV-tiedostolle
 * @param {string} wavPath - Polku WAV-tiedostoon
 * @param {string} genre - Genre kontekstin valintaa varten
 * @returns {Promise<Object>} - Analyysin tulokset
 */
async function runPythonAnalyzer(wavPath, genre = null) {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, 'audio_analyzer.py');

        // Tarkista että skripti löytyy
        if (!fs.existsSync(pythonScript)) {
            reject(new Error('audio_analyzer.py ei löydy'));
            return;
        }

        // Tarkista että WAV löytyy
        if (!fs.existsSync(wavPath)) {
            reject(new Error(`Tiedostoa ei löydy: ${wavPath}`));
            return;
        }

        console.log(`🎧 Analysoidaan: ${wavPath}`);

        const { spawn } = require('child_process');
        const python = spawn('python', [pythonScript, wavPath]);

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('Python analyzer error:', stderr);
                reject(new Error(stderr || 'Python-skripti epäonnistui'));
                return;
            }

            try {
                // Parsitaan JSON-osio vastauksesta
                const jsonMatch = stdout.match(/--- Raw JSON ---\n([\s\S]+)$/);
                if (jsonMatch) {
                    const analysis = JSON.parse(jsonMatch[1].trim());
                    resolve({
                        analysis: analysis,
                        formatted: stdout.split('--- Raw JSON ---')[0].trim(),
                        genre: genre
                    });
                } else {
                    resolve({
                        raw_output: stdout,
                        genre: genre
                    });
                }
            } catch (parseError) {
                resolve({
                    raw_output: stdout,
                    genre: genre
                });
            }
        });

        python.on('error', (err) => {
            reject(new Error(`Python käynnistysvirhe: ${err.message}. Varmista että Python on asennettu ja scipy-kirjasto löytyy (pip install scipy).`));
        });
    });
}

/**
 * Muodosta miksausneuvot analyysin perusteella
 * @param {Object} analysis - Analyysin tulokset
 * @param {string} genre - Genre
 * @returns {string} - Miksausneuvot
 */
function generateMixingSuggestions(analysis, genre = null) {
    if (!analysis || analysis.error) return '';

    let suggestions = [];

    // Taso-ongelmat
    if (analysis.peak_level > -1) {
        suggestions.push('⚠️ **Peak liian korkea** - Jätä headroomia masteroinnille (tavoite: -3 to -6 dB peak)');
    }
    if (analysis.rms_level < -25) {
        suggestions.push('📉 **Miksaus on hiljainen** - Nosta kokonaistasoa tai lisää kompressiota');
    }
    if (analysis.clipping_detected) {
        suggestions.push('🔴 **KLIPPAUS HAVAITTU** - Laske tasoa välittömästi!');
    }

    // Dynamiikka
    if (analysis.crest_factor < 6) {
        suggestions.push('🔧 **Ylikompressoitu** - Crest factor matala, dynamiikkaa puuttuu. Vähennä kompressiota.');
    } else if (analysis.crest_factor > 15) {
        suggestions.push('📊 **Paljon dynamiikkaa** - Harkitse kevyttä buss-kompressiota yhtenäisyyden lisäämiseksi.');
    }

    // Taajuusjakauma
    const freq = analysis.frequency_balance;
    if (freq) {
        if (freq.low_mids > 28) {
            suggestions.push('🎚️ **Mutaisuutta** - Leikkaa 200-400 Hz aluetta EQ:lla (esim. -3 to -5 dB)');
        }
        if (freq.highs < 8) {
            suggestions.push('✨ **Tumma miksaus** - Lisää ilmavuutta 8-12 kHz alueelle');
        }
        if (freq.highs > 35) {
            suggestions.push('🔊 **Kirkas/särisevä** - Leikkaa ylätaajuuksia tai tarkista de-esser');
        }
        if (freq.sub_bass > 20 && (!genre || !['electronic', 'hiphop', 'edm'].includes(genre?.toLowerCase()))) {
            suggestions.push('🔉 **Paljon sub-bassoa** - Tarkista HPF muilla raidoilla (30-80 Hz)');
        }
    }

    // LUFS streaming-tarkistus
    if (analysis.estimated_lufs > -9) {
        suggestions.push('📡 **LUFS korkea streamaukseen** - Spotify/YouTube normalisoivat alas. Tavoite: -14 LUFS (integroitu).');
    } else if (analysis.estimated_lufs < -18) {
        suggestions.push('📡 **LUFS matala** - Miksaus voi kuulostaa hiljaiselta streaming-palveluissa.');
    }

    // Genre-kohtaiset neuvot
    if (genre) {
        const g = genre.toLowerCase();
        if (g === 'metal' || g === 'rock') {
            if (freq && freq.high_mids < 12) {
                suggestions.push('🎸 **Metal/Rock**: Lisää presence-aluetta (2-5 kHz) kitaran pureutuvuudelle');
            }
        } else if (g === 'jazz') {
            if (analysis.crest_factor < 10) {
                suggestions.push('🎷 **Jazz**: Dynamiikka on tärkeää - vältä ylikompressiota');
            }
        } else if (g === 'electronic' || g === 'edm') {
            if (freq && freq.sub_bass < 10) {
                suggestions.push('🎹 **Electronic**: Lisää sub-bassoa (40-60 Hz) painoa varten');
            }
        }
    }

    if (suggestions.length === 0) {
        suggestions.push('✅ **Miksaus kuulostaa hyvältä!** Ei merkittäviä ongelmia havaittu.');
    }

    return suggestions.join('\n');
}

/**
 * Analysoi nykyinen miksaus
 * Jos tiedostopolku annetaan, analysoi se. Muuten ohjeista renderöimään.
 */
async function analyzeCurrentMix(args) {
    const target = args.target || args.kohde || 'project';
    const genre = args.genre || null;
    const filePath = args.file || args.path || args.tiedosto || null;

    try {
        // Jos käyttäjä antoi tiedostopolun, analysoi se suoraan
        if (filePath) {
            // Normalisoi polku
            let normalizedPath = path.normalize(filePath.replace(/['"]/g, ''));

            // Jos ei löydy suoraan, etsi yleisistä sijainneista
            if (!fs.existsSync(normalizedPath)) {
                console.log(`🔍 Tiedostoa ei löydy suoraan: ${normalizedPath}, etsitään...`);

                // Kokeile REAPER-projektikansioita ja yleisiä sijainteja
                const searchPaths = [
                    path.join(CONFIG.REAPER_PATH, filePath),
                    path.join(CONFIG.REAPER_PATH, 'MediaItems', filePath),
                    path.join(process.env.USERPROFILE || '', 'Documents', 'REAPER Media', filePath),
                    path.join(process.env.USERPROFILE || '', 'Music', filePath),
                    path.join(process.env.USERPROFILE || '', 'Desktop', filePath),
                    path.join(__dirname, filePath)
                ];

                for (const searchPath of searchPaths) {
                    if (fs.existsSync(searchPath)) {
                        normalizedPath = searchPath;
                        console.log(`✅ Löytyi: ${normalizedPath}`);
                        break;
                    }
                }
            }

            if (fs.existsSync(normalizedPath)) {
                console.log(`🎧 Analysoidaan käyttäjän tiedosto: ${normalizedPath}`);

                const result = await runPythonAnalyzer(normalizedPath, genre);
                const suggestions = generateMixingSuggestions(result.analysis, genre);

                let output = `🎧 **Audio-analyysin tulokset**\n\n`;

                if (result.analysis) {
                    const a = result.analysis;
                    output += `**Perustiedot:**\n`;
                    output += `- Kesto: ${a.duration}s | Sample rate: ${a.sample_rate} Hz | Kanavat: ${a.channels}\n\n`;

                    output += `**Tasot:**\n`;
                    output += `- Peak: ${a.peak_level} dB | RMS: ${a.rms_level} dB\n`;
                    output += `- Crest factor: ${a.crest_factor} dB | LUFS (arvio): ${a.estimated_lufs}\n\n`;

                    if (a.frequency_balance) {
                        output += `**Taajuusjakauma:**\n`;
                        output += `- Sub-bass (20-60Hz): ${a.frequency_balance.sub_bass}%\n`;
                        output += `- Bass (60-250Hz): ${a.frequency_balance.bass}%\n`;
                        output += `- Low-mids (250-500Hz): ${a.frequency_balance.low_mids}%\n`;
                        output += `- Mids (500-2kHz): ${a.frequency_balance.mids}%\n`;
                        output += `- High-mids (2-4kHz): ${a.frequency_balance.high_mids}%\n`;
                        output += `- Highs (4-20kHz): ${a.frequency_balance.highs}%\n\n`;
                    }

                    if (a.issues && a.issues.length > 0) {
                        output += `**Havaitut ongelmat:**\n`;
                        a.issues.forEach(issue => {
                            output += `- ${issue}\n`;
                        });
                        output += '\n';
                    }
                }

                output += `**Miksausneuvot:**\n${suggestions}`;

                return {
                    success: true,
                    output: output,
                    analysis: result.analysis
                };
            } else {
                return {
                    success: false,
                    error: `Tiedostoa ei löydy: ${normalizedPath}`
                };
            }
        }

        // Ei tiedostopolkua - ohjeista käyttäjää
        let instructions = `🎧 **Audio-analyysi**\n\n`;
        instructions += `Analysoidakseni miksauksesi, toimi näin:\n\n`;

        instructions += `**Vaihtoehto 1: Renderöi ja kerro polku**\n`;
        instructions += `1. Paina Reaperissa Ctrl+Alt+R (Render)\n`;
        instructions += `2. Valitse "Entire project" ja formaatti WAV (16 tai 24 bit)\n`;
        instructions += `3. Renderöi tiedosto haluamaasi sijaintiin\n`;
        instructions += `4. Kerro minulle tiedoston polku, esim:\n`;
        instructions += `   _"Analysoi C:/Music/mixdown.wav"_\n\n`;

        instructions += `**Vaihtoehto 2: Käytä Analysoi-nappia**\n`;
        instructions += `Klikkaa oikeassa yläkulmassa olevaa 🎧 Analysoi -nappia.\n\n`;

        if (genre) {
            instructions += `_Genre-konteksti: ${genre}_\n`;
        }

        instructions += `\n📊 _Analyysi sisältää: RMS/peak-tasot, taajuusjakauman, LUFS-arvion, ongelmatunnistuksen ja miksausneuvoja._`;

        return {
            success: true,
            output: instructions,
            needsUserInput: true
        };

    } catch (error) {
        console.error('Audio analysis error:', error);
        return {
            success: false,
            error: `Analyysivirhe: ${error.message}`
        };
    }
}

async function sendToReaper(command, args = {}) {
    if (!mcpClient || !mcpClient.connected) {
        return { success: false, error: 'MCP ei ole yhdistetty' };
    }

    try {
        let toolName, toolArgs;

        // Käännä komennot MCP DSL-kutsuiksi
        switch (command) {
            case 'create_track':
                toolName = 'dsl_track_create';
                toolArgs = { name: args.name, role: args.role || 'generic' };
                break;
            case 'rename_track':
                toolName = 'dsl_track_rename';
                toolArgs = { track: args.track, name: args.name };
                break;
            case 'set_volume':
                toolName = 'dsl_track_volume';
                toolArgs = { track: args.track, volume: args.volume };
                break;
            case 'set_mute':
                toolName = 'dsl_track_mute';
                toolArgs = { track: args.track, mute: args.mute };
                break;
            case 'set_solo':
                toolName = 'dsl_track_solo';
                toolArgs = { track: args.track, solo: args.solo };
                break;
            case 'play':
                toolName = 'dsl_play';
                toolArgs = {};
                break;
            case 'stop':
                toolName = 'dsl_stop';
                toolArgs = {};
                break;
            case 'list_tracks':
                toolName = 'dsl_list_tracks';
                toolArgs = {};
                break;
            case 'set_color':
            case 'track_color':
                toolName = 'dsl_track_color';
                toolArgs = { track: args.track, color: args.color };
                break;
            case 'add_fx':
            case 'add_plugin': {
                const fxName = args.fx_name || args.plugin || '';
                // VST-lisenssivalidointi: tarkista onko plugin asennettu
                const installedPlugins = getVSTPlugins();
                const fxLower = fxName.toLowerCase();
                // Sallitaan aina Reaper-pluginit (Rea*) ja JS-efektit
                const isReaPlugin = fxLower.startsWith('rea') || fxLower.startsWith('js:');
                const isInstalled = isReaPlugin || installedPlugins.some(p => {
                    const pName = (typeof p === 'string' ? p : p.name || '').toLowerCase();
                    return pName.includes(fxLower) || fxLower.includes(pName.split(' ')[0]);
                });
                if (!isInstalled && fxName.length > 0) {
                    console.log(`⚠️ VST VAROITUS: Plugin "${fxName}" ei löydy asennetuista plugineista!`);
                    return {
                        success: false,
                        error: `Plugin "${fxName}" ei ole asennettu! Käytä vain asennettuja plugineita. Ilmaiset vaihtoehdot: ReaEQ, ReaComp, ReaGate, ReaDelay, ReaVerbate, ReaLimit. Asennetut pluginit: ${installedPlugins.slice(0, 20).join(', ')}`,
                        output: `⚠️ Plugin "${fxName}" ei löydy! Tarkista asennetut pluginit.`
                    };
                }
                toolName = 'dsl_add_effect';
                // DSL tukee track-nimiä ja mappaa efektit automaattisesti
                toolArgs = {
                    track: args.track,
                    effect: fxName,
                    preset: args.preset || null
                };
                break;
            }

            // MIDI PATTERN WRAPPER
            case 'create_midi_pattern':
            case 'midi_pattern': {
                logForCursor('command', { tool: 'createMidiPattern', args });
                const midiResult = await createMidiPattern(args);
                logForCursor('result', { tool: 'createMidiPattern', success: midiResult.success, output: (midiResult.output || midiResult.error || '').substring(0, 500) });
                return midiResult;
            }

            // CHORD WRAPPER
            case 'create_chord':
            case 'add_chord': {
                logForCursor('command', { tool: 'createChord', args });
                const chordResult = await createChord(args);
                logForCursor('result', { tool: 'createChord', success: chordResult.success, output: (chordResult.output || chordResult.error || '').substring(0, 500) });
                return chordResult;
            }

            // AUDIO ANALYSIS / KUUNTELU
            case 'listen':
            case 'kuuntele':
            case 'analyze':
            case 'analysoi':
                return await analyzeCurrentMix(args);

            // PANOROINTI
            case 'track_pan':
            case 'pan':
            case 'set_pan':
            case 'panoroi':
                toolName = 'dsl_track_pan';
                // Muunna suomenkieliset arvot
                let panValue = args.pan;
                if (typeof panValue === 'string') {
                    if (panValue.toLowerCase().includes('vasen') || panValue.toLowerCase().startsWith('l')) {
                        panValue = -0.7;
                    } else if (panValue.toLowerCase().includes('oikea') || panValue.toLowerCase().startsWith('r')) {
                        panValue = 0.7;
                    } else if (panValue.toLowerCase().includes('kesk') || panValue.toLowerCase() === 'c') {
                        panValue = 0;
                    } else {
                        panValue = parseFloat(panValue) || 0;
                    }
                }
                toolArgs = { track: args.track, pan: panValue };
                break;

            // REAPER ACTION EXECUTION (Action ID:llä)
            case 'execute_action':
            case 'action':
            case 'reaper_action':
                toolName = 'execute_action';
                toolArgs = { action_id: args.action_id || args.id };
                break;

            // TRACK DELETE (Action 40005)
            case 'track_delete':
            case 'delete_track':
            case 'poista_raita':
                // Tarkista onko "all" - poista kaikki raidat
                if (args.track === 'all' || args.track === 'kaikki') {
                    // Workaround: dsl_track_delete_all bugi - poistetaan yksi kerrallaan
                    logForCursor('command', { tool: 'track_delete_all_workaround', args: {} });
                    try {
                        const listResult = await mcpClient.callTool('dsl_list_tracks', {});
                        const listOutput = listResult.content?.[0]?.text || '';
                        const trackMatch = listOutput.match(/Found (\d+) tracks/);
                        const trackCount = trackMatch ? parseInt(trackMatch[1]) : 0;
                        if (trackCount === 0) {
                            logForCursor('result', { tool: 'track_delete_all_workaround', success: true, output: 'No tracks to delete' });
                            return { success: true, output: 'No tracks to delete' };
                        }
                        let deleted = 0;
                        for (let i = 0; i < trackCount; i++) {
                            // Aina poista indeksi 0 (ensimmäinen raita) koska indeksit siirtyvät
                            const delResult = await mcpClient.callTool('dsl_track_delete', { track: 0 });
                            if (!delResult.isError) deleted++;
                        }
                        const output = `Deleted ${deleted} tracks`;
                        logForCursor('result', { tool: 'track_delete_all_workaround', success: true, output });
                        return { success: true, output };
                    } catch (e) {
                        logForCursor('result', { tool: 'track_delete_all_workaround', success: false, output: e.message });
                        return { success: false, error: e.message };
                    }
                } else {
                    toolName = 'dsl_track_delete';
                    toolArgs = { track: args.track };
                }
                break;

            // RECORD ARM
            case 'track_arm':
            case 'arm':
            case 'nauhoitus':
                toolName = 'dsl_track_arm';
                toolArgs = { track: args.track, arm: args.arm !== false };
                break;

            // UNDO
            case 'undo':
            case 'kumoa':
                toolName = 'dsl_undo';
                toolArgs = {};
                break;

            // REDO - ei DSL-työkalua, käytetään go_to
            case 'redo':
            case 'tee_uudelleen':
                return { success: false, error: 'Redo ei ole tuettu MCP:ssä. Käytä undo-komentoa.' };

            // SAVE PROJECT
            case 'save':
            case 'tallenna':
                toolName = 'dsl_save';
                toolArgs = { name: args.name || null };
                break;

            // SET TEMPO
            case 'set_tempo':
            case 'tempo':
                toolName = 'dsl_set_tempo';
                toolArgs = { bpm: args.bpm || args.tempo };
                break;

            // SET TIME SIGNATURE
            case 'set_time_signature':
            case 'time_signature':
                toolName = 'dsl_set_time_signature';
                toolArgs = { numerator: args.numerator || 4, denominator: args.denominator || 4 };
                break;

            // GET TEMPO INFO
            case 'get_tempo_info':
            case 'get_tempo':
                toolName = 'dsl_get_tempo_info';
                toolArgs = {};
                break;

            // ADJUST EFFECT PARAMETERS
            case 'adjust_effect':
            case 'adjust_fx':
            case 'set_fx_param':
                toolName = 'dsl_adjust_effect';
                toolArgs = {
                    track: args.track,
                    effect: args.effect !== undefined ? String(args.effect) : (args.fx_name || ''),
                    setting: args.setting || args.param,
                    value: args.value
                };
                break;

            // BYPASS/ENABLE EFFECT
            case 'effect_bypass':
            case 'bypass_fx':
            case 'toggle_fx':
                toolName = 'dsl_effect_bypass';
                toolArgs = {
                    track: args.track,
                    effect: args.effect || args.fx_name,
                    bypass: args.bypass !== undefined ? args.bypass : true
                };
                break;

            // MIDI INSERT (DSL native)
            case 'midi_insert':
            case 'add_notes': {
                const midiNotes = args.notes || (args.midi_data && args.midi_data.notes) || [];
                // Laske kesto nuoteista automaattisesti
                let midiTime = args.time || args.bars;
                if (!midiTime && midiNotes.length > 0) {
                    const maxEnd = Math.max(...midiNotes.map(n => (n.start || 0) + (n.duration || n.length || 1)));
                    midiTime = `${Math.ceil(maxEnd)} bars`;
                }
                toolName = 'dsl_midi_insert';
                toolArgs = {
                    track: args.track,
                    time: midiTime || '4 bars',
                    midi_data: { notes: midiNotes }
                };
                break;
            }

            // RECORD
            case 'record':
            case 'nauhoita':
                toolName = 'dsl_record';
                toolArgs = {};
                break;

            // TRACK DUPLICATE
            case 'track_duplicate':
            case 'duplicate_track':
                toolName = 'dsl_track_duplicate';
                toolArgs = { track: args.track };
                break;

            // FX INSPECTION TOOLS
            case 'list_fx':
            case 'fx_list':
            case 'show_fx':
                toolName = 'dsl_list_fx';
                toolArgs = { track: args.track };
                break;

            case 'inspect_fx':
            case 'fx_inspect':
            case 'show_fx_params':
                toolName = 'dsl_inspect_fx';
                // Huom: args.effect voi olla 0 (falsy), siksi !== undefined tarkistus
                toolArgs = { track: args.track, effect: args.effect !== undefined ? String(args.effect) : (args.fx_name || '') };
                break;

            case 'get_track_info':
            case 'track_info':
                toolName = 'dsl_get_track_info';
                toolArgs = { track: args.track };
                break;

            // CHORD PROGRESSION
            case 'chord_progression':
            case 'create_chord_progression': {
                logForCursor('command', { tool: 'chordProgression', args });
                const progResult = await createChordProgression(args);
                logForCursor('result', { tool: 'chordProgression', success: progResult.success });
                return progResult;
            }

            // MASTERING CHAIN
            case 'mastering_chain':
            case 'master': {
                logForCursor('command', { tool: 'masteringChain', args });
                const masterResult = await createMasteringChain(args);
                logForCursor('result', { tool: 'masteringChain', success: masterResult.success });
                return masterResult;
            }

            default:
                // Oletetaan että command on suoraan DSL-komento
                toolName = command;
                toolArgs = args;
        }

        console.log(`📤 MCP Tool: ${toolName}`, toolArgs);
        logForCursor('command', { tool: toolName, args: toolArgs });

        const result = await mcpClient.callTool(toolName, toolArgs);
        const output = result.content?.[0]?.text || 'OK';
        console.log(`📥 MCP Vastaus:`, output.substring(0, 200));
        logForCursor('result', { tool: toolName, success: !result.isError, output: output.substring(0, 500) });

        return { success: !result.isError, output };
    } catch (error) {
        console.error('❌ MCP virhe:', error.message);
        logForCursor('error', { tool: toolName, error: error.message });
        return { success: false, error: error.message };
    }
}

async function checkReaperHealth() {
    if (!mcpClient || !mcpClient.connected) {
        return { status: 'disconnected', connected: false, error: 'MCP ei yhdistetty' };
    }

    try {
        // Tarkista että bridge_data-kansio on olemassa
        const bridgePath = mcpClient.getBridgeDataPath();
        if (!fs.existsSync(bridgePath)) {
            return {
                status: 'bridge_not_loaded',
                connected: false,
                error: 'Lua bridge ei ole ladattu Reaperissa'
            };
        }

        // Kutsu yksinkertainen DSL-funktio testataksemme yhteyttä
        const result = await mcpClient.callTool('dsl_list_tracks', {});

        // Parsitaan vastaus
        const content = result.content?.[0]?.text || '';
        const trackCount = (content.match(/Track /g) || []).length;

        // Hae REAPER versio
        let reaperVersion = 'Unknown';
        try {
            const versionResult = await mcpClient.callTool('get_reaper_version', {});
            const versionText = versionResult.content?.[0]?.text || '';
            // Parsitaan versio tekstistä "REAPER version: 7.58/win64"
            const versionMatch = versionText.match(/version[:\s]+([^\s]+)/i);
            if (versionMatch) {
                reaperVersion = versionMatch[1];
            }
        } catch (vErr) {
            console.log('⚠️ REAPER versio ei saatavilla:', vErr.message);
        }

        return {
            status: 'healthy',
            connected: true,
            project_name: 'REAPER Project',
            track_count: trackCount,
            track_list: content, // Tallennetaan koko raitalista
            reaper_version: reaperVersion,
            tempo: 120
        };
    } catch (error) {
        return {
            status: 'error',
            connected: false,
            error: error.message
        };
    }
}

// ============================================
// DATABASE
// ============================================
const db = new sqlite3.Database('./hipare.db', (err) => {
    if (err) console.error('Tietokantavirhe:', err.message);
    else console.log('Tietokanta yhdistetty');
});

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT DEFAULT 'Uusi keskustelu',
                model TEXT DEFAULT 'llama', pinned INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id INTEGER, sender TEXT,
                content TEXT, model TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id)
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS studio_setup (
                id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY, value TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Lisää genres-sarake jos ei ole
            db.all("PRAGMA table_info(conversations)", (err, columns) => {
                if (!err && !columns.find(col => col.name === 'genres')) {
                    db.run("ALTER TABLE conversations ADD COLUMN genres TEXT DEFAULT '[]'");
                    console.log('✅ Genres-sarake lisätty conversations-tauluun');
                }
            });

            // Huolto-keskustelu
            db.get("SELECT COUNT(*) as count FROM conversations WHERE pinned = 1 AND title = 'Huolto'", (err, row) => {
                if (!err && row.count === 0) {
                    db.run("INSERT INTO conversations (title, model, pinned) VALUES ('Huolto', 'llama', 1)", () => resolve());
                } else {
                    resolve();
                }
            });
        });
    });
}

// ============================================
// SETTINGS API
// ============================================
function getSetting(key) {
    return new Promise((resolve) => {
        db.get(`SELECT value FROM app_settings WHERE key = ?`, [key], (err, row) => {
            resolve(err || !row ? null : row.value);
        });
    });
}

function saveSetting(key, value) {
    return new Promise((resolve) => {
        db.run(`INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [key, value], () => resolve());
    });
}

function getStudioSetup() {
    return new Promise((resolve) => {
        db.get(`SELECT description FROM studio_setup ORDER BY updated_at DESC LIMIT 1`, (err, row) => {
            resolve(err || !row ? '' : row.description || '');
        });
    });
}

function saveStudioSetup(description) {
    return new Promise((resolve) => {
        db.run(`DELETE FROM studio_setup`);
        db.run(`INSERT INTO studio_setup (description) VALUES (?)`, [description], () => resolve());
    });
}

// ============================================
// CACHED REAPER INFO
// ============================================
let cachedReaperInfo = { connected: false, project_name: 'N/A', track_count: 0, track_list: '', reaper_version: 'Unknown' };
let lastReaperCheck = 0;

async function getCachedReaperInfo(forceRefresh = false) {
    const now = Date.now();
    // Päivitä vain jos:
    // 1. Pakotettu refresh (komennon jälkeen)
    // 2. Cache vanhentunut (30s)
    if (forceRefresh || now - lastReaperCheck > 30000) {
        const health = await checkReaperHealth();
        cachedReaperInfo = {
            connected: health.connected || false,
            project_name: health.project_name || 'N/A',
            track_count: health.track_count || 0,
            track_list: health.track_list || '',
            reaper_version: health.reaper_version || 'Unknown',
            tempo: health.tempo || 120
        };
        lastReaperCheck = now;

        if (forceRefresh) {
            console.log('🔄 Reaper-info päivitetty (pakko-refresh)');
        }
    }
    return cachedReaperInfo;
}

// ============================================
// KNOWLEDGE LOADER
// ============================================
const KNOWLEDGE_PATH = path.join(__dirname, 'knowledge', 'knowledge');

// Genre mappings - KAIKKI GENRET KÄYTÖSSÄ
const GENRE_FILES = {
    'metal': 'genres/metal.md',
    'rock': 'genres/rock.md',
    'electronic': 'genres/electronic.md',
    'hiphop': 'genres/hiphop-rap.md',
    'pop': 'genres/pop.md',
    'jazz': 'genres/jazz.md',
    'orchestral': 'genres/orchestral.md',
    'orchestra': 'genres/orchestral.md', // alias
    'blues': 'genres/blues.md'
};

// Artist sound files (loaded dynamically when artist/band is mentioned)
const ARTIST_FILES = {
    'mapping': 'artists/band-member-mapping.md',
    'guitarists-1': 'artists/guitarists-part1.md',
    'guitarists-2': 'artists/guitarists-part2.md',
    'bassists': 'artists/bassists.md',
    'drummers': 'artists/drummers.md',
    'keyboardists': 'artists/keyboardists.md',
    'vocalists': 'artists/vocalists.md',
    'bands': 'artists/bands-production.md'
};

// Core files (always loaded)
const CORE_FILES = [
    'core/compression-guide.md',
    'core/eq-guide.md',
    'core/mastering-basics.md',
    'core/reverb-delay.md',
    'core/signal-chain.md',
    'reaper/dsl-commands.md',
    'plugins/free-essentials.md'
];

// Workflow & topic knowledge files - loaded dynamically based on user message
const WORKFLOW_FILES = {
    'recording-guide': {
        file: 'reaper/recording-guide.md',
        keywords: ['äänit', 'äänittä', 'äänitys', 'äänitetään', 'nauhoita', 'nauhoitta', 'nauhoitus', 'nauhoittaa', 'record', 'recording', 'latenssi', 'latency', 'monitoroi', 'monitorointi', 'monitoring', 'buffer', 'puskuri', 'asio', 'di signaali', 'di-signaali', 'di box', 'input', 'mikrofoni', 'mikki', 'hi-z', 'phantom', 'gain staging', 'headphone', 'kuuloke', 'laulaa', 'soittaa']
    },
    'stem-separation': {
        file: 'workflows/stem-separation.md',
        keywords: ['stem', 'erottelu', 'erottele', 'erota', 'separate', 'separation', 'demucs', 'spleeter', 'laulu erilleen', 'rummut erilleen', 'basso erilleen', 'vokaali erilleen', 'instrumentti erilleen']
    },
    'podcast-production': {
        file: 'workflows/podcast-production.md',
        keywords: ['podcast', 'podcastin', 'podcasti', 'puheohjelma', 'puhe-äänite', 'haastattelu', 'keskusteluohjelma']
    },
    'audio-restoration': {
        file: 'workflows/audio-restoration.md',
        keywords: ['restaurointi', 'restauroi', 'puhdista', 'kohina', 'häiriö', 'napsahdus', 'hurina', 'restoration', 'noise removal', 'noise reduction', 'denoise', 'declip']
    },
    'video-film-audio': {
        file: 'workflows/video-film-audio.md',
        keywords: ['video', 'elokuva', 'filmi', 'surround', '5.1', '7.1', 'dialogi', 'adr', 'foley', 'synkronointi', 'film audio']
    },
    'sample-creation': {
        file: 'workflows/sample-creation.md',
        keywords: ['sample', 'samplet', 'sample pack', 'näyte', 'näytteet', 'one-shot', 'loop', 'sampleja', 'resampling']
    },
    'reamping': {
        file: 'workflows/reamping.md',
        keywords: ['reamp', 'reamping', 're-amp', 'di-signaali', 'di signaali', 'uudelleenvahvist']
    },
    'live-recording': {
        file: 'workflows/live-recording.md',
        keywords: ['live', 'keikka', 'konsertti', 'livemiksaus', 'live-äänitys', 'livetallennus', 'monikanavatall']
    },
    'loudness-delivery': {
        file: 'workflows/loudness-delivery.md',
        keywords: ['loudness', 'lufs', 'äänekkyys', 'true peak', 'normalisointi', 'spotify', 'julkaisu', 'master', 'delivery', 'toimitus', 'render']
    }
};

// Studio Setup Knowledge Files - loaded when recording is mentioned
const STUDIO_SETUP_FILES = {
    'audio-interfaces': {
        file: 'studio-setup/audio-interfaces.md',
        keywords: ['interface', 'audio interface', 'scarlett', 'focusrite', 'presonus', 'behringer', 'motu', 'ssl', 'umc', 'audiobox', 'gain', 'buffer', 'asio', 'latenssi']
    },
    'guitars': {
        file: 'studio-setup/guitars.md',
        keywords: ['kitara', 'guitar', 'strat', 'tele', 'les paul', 'sg', 'ibanez', 'jackson', 'agile', '7-kielinen', '8-kielinen', '7-string', '8-string', 'humbucker', 'single coil', 'emg', 'active', 'passive', 'pickup', 'mikki']
    },
    'bass': {
        file: 'studio-setup/bass.md',
        keywords: ['basso', 'bass', 'p-bass', 'j-bass', 'precision', 'jazz bass', 'stingray', '5-kielinen', '6-kielinen']
    },
    'keyboards': {
        file: 'studio-setup/keyboards.md',
        keywords: ['kosketin', 'keyboard', 'piano', 'synth', 'synthesizer', 'midi controller', 'keys', 'syntetisaattori']
    },
    'microphones': {
        file: 'studio-setup/microphones.md',
        keywords: ['mikrofoni', 'mikki', 'microphone', 'mic', 'sm57', 'sm58', 'sm7b', 'at2020', 'rode', 'condenser', 'dynamic', 'ribbon', 'phantom', '48v', 'laulu', 'vocal']
    },
    'recording-ai-guide': {
        file: 'studio-setup/recording-ai-guide.md',
        keywords: ['äänit', 'äänittä', 'äänitys', 'nauhoita', 'nauhoitta', 'nauhoitus', 'record', 'recording']
    }
};

/**
 * Lataa studio setup knowledge käyttäjän viestin ja studio setupin perusteella
 * @param {string} userMessage - Käyttäjän viesti
 * @param {string} studioSetup - Käyttäjän tallennettu studio setup
 * @returns {string} - Studio setup knowledge sisältö
 */
function loadStudioSetupKnowledge(userMessage, studioSetup = '') {
    let setupContent = '';
    if (!userMessage) return setupContent;

    const messageLower = userMessage.toLowerCase();
    const setupLower = (studioSetup || '').toLowerCase();
    const combinedText = messageLower + ' ' + setupLower;
    const loadedFiles = [];

    // Tarkista onko äänitys-aihe
    const recordingKeywords = ['äänit', 'äänittä', 'äänitys', 'nauhoita', 'nauhoitta', 'nauhoitus', 'record', 'recording', 'rec'];
    const isRecordingTopic = recordingKeywords.some(kw => messageLower.includes(kw));

    for (const [name, config] of Object.entries(STUDIO_SETUP_FILES)) {
        // Lataa jos käyttäjän viesti tai studio setup sisältää avainsanan
        const matchesMessage = config.keywords.some(kw => messageLower.includes(kw));
        const matchesSetup = config.keywords.some(kw => setupLower.includes(kw));

        // Lataa AI guide aina kun äänitys-aihe
        const isAiGuide = name === 'recording-ai-guide';

        if (matchesMessage || (matchesSetup && isRecordingTopic) || (isAiGuide && isRecordingTopic)) {
            try {
                const filePath = path.join(KNOWLEDGE_PATH, config.file);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    setupContent += `\n\n=== STUDIO SETUP: ${name.toUpperCase().replace(/-/g, ' ')} ===\n${content}`;
                    loadedFiles.push(name);
                }
            } catch (e) {
                console.error(`❌ Studio setup ${name} lataus epäonnistui:`, e.message);
            }
        }
    }

    if (loadedFiles.length > 0) {
        console.log(`🎛️ Studio setup knowledge ladattu: ${loadedFiles.join(', ')}`);
    }

    return setupContent;
}

/**
 * Lataa workflow knowledge käyttäjän viestin perusteella
 * @param {string} userMessage - Käyttäjän viesti
 * @returns {string} - Workflow knowledge sisältö
 */
function loadWorkflowKnowledge(userMessage) {
    let workflowContent = '';
    if (!userMessage) return workflowContent;

    const messageLower = userMessage.toLowerCase();
    const loadedWorkflows = [];

    for (const [name, config] of Object.entries(WORKFLOW_FILES)) {
        const matches = config.keywords.some(kw => messageLower.includes(kw));
        if (matches) {
            try {
                const filePath = path.join(KNOWLEDGE_PATH, config.file);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    workflowContent += `\n\n=== WORKFLOW: ${name.toUpperCase().replace(/-/g, ' ')} ===\n${content}`;
                    loadedWorkflows.push(name);
                }
            } catch (e) {
                console.error(`❌ Workflow ${name} lataus epäonnistui:`, e.message);
            }
        }
    }

    if (loadedWorkflows.length > 0) {
        console.log(`📋 Workflow knowledge ladattu: ${loadedWorkflows.join(', ')}`);
    }

    return workflowContent;
}

/**
 * Lataa artistin/bändin soundit käyttäjän viestin perusteella
 * OPTIMOITU: Lataa vain relevantin artistin osio, ei koko tiedostoa
 * @param {string} userMessage - Käyttäjän viesti
 * @returns {string} - Artist knowledge -sisältö (max 3000 merkkiä)
 */
function loadArtistKnowledge(userMessage) {
    let artistContent = '';

    try {
        const messageLower = userMessage.toLowerCase();

        // Artistinimet ja niitä vastaavat tiedostot
        const artistMap = {
            // Kitaristit
            'meshuggah': { files: ['guitarists-2'], search: 'Meshuggah' },
            'thordendal': { files: ['guitarists-2'], search: 'Thordendal' },
            'hagström': { files: ['guitarists-2'], search: 'Hagström' },
            'tool': { files: ['guitarists-2'], search: 'Adam Jones' },
            'adam jones': { files: ['guitarists-2'], search: 'Adam Jones' },
            'dimebag': { files: ['guitarists-2'], search: 'Dimebag' },
            'petrucci': { files: ['guitarists-2'], search: 'Petrucci' },
            'gilmour': { files: ['guitarists-1'], search: 'Gilmour' },
            'hendrix': { files: ['guitarists-1'], search: 'Hendrix' },
            'edge': { files: ['guitarists-1'], search: 'Edge' },
            'u2': { files: ['guitarists-1'], search: 'Edge' },
            'van halen': { files: ['guitarists-1'], search: 'Van Halen' },
            'morello': { files: ['guitarists-1'], search: 'Morello' },
            'slash': { files: ['guitarists-1'], search: 'Slash' },
            'cobain': { files: ['guitarists-1'], search: 'Cobain' },
            'iommi': { files: ['guitarists-1'], search: 'Iommi' },
            // Basistit
            'flea': { files: ['bassists'], search: 'Flea' },
            'geddy': { files: ['bassists'], search: 'Geddy' },
            'chancellor': { files: ['bassists'], search: 'Chancellor' },
            'cliff burton': { files: ['bassists'], search: 'Burton' },
            // Rumpalit
            'bonham': { files: ['drummers'], search: 'Bonham' },
            'haake': { files: ['drummers'], search: 'Haake' },
            'peart': { files: ['drummers'], search: 'Peart' },
            'grohl': { files: ['drummers'], search: 'Grohl' },
            'danny carey': { files: ['drummers'], search: 'Carey' },
            // Laulajat
            'billie eilish': { files: ['vocalists'], search: 'Billie' },
            'adele': { files: ['vocalists'], search: 'Adele' },
            'thom yorke': { files: ['vocalists'], search: 'Yorke' },
            'björk': { files: ['vocalists'], search: 'Björk' }
        };

        // Etsi mainittu artisti
        let foundArtist = null;
        for (const [artistKey, config] of Object.entries(artistMap)) {
            if (messageLower.includes(artistKey)) {
                foundArtist = { key: artistKey, ...config };
                break;
            }
        }

        // Jos artisti löytyi, lataa vain relevantti osio
        if (foundArtist) {
            for (const fileKey of foundArtist.files) {
                const filePath = path.join(KNOWLEDGE_PATH, ARTIST_FILES[fileKey]);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');

                    // Etsi artistin osio (alkaa ## Nimi ja päättyy seuraavaan ## tai ----)
                    const searchRegex = new RegExp(
                        `## .*${foundArtist.search}[\\s\\S]*?(?=\\n## |\\n----|$)`, 'i'
                    );
                    const match = content.match(searchRegex);

                    if (match) {
                        artistContent = match[0].substring(0, 2500); // Max 2500 merkkiä per artisti
                        console.log(`🎸 Artist knowledge: ${foundArtist.key} (${artistContent.length} merkkiä)`);
                    }
                }
            }
        }

        // Jos ei artistia mutta instrumentti mainitaan, lataa lyhyt ohje
        if (!artistContent) {
            if (messageLower.match(/\b(kitara|guitar)/)) {
                artistContent = `KITARA-EFEKTIT: Käytä ReaEQ taajuuksiin, ReaComp dynamiikkaan. Säröön tarvitset amp-simu (esim. Ignite Emissary).`;
            } else if (messageLower.match(/\b(basso|bass)/)) {
                artistContent = `BASSO-EFEKTIT: ReaEQ (nosta 80-100Hz, leikkaa 200-300Hz mutaa), ReaComp (ratio 4:1, slow attack).`;
            } else if (messageLower.match(/\b(rummu|drum)/)) {
                artistContent = `RUMMUT-EFEKTIT: ReaEQ (kick 60-80Hz boost, snare 200Hz cut), ReaComp per raita, ReaVerbate huonekaikuun.`;
            } else if (messageLower.match(/\b(laulu|vocal)/)) {
                artistContent = `LAULU-EFEKTIT: ReaEQ (HPF 80Hz, presence 3-5kHz), ReaComp (ratio 3:1, attack 10-30ms), ReaVerbate (plate).`;
            }
        }

    } catch (error) {
        console.error('❌ Artist knowledge -lataus epäonnistui:', error.message);
    }

    return artistContent;
}

/**
 * DEPRECATED: Vanha funktio joka latasi kaikki tiedostot
 */
function loadArtistKnowledgeFull_DISABLED(userMessage) {
    let artistContent = '';

    try {
        const messageLower = userMessage.toLowerCase();
        const loadFiles = new Set();

        // Tarkista instrumentti-avainsanat (hyväksyy taivutusmuodot)
        if (messageLower.match(/\b(kitara|guitar|riff|soolo|solo)/)) {
            loadFiles.add('mapping');
            loadFiles.add('guitarists-1');
            loadFiles.add('guitarists-2');
        }
        if (messageLower.match(/\b(basso|bass)/)) {
            loadFiles.add('mapping');
            loadFiles.add('bassists');
        }
        if (messageLower.match(/\b(rummu|drum)/)) {
            loadFiles.add('mapping');
            loadFiles.add('drummers');
        }
        if (messageLower.match(/\b(laulu|vocal|voice|ääni)/)) {
            loadFiles.add('mapping');
            loadFiles.add('vocalists');
        }
        if (messageLower.match(/\b(kosketin|key|keyboard|piano|synth)/)) {
            loadFiles.add('mapping');
            loadFiles.add('keyboardists');
        }

        // Lataa valitut tiedostot
        if (loadFiles.size > 0) {
            loadFiles.forEach(fileKey => {
                const filePath = path.join(KNOWLEDGE_PATH, ARTIST_FILES[fileKey]);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    artistContent += `\n\n=== ARTIST KNOWLEDGE: ${fileKey.toUpperCase()} ===\n${content}`;
                }
            });

            console.log(`🎸 Artist knowledge ladattu: ${Array.from(loadFiles).join(', ')}`);
        }

    } catch (error) {
        console.error('❌ Artist knowledge -lataus epäonnistui:', error.message);
    }

    return artistContent;
}

/**
 * Lataa knowledge-tiedostot genrejen perusteella
 * @param {string[]} genres - Lista genrejä (esim. ['metal', 'rock'])
 * @returns {string} - Knowledge-sisältö
 */
function loadKnowledge(genres = []) {
    let knowledgeContent = '';

    try {
        // 1. Lataa aina core-tiedostot
        CORE_FILES.forEach(file => {
            const filePath = path.join(KNOWLEDGE_PATH, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                knowledgeContent += `\n\n=== ${path.basename(file, '.md').toUpperCase()} ===\n${content}`;
            }
        });

        // 2. Lataa valitut genre-tiedostot
        if (genres && genres.length > 0) {
            genres.forEach(genre => {
                const genreFile = GENRE_FILES[genre.toLowerCase()];
                if (genreFile) {
                    const filePath = path.join(KNOWLEDGE_PATH, genreFile);
                    if (fs.existsSync(filePath)) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        knowledgeContent += `\n\n=== GENRE: ${genre.toUpperCase()} ===\n${content}`;
                    }
                }
            });
        }

        console.log(`📚 Knowledge ladattu: core + ${genres.length} genreä (${genres.join(', ')})`);
    } catch (error) {
        console.error('❌ Knowledge-lataus epäonnistui:', error.message);
    }

    return knowledgeContent;
}

// ============================================
// SYSTEM PROMPT - Yksinkertaistettu!
// ============================================
async function buildMusicSystemPrompt(genres = [], userMessage = '') {
    const vstPlugins = getVSTPlugins();
    const vstCategories = getVSTCategories(vstPlugins);
    const reaperInfo = await getCachedReaperInfo();
    const studioSetup = await getStudioSetup();
    const knowledge = loadKnowledge(genres); // Lataa knowledge genrejen mukaan
    const artistKnowledge = loadArtistKnowledge(userMessage); // Lataa artist knowledge käyttäjän viestin perusteella
    const workflowKnowledge = loadWorkflowKnowledge(userMessage); // Lataa workflow knowledge käyttäjän viestin perusteella
    const studioSetupKnowledge = loadStudioSetupKnowledge(userMessage, studioSetup); // Lataa studio setup knowledge

    let prompt = `Olet kokenut studio- ja ääniasiantuntija. Vastaat suomeksi LYHYESTI ja ASIANTUNTEVASTI.
KRIITTINEN: Älä KOSKAAN näytä komentoja, koodia tai JSON:ia käyttäjälle vastauksessasi!
Kirjoita message-kenttään AINA luonnollista kieltä jossa kerrot mitä teit ja miksi.
Puhu kuin kokenut studion tuottaja, äläkä kuin ohjelmoija.
ESIM: "Loin jazz-kitararaidan lämpimällä soundilla - ReaEQ leikkaa korkeat taajuudet pehmeämmäksi ja reverb luo tilantuntua." EI: "Komento: add_fx Args: {}"

=== KNOWLEDGE BASE ===
${knowledge}
${artistKnowledge}
${workflowKnowledge}
${studioSetupKnowledge}

=== ARTIST/BAND SOUNDS OHJE ===
Kun käyttäjä pyytää artistin tai bändin soundia:
1. Tarkista BAND-MEMBER-MAPPING löytääksesi bändin jäsenet
2. Lue kyseisen instrumentin ohje (esim. Fredrik Thordendal → guitarists)
3. LISÄÄ KAIKKI efektit "Free VST Chain" -osiosta JÄRJESTYKSESSÄ
4. SÄÄDÄ jokaisen efektin parametrit adjust_effect -komennolla

KRIITTINEN: Artist-soundit vaativat USEITA komentoja peräkkäin!

=== METALLIKITARAN OIKEA EFEKTIJÄRJESTYS ===
JÄRJESTYS ON KRIITTINEN! Väärä järjestys = kamala soundi.

OIKEA: ReaGate → TSE_808_2.0_x64 → Emissary → NadIR → ReaEQ → ReaComp
VÄÄRÄ: TSE 808 → NadIR → Emissary (NadIR PITÄÄ olla ampin JÄLKEEN!)
VÄÄRÄ: Emissary → ReaGate (Gate PITÄÄ olla ENNEN amppia!)
KRIITTINEN: NadIR (cabinet IR) on PAKOLLINEN amp-simulaattorin kanssa! Ilman cabia amppi kuulostaa kamalalta!
KRIITTINEN: Käytä AMP-SIMULAATTOREITA (Emissary, bx_rockrack, bx_megadual, Diezel jne.) AINA NadIR:n kanssa!

Esimerkki "Meshuggah kitarasoundi":

Komento: create_track
Args: { "name": "Kitara", "role": "guitar" }
Komento: add_fx
Args: { "track": "Kitara", "fx_name": "ReaGate" }
Komento: add_fx
Args: { "track": "Kitara", "fx_name": "TSE_808_2.0_x64" }
Komento: add_fx
Args: { "track": "Kitara", "fx_name": "Emissary" }
Komento: add_fx
Args: { "track": "Kitara", "fx_name": "NadIR" }
Komento: add_fx
Args: { "track": "Kitara", "fx_name": "ReaEQ" }
Komento: add_fx
Args: { "track": "Kitara", "fx_name": "ReaComp" }
Komento: adjust_effect
Args: { "track": "Kitara", "effect": "ReaGate", "setting": "Threshold", "value": 0.15 }
Komento: adjust_effect
Args: { "track": "Kitara", "effect": "TSE 808", "setting": "Drive", "value": 0.15 }
Komento: adjust_effect
Args: { "track": "Kitara", "effect": "TSE 808", "setting": "Volume", "value": 0.70 }
Komento: adjust_effect
Args: { "track": "Kitara", "effect": "Emissary", "setting": "LeadGain", "value": 0.35 }
Komento: adjust_effect
Args: { "track": "Kitara", "effect": "ReaEQ", "setting": "Freq-High Pass 5", "value": 0.20 }
Lisäsin Meshuggah-soundin oikeassa järjestyksessä!

=== GENREKOHTAISET EFEKTIKETJUT ===
METALLI/RASKAS ROCK: ReaGate → TSE_808_2.0_x64 → [Amp: Emissary/bx_megadual/Diezel_Herbert/Friedman_BE100] → NadIR → ReaEQ → ReaComp
JAZZ-KITARA: ReaEQ (leikkaa korkeat) → ReaComp (kevyt) → ReaVerbate (lämmin kaiku)
PUHDAS ROCK: [Amp: bx_rockrack_V3/Fuchs_Overdrive_Supreme_50] → NadIR → ReaEQ → ReaComp → ReaDelay (send)
POP-KITARA: ReaEQ → ReaComp → ReaVerbate → ReaDelay
AMBIENT: ReaEQ → ReaComp → ValhallaSupermassive_x64 → ReaDelay

=== METALLITONEEN KULTAISET SÄÄNNÖT ===
1. VÄHEMMÄN GAINIA kuin luulet tarvitsevasi! Gain 30-45% riittää.
2. TSE 808 Drive MATALA (0-15%) - se tuo tightnessä, EI lisä-distortiota
3. NadIR/Cabinet IR AINA ampin JÄLKEEN - ilman cabia amppi kuulostaa kamalalta
4. Gate ENNEN amppia - leikkaa kohinan ennen vahvistusta
5. Post-cab EQ: Leikkaa alle 80Hz ja yli 10kHz - poista fizz ja rumble
6. Liikaa gainia = moottorisaha/fizzy/buzzy soundi → LASKE gainia!

=== REAGATE OIKEAT ARVOT ===
KRIITTINEN: ReaGaten Threshold PITÄÄ olla MATALA! Oletusarvo on liian korkea!
- Threshold: 0.05-0.15 (EI KOSKAAN yli 0.3! Se estää kaiken äänen!)
- Hold: 0.02
- Release: 0.05
- Attack: 0.01
Jos käyttäjä valittaa ettei ääntä kuulu → tarkista ReaGate Threshold ENSIN!

=== EFEKTIEN OLETUSARVOT GENREITTÄIN ===
AINA kun lisäät efektejä, SÄÄDÄ arvot genreen sopiviksi. Tässä suuntaa-antavat:

ReaEQ jazz/pop (pehmeä):
- Gain-Band 2: 0.35 (leikkaa korkeat pehmeäksi)
- Freq-Band 2: 0.15 (matalat korostettu)

ReaEQ metal (aggressiivinen):
- Freq-High Pass 5: 0.20 (leikkaa rumble)
- Gain-Band 3: 0.45 (presence boost)

ReaComp (kevyt, jazz/pop): Ratio 0.15-0.25, Thresh 0.4-0.5
ReaComp (heavy, metal/rock): Ratio 0.4-0.6, Thresh 0.35-0.45

ReaVerbate (jazz/ambient): Mix 0.2-0.35, Room Size 0.5-0.7
ReaVerbate (rock/pop): Mix 0.1-0.2, Room Size 0.3-0.5

=== AUDIO-ANALYYSIN HYÖDYNTÄMINEN ===
Kun sinulla on käytössäsi raita äänitetyllä materiaalilla:
1. Käytä analyze/kuuntele-komentoa WAV-tiedostolle tai renderöidylle miksaukselle
2. Analysoi taajuusjakauma: Jos sub-bass >30% → leikkaa EQ:lla, jos highs <10% → nosta
3. Analysoi tasot: Jos peak >-3dB → lisää kompressoria, jos RMS <-25dB → nosta tasoa
4. Tee KONKREETTISIA säätöjä analyysin perusteella - älä vain kerro mitä pitäisi tehdä!

=== TUTKI ENNEN KUIN TOIMIT ===
KRIITTINEN SÄÄNTÖ: Kun käyttäjä pyytää muutoksia OLEMASSA OLEVAAN raitaan:
1. Käytä ENSIN list_fx-komentoa nähdäksesi mitä efektejä raidalla JO ON
2. Käytä inspect_fx-komentoa tutkiaksesi miten kukin efekti on säädetty
3. ÄLKÄ lisää samoja efektejä uudestaan (esim. toinen ReaEQ jos sellainen on jo)
4. Jos efekti on jo raidalla, SÄÄDÄ sitä adjust_effect-komennolla
5. Lisää vain PUUTTUVAT efektit

ESIMERKKI OIKEA TAPA:
Käyttäjä: "Paranna kitarasoundia"
1. ENSIN: list_fx { track: "Kitara" } → näet mitä on
2. SITTEN: inspect_fx { track: "Kitara", effect: "ReaEQ" } → näet parametrit
3. ARVIOI: mitä puuttuu ja mitä pitää säätää
4. VASTA SITTEN: Tee muutokset (säädä olemassa olevia TAI lisää puuttuvia)

VÄÄRÄ TAPA: Lisätä heti 4 efektiä ilman tarkistusta!

=== EFEKTIEN ARVOJEN SÄÄTÖ ===
KRIITTINEN: Kun lisäät efektejä add_fx:llä, SÄÄDÄ AINA niiden arvot adjust_effect:llä SAMASSA vastauksessa!
ÄLÄ KOSKAAN jätä efektejä oletusarvoihin - oletusarvot eivät sovi mihinkään genreen.

ESIMERKKI: Jazz-kitara
Komento: create_track
Args: { "name": "Jazz Guitar", "role": "guitar" }
Komento: add_fx
Args: { "track": "Jazz Guitar", "fx_name": "ReaEQ" }
Komento: add_fx
Args: { "track": "Jazz Guitar", "fx_name": "ReaComp" }
Komento: add_fx
Args: { "track": "Jazz Guitar", "fx_name": "ReaVerbate" }
Komento: adjust_effect
Args: { "track": "Jazz Guitar", "effect": "ReaEQ", "setting": "Freq-Band 2", "value": 0.15 }
Komento: adjust_effect
Args: { "track": "Jazz Guitar", "effect": "ReaEQ", "setting": "Gain-Band 2", "value": 0.35 }
Komento: adjust_effect
Args: { "track": "Jazz Guitar", "effect": "ReaComp", "setting": "Ratio", "value": 0.2 }
Komento: adjust_effect
Args: { "track": "Jazz Guitar", "effect": "ReaComp", "setting": "Thresh", "value": 0.45 }
Komento: adjust_effect
Args: { "track": "Jazz Guitar", "effect": "ReaVerbate", "setting": "Mix", "value": 0.25 }
Komento: adjust_effect
Args: { "track": "Jazz Guitar", "effect": "ReaVerbate", "setting": "Room Size", "value": 0.6 }

Huomaa: Jokaiselle efektille USEAMPI adjust_effect kutsu eri parametreille!

=== VST-LISENSSIVAROITUS ===
EHDOTON SÄÄNTÖ: Lisää VAIN plugineita jotka löytyvät alla olevasta VST-listasta!
ÄLÄ KOSKAAN lisää plugineita joita käyttäjällä ei ole (esim. maksullisia plugineita kuten FabFilter, Waves, Amplitube).
Jos haluttu efekti vaatii pluginia jota ei ole listassa:
1. Kerro käyttäjälle mitä pluginia tarvittaisiin
2. Ehdota ILMAISTA vaihtoehtoa joka ON listassa (esim. ReaEQ, ReaComp, ReaGate)
3. ÄLÄ lisää pluginia jota ei ole asennettu!

HUOM: Käytettävissä olevat ilmaiset Reaper-pluginit: ReaEQ, ReaComp, ReaGate, ReaDelay, ReaVerbate, ReaLimit, ReaXcomp, ReaPitch, JS-efektit

=== USEAMMAN KOMENNON SUORITUS ===
Kun käyttäjä pyytää toimintoa joka vaatii useita vaiheita (esim. efektiketju, MIDI + VST):
- Kirjoita KAIKKI komennot peräkkäin
- ÄLÄ kysy vahvistusta - tee suoraan!
- Lopuksi kirjoita lyhyt yhteenveto

=== ROOLI ===

=== KRIITTINEN SAANTO ===
JOS kayttaja pyytaa MITA TAHANSA Reaper-toimintoa, SINUN TAYTYY kirjoittaa:

Komento: <komento>
Args: { <argumentit> }

ILMAN KOMENTORIVEJA ET SAA VASTATA! Jos et loyda sopivaa komentoa, kysy tarkennusta.

=== ESIMERKIT (KOPIOI TARKASTI) ===

Kayttaja: "Luo uusi raita nimelta basso"
Sina:
Komento: create_track
Args: { name: "basso", role: "bass" }

Kayttaja: "Vaihda raidan nimi bassoksi"
Sina:
Komento: rename_track
Args: { track: 0, name: "bassoraita" }

Kayttaja: "Aloita toisto"
Sina:
Komento: play
Args: {}

Kayttaja: "Listaa kaikki raidat"
Sina:
Komento: list_tracks
Args: {}

Kayttaja: "Varita bassoraita punaiseksi"
Sina:
Komento: set_color
Args: { track: 0, color: "red" }

Kayttaja: "Lisaa bassolle kompressori"
Sina:
Komento: add_fx
Args: { track: 0, fx_name: "ReaComp" }

Kayttaja: "Lisää kitaralle TSE808, Emissary ja ReaEQ"
Sina:
Komento: add_fx
Args: { track: "kitara", fx_name: "TSE808" }

Komento: add_fx
Args: { track: "kitara", fx_name: "Ignite Emissary" }

Komento: add_fx
Args: { track: "kitara", fx_name: "ReaEQ" }
Lisäsin 3 efektiä kitaraan: TSE808 → Emissary → ReaEQ

Kayttaja: "Säädä kitaran ReaEQ:n high-pass 80 Hz:iin"
Sina (ENSIN tutki parametrit, SITTEN säädä):
Komento: inspect_fx
Args: { "track": "kitara", "effect": "ReaEQ" }

Komento: adjust_effect
Args: { "track": "kitara", "effect": "ReaEQ", "setting": "Freq-High Pass 5", "value": 0.20 }
Tutkin ReaEQ:n parametrit ja säädin High Passin.
HUOM: "setting" PITÄÄ olla TARKKA nimi inspect_fx:stä (esim. "Freq-High Pass 5", EI "frequency")

Kayttaja: "Luo Piano-raita ja lisää siihen C-duuri sointu"
Sina:
Komento: create_track
Args: { name: "Piano", role: "keys" }

Komento: create_chord
Args: { track: "Piano", chord: "C", start: 0, duration: 4 }
Loin pianon C-duuri soinnulla! Haluatko lisata muita sointuja?

Kayttaja: "Lisää pianon raitaan C4 nuotti"
Sina:
Komento: create_midi_pattern
Args: { track: "Piano", note: "C4", duration: 1 }

Kayttaja: "Tee rumpukomppi"
Sina (HUOM: Tarkista ENSIN onko kayttajalla rumpu-VST. Jos on, lisaa se add_fx:lla):
Komento: create_track
Args: { name: "Rummut", role: "drums" }

Komento: add_fx
Args: { track: "Rummut", fx_name: "MT Power Drum Kit" }

Komento: create_midi_pattern
Args: { track: "Rummut", pattern: "basic_rock" }
Loin rumpuraidan rock-kompilla! Jos ei kuulu aanta, tarvitset rumpu-VST:n (MT Power Drum Kit: powerdrumkit.com tai Steven Slate Drums Free: stevenslatedrums.com/ssd5free).

Kayttaja: "Soita jotain pianolla" (epamaara pyynto)
Sina (KYSY tarkentavia kysymyksia, ALA luo tyhjaa raitaa):
Millaisen pianon haluaisit? Kerro tyyli (jazz, pop, klassinen), sointukierto ja tempo. Voin ehdottaa genreen sopivan sointukierron!

Kayttaja: "Kuuntele miltä tämä kuulostaa" TAI "Analysoi miksaus"
Sina:
Komento: kuuntele
Args: { target: "project" }

Kayttaja: "Panoroi kitara vasemmalle"
Sina:
Komento: track_pan
Args: { track: "kitara", pan: -0.7 }

Kayttaja: "Vaihda tahtilaji 5/4"
Sina:
Komento: set_time_signature
Args: { "numerator": 5, "denominator": 4 }
Vaihdoin tahtilajin 5/4-osaiseksi.

Kayttaja: "Aseta tahtilaji 6/8"
Sina:
Komento: set_time_signature
Args: { "numerator": 6, "denominator": 8 }
Tahtilaji on nyt 6/8.

Kayttaja: "Aseta tempo 140 ja tahtilaji 3/4"
Sina:
Komento: set_tempo
Args: { "bpm": 140 }
Komento: set_time_signature
Args: { "numerator": 3, "denominator": 4 }
Asetin tempon 140 BPM ja tahtilajin 3/4.

Kayttaja: "Mikä on nykyinen tempo?"
Sina:
Komento: get_tempo_info
Args: {}

=== HUOM ===
- Jos kayttaja kysyy jotain (ei pyynto), vastaa normaalisti ILMAN komentoa
- Jos kayttaja pyytaa toimintoa, PAKKO kirjoittaa Komento + Args
- SEN JALKEEN voi lisata lyhyen tekstin ("Tehty!")

=== KRIITTINEN: TEMPO JA TAHTILAJI ===
EHDOTON SÄÄNTÖ: Kun käyttäjä pyytää muuttamaan tempoa tai tahtilajia, SINUN TÄYTYY AINA kirjoittaa komento!
- Tempo: Komento: set_tempo + Args: { "bpm": X }
- Tahtilaji: Komento: set_time_signature + Args: { "numerator": X, "denominator": Y }
- ÄLÄ KOSKAAN sano "Muutin tahtilajin" tai "Asetin tempon" ILMAN komentoriviä! Se on VALEHTELUA!
- Ilman komentoa REAPER EI TEE MITÄÄN. Pelkkä teksti EI muuta tempoa tai tahtilajia!

=== KRIITTISET RUMPUSAANNOT ===
- Rummut = AINA create_track + create_midi_pattern (preset: basic_rock/metal/funk/jazz) + add_fx (rumpu-VST)
- ENSIN katso *** RUMPU-VST:T *** -osio yllaolevasta VST-listasta!
  → Jos rumpu-VST LOYTYY (esim. MT Power Drum Kit, SSD Free): lisaa se add_fx:lla raidalle
  → Jos RUMPU-VST:T -osiossa lukee "EI ASENNETTUNA": KERRO kayttajalle ENSIMMAISEKSI etta
    rumpu-VST puuttuu ja ilman sita MIDI-rummut eivat kuulu! Suosittele:
    • MT Power Drum Kit: https://www.powerdrumkit.com/ (ilmainen, monipuolinen)
    • Steven Slate Drums Free: https://stevenslatedrums.com/ssd5free/ (erinomainen metalliin)
    Anna asennusohjeet: lataa → kopioi C:\Program Files\VSTPlugins\ → REAPER Re-scan
    Luo silti raita + MIDI-pattern valmiiksi!
- ALA KOSKAAN luo rumpuraitaa ilman create_midi_pattern -komentoa!

=== KRIITTISET PIANOSAANNOT ===
- Piano/soinnut = AINA create_track + create_chord (tai create_midi_pattern nuoteilla)
- ALA KOSKAAN luo tyhjaa pianoraitaa ilman nuotteja!
- Katso *** INSTRUMENTTI-VST:T *** -osio yllaolevasta VST-listasta!
  → Jos piano/synth-VST loytyy: lisaa se add_fx:lla
  → Jos instrumenttipluginia EI OLE: kayta ReaSynth tai kerro kayttajalle:
    • LABS (labs.spitfireaudio.com) - ilmainen piano/orkesteri
    • Vital (vital.audio) - ilmainen syntetisaattori
    • Keyzone Classic - ilmainen piano
- Jos kayttaja ei kerro mita sointuja haluaa, KYSY tarkentavia kysymyksia (genre, sointukierto, tempo)
- Tuetut soinnut: Cmaj, Cm, C7, Cmaj7, Cm7, Cdim, Caug, Csus2, Csus4 (kaikki savellajit)

=== TUETUT KOMENNOT ===
- create_track: Luo raita (Args: name, role) - role: bass, drums, keys, guitar, vocals, generic
- track_delete: Poista raita (Args: track) - track: "nimi" tai "all" (kaikki)
- rename_track: Nimeä raita (Args: track, name)
- set_volume: Äänenvoimakkuus (Args: track, volume) - volume: "-6dB", "+3dB"
- set_mute: Mykistä (Args: track, mute: true/false)
- set_solo: Solo (Args: track, solo: true/false)
- set_color: Väritä raita (Args: track, color) - red, blue, green, yellow, orange, purple, pink, cyan
- track_pan: Panoroi (Args: track, pan) - pan: -1.0 (vasen) to 1.0 (oikea)
- add_fx: Lisää FX-plugin (Args: track, fx_name) - ReaEQ, ReaComp, ReaVerbate, ReaDelay, ReaGate, ReaLimit
- adjust_effect: Säädä efektiä (Args: track, effect, setting, value) - TÄRKEÄÄ: "setting" PITÄÄ olla TARKKA parametrin nimi inspect_fx:stä! Esim. "Gain-Band 3", EI "Band 3 gain"
- effect_bypass: Ohita efekti (Args: track, effect, bypass: true/false)
- create_midi_pattern: MIDI (Args: track, pattern: "basic_rock/metal/funk/jazz/pop") TAI (track, notes: [{pitch, start, duration, velocity}])
  Presetit luovat 8 tahdin kompin vaihteluineen ja filleineen. KÄYTÄ AINA presettiä rumpuihin!
- create_chord: Yksittäinen sointu (Args: track, chord: "C/Cm/Gmaj7/Dm7", start, duration, velocity)
- chord_progression: KÄYTÄ TÄTÄ sointukierroille! (Args: track, progression: "Am-F-C-G", duration_per_chord: 4, bars: 32)
  TÄRKEÄÄ: Aseta bars VÄHINTÄÄN 16 (= 2 kierrosta). 32 = 4 kierrosta joka on ideaali.
- play/stop/undo/save: Transportit
- set_tempo: Tempo (Args: bpm) - ASETA AINA genreen sopiva tempo!
- get_tempo_info: Hae nykyinen tempo ja tahtilaji (ei argumentteja)
- set_time_signature: Tahtilaji (Args: numerator, denominator) - esim. 3/4: numerator=3, denominator=4. 6/8: numerator=6, denominator=8
- record: Aloita nauhoitus
- kuuntele/analyze: Analysoi miksaus tai WAV-tiedosto (Args: file, genre)
  KÄYTÄ TÄTÄ kun haluat analysoida miltä miksaus kuulostaa ja tehdä tietoon perustuvia säätöjä!
- list_fx: Listaa raidan efektit (Args: track) - KÄYTÄ AINA ENNEN efektien lisäämistä!
- inspect_fx: Tutki efektin parametrit (Args: track, effect) - KÄYTÄ AINA ENNEN adjust_effect! Palauttaa TARKAT parametrinimet
- get_track_info: Raidan kokonaistila (Args: track) - volyymi, pan, efektit, tila
- mastering_chain: Luo masterointiketju (Args: genre) - EQ, kompressori, limitteri masterille
- midi_insert: Lisää nuotteja OLEMASSA OLEVAAN raitaan (Args: track, notes: [{pitch, start, duration, velocity}])
  KÄYTÄ TÄTÄ kun haluat lisätä nuotteja käyttäjän jo luomaan MIDI-objektiin!

=== MIDI-LUONNIN SÄÄNNÖT ===
1. PITUUS: Luo AINA vähintään 8 tahdin (32 beatin) MIDI-patternit. Käyttäjä ei halua 1-2 tahdin pätkiä!
2. SOINTUKIERROT: Käytä chord_progression-komentoa, EI yksittäisiä create_chord-kutsuja. Aseta bars: 32.
3. RUMMUT: Käytä AINA preset-patternia (basic_rock/metal/funk/jazz/pop). Ne ovat 8 tahdin mittaisia vaihtelulla.
4. TEMPO: Aseta genre-sopiva tempo AINA kun luot musiikkia:
   - Jazz: 100-140 BPM, Rock: 120-140 BPM, Metal: 140-200 BPM, Pop: 110-130 BPM, Funk: 95-115 BPM
5. IDEOINTI: Kun käyttäjä antaa alun tai inspiraation, JATKA siitä ja lisää kompin muut elementit
6. MONIPUOLISUUS: Älä tee joka kertaa samaa - vaihtele velocityja, ajoituksia ja instrumenttivalintoja

REAPER-TILANNE:`;

    if (reaperInfo.connected) {
        prompt += `
Yhteys: OK (MCP + Lua Bridge)
REAPER-versio: ${reaperInfo.reaper_version || 'Unknown'}
Projekti: ${reaperInfo.project_name}
Tempo: ${reaperInfo.tempo} BPM
${reaperInfo.track_list || 'Ei raitoja'}`;
    } else {
        prompt += `
Yhteys: EI YHTEYTTA
- Tarkista etta Lua bridge on ladattu Reaperissa
- Bridge_data-kansio: ${mcpClient ? mcpClient.getBridgeDataPath() : 'N/A'}`;
    }

    if (studioSetup) {
        prompt += `\n\n=== KÄYTTÄJÄN STUDIO SETUP ===
${studioSetup}

TÄRKEÄÄ ÄÄNITYSTILANTEISSA:
1. Käytä yllä olevaa studio setup -tietoa antaaksesi HENKILÖKOHTAISIA ohjeita
2. Jos käyttäjä mainitsee äänittämisen, kysy MITÄ hän haluaa äänittää
3. Anna gain staging -ohjeet käyttäjän OMALLE interfacelle ja instrumentille
4. Suosittele amp simeja käyttäjän genren ja kitaran mukaan
5. Tarjoa avattavaksi REAPER:n mixer/meters tason seurantaan`;
    }

    // ============================================
    // KAYTTAJAN VST-PLUGINIT (TAYDELLISET LISTAT)
    // ============================================
    prompt += `\n\n=== KAYTTAJAN VST-PLUGINIT ===\n`;
    prompt += `KRIITTINEN SAANTO: KAYTA VAIN NAITA PLUGINEJA! Ala hallusinoi plugineja joita ei ole listalla.\n\n`;

    // RUMPU-VST:T JA INSTRUMENTIT - ERITTAIN TARKEA
    if (vstCategories.drums.length > 0) {
        prompt += `*** RUMPU-VST:T (${vstCategories.drums.length}): ${vstCategories.drums.join(', ')} ***\n`;
        prompt += `→ Kayttajalla ON rumpu-VST! Kayta naita kun luot rumpuraitoja.\n\n`;
    } else {
        prompt += `*** RUMPU-VST:T: EI YHTAAN ASENNETTUNA ***\n`;
        prompt += `→ Kayttajalla EI OLE rumpu-VST:ta! Kun kayttaja pyytaa rumpuja:\n`;
        prompt += `  1. KERRO ENSIN etta rumpu-VST puuttuu ja ilman sita ei kuulu aanta\n`;
        prompt += `  2. Suosittele: MT Power Drum Kit (powerdrumkit.com) tai Steven Slate Drums Free (stevenslatedrums.com/ssd5free)\n`;
        prompt += `  3. Kerro asennusohjeet: lataa, kopioi C:\\Program Files\\VSTPlugins\\, REAPER → Re-scan\n`;
        prompt += `  4. Luo silti raita + MIDI-pattern niin se on valmiina kun plugin on asennettu\n\n`;
    }

    if (vstCategories.instruments.length > 0) {
        prompt += `*** INSTRUMENTTI-VST:T/SYNTAT (${vstCategories.instruments.length}): ${vstCategories.instruments.join(', ')} ***\n`;
        prompt += `→ Kayttajalla ON instrumenttiplugineita! Kayta naita pianolle/syntetisaattoreille.\n\n`;
    } else {
        prompt += `*** INSTRUMENTTI-VST:T/SYNTAT: EI YHTAAN ASENNETTUNA ***\n`;
        prompt += `→ Kayttajalla EI OLE piano/synth-VST:ta! Kun kayttaja pyytaa pianoa/syntetisaattoria:\n`;
        prompt += `  1. KERRO etta instrumenttiplugin puuttuu - voit kayttaa ReaSynthia perusaanena\n`;
        prompt += `  2. Suosittele: LABS (labs.spitfireaudio.com, ilmainen piano), Vital (vital.audio, ilmainen synth), Keyzone Classic\n`;
        prompt += `  3. Kerro asennusohjeet\n`;
        prompt += `  4. Luo silti raita + soinnut/nuotit ReaSynthilla\n\n`;
    }

    // Muut kategorialuettelot
    if (vstCategories.reverb.length > 0) {
        prompt += `KAIKUT/REVERB (${vstCategories.reverb.length}):\n${vstCategories.reverb.join(', ')}\n\n`;
    } else {
        prompt += `KAIKUT/REVERB: EI YHTAAN (Suosittele: Valhalla Supermassive - ilmainen)\n\n`;
    }

    if (vstCategories.compressor.length > 0) {
        prompt += `KOMPRESSORIT (${vstCategories.compressor.length}):\n${vstCategories.compressor.join(', ')}\n\n`;
    } else {
        prompt += `KOMPRESSORIT: EI YHTAAN (Suosittele: TDR Kotelnikov - ilmainen)\n\n`;
    }

    if (vstCategories.eq.length > 0) {
        prompt += `EQ/TAAJUUSKORJAIMET (${vstCategories.eq.length}):\n${vstCategories.eq.join(', ')}\n\n`;
    } else {
        prompt += `EQ: Kayta ReaEQ (Reaperin sisaanrakennettu)\n\n`;
    }

    if (vstCategories.distortion.length > 0) {
        prompt += `SARO/DISTORTION/AMP (${vstCategories.distortion.length}):\n${vstCategories.distortion.join(', ')}\n\n`;
    } else {
        prompt += `SARO/AMP: EI YHTAAN (Suosittele: Ignite Amps Emissary - ilmainen)\n\n`;
    }

    if (vstCategories.delay.length > 0) {
        prompt += `DELAY/VIIVE (${vstCategories.delay.length}):\n${vstCategories.delay.join(', ')}\n\n`;
    } else {
        prompt += `DELAY: Kayta ReaDelay (Reaperin sisaanrakennettu)\n\n`;
    }

    if (vstCategories.other.length > 0) {
        const otherPlugins = vstCategories.other.slice(0, 50); // Max 50 muuta
        prompt += `MUUT PLUGINIT (${vstCategories.other.length}, naytetan 50 ensimmaista):\n${otherPlugins.join(', ')}\n\n`;
    }

    // ============================================
    // ILMAISET VST-SUOSITUKSET
    // ============================================
    prompt += `=== ILMAISET VST-SUOSITUKSET ===
Jos kayttajalta puuttuu jokin plugin, suosittele naita ILMAISIA vaihtoehtoja:

GITARISARO/AMP SIMULATOR:
- Ignite Amps Emissary (https://www.igniteamps.com) - Modern high-gain amp
- LePou Legion (https://lepou.blogspot.com) - Legendary 5150 emulation
- Emissary + NadIR (impulse loader) = Pro-tason kitarasoundit

KOMPRESSORI:
- TDR Kotelnikov (https://www.tokyodawn.net) - Transparentti mastering-kompressori
- Kotelnikov GE (ilmainen) tai TDR Nova (dynaaminen EQ)

REVERB:
- Valhalla Supermassive (https://valhalladsp.com) - Massiiviset tilat, ilmainen
- Dragonfly Reverb - Classinen reverb-algoritmi

EQ:
- TDR Nova (https://www.tokyodawn.net) - Dynaaminen EQ
- ReaEQ (Reaperin sisaanrakennettu) - Yksinkertainen ja nopea

SYNTH:
- Vital (https://vital.audio) - Modernin wavetable-synth
- Surge XT - Avoimen lahdekoodin synth

MUISTA: Anna AINA latauslinkki kun suosittelet ilmaista pluginia!
`;

    // ============================================
    // RAJOITUKSET JA KIELLETYT KOMENNOT
    // ============================================
    prompt += `\n=== TUETUT LISÄKOMENNOT ===

TOIMII NYT:
- set_color: Raidan varitys (red, blue, green, yellow, orange, purple, pink, cyan)
- track_delete: Poista raita (track: "nimi") tai kaikki (track: "all")
- track_arm: Aseista nauhoitukseen (track: "nimi", arm: true/false)
- adjust_effect: Saada efektin parametreja (track, effect, setting, value)
  Esim: adjust_effect { track: "Kitara", effect: "ReaComp", setting: "ratio", value: 0.7 }
- effect_bypass: Ohita/ota kayttoon efekti (track, effect, bypass: true/false)

EI VIELÄ TUETTU:
- Raidan input-vaihto (set_input)

REAPER SISAANRAKENNETUT EFEKTIT (Kayta aina kun mahdollista):
- ReaComp - Kompressori
- ReaEQ - Taajuuskorjain
- ReaVerb / ReaVerbate - Kaiku
- ReaDelay - Viive
- ReaGate - Noise gate
- ReaLimit - Limiter
- ReaTune - Viritin / Automaattinen viritys / Tuner
- ReaPitch - Pitch shifter / Sävelkorkeuden siirto
- ReaSynth - Yksinkertainen synth
`;

    // ============================================
    // SUOMENKIELINEN TERMISTÖ
    // ============================================
    prompt += `\n\n=== SUOMI-ENGLANTI TERMISTO ===
KRIITTINEN: Kun kayttaja kaytta suomenkielisia termeja, muunna ne AINA oikeiksi plugin-nimiksi komennoissa!

EFEKTIT (Reaper sisaanrakennetut):
- "kompressori" tai "kompressointi" → ReaComp
- "taajuuskorjain" tai "EQ" tai "taajuus" → ReaEQ
- "kaiku" tai "reverb" tai "kaikuefekti" → ReaVerbate
- "viive" tai "delay" tai "echo" → ReaDelay
- "kohinaportti" tai "noise gate" tai "gate" → ReaGate
- "limitteri" tai "limiter" → ReaLimit
- "viritin" tai "tuner" tai "pitch" → ReaTune (automaattinen viritys)
- "pitch shifter" → ReaPitch

SAROT/AMPPIMULAATTORIT:
- "saro" tai "distortion" tai "overdrive" → Katso VST-listasta (esim. Emissary jos on)
- "amp" tai "kitaravahvistin" → Katso VST-listasta (esim. Emissary, LePou)

ESIMERKKI:
Kayttaja: "Lisaa viritin raidalle"
Sina:
Komento: add_fx
Args: { track: 0, fx_name: "ReaTune" }

Kayttaja: "Lisaa kompressori ja taajuuskorjain"
Sina:
Komento: add_fx
Args: { track: 0, fx_name: "ReaComp" }

Komento: add_fx
Args: { track: 0, fx_name: "ReaEQ" }
`;

    // ============================================
    // EFEKTIEN PARAMETRIEN SÄÄTÖ - RAJOITUS
    // ============================================
    prompt += `\n\n=== EFEKTIEN PARAMETRIEN SAATO ===

VOIT saataa efektien parametreja adjust_effect-komennolla:

Komento: adjust_effect
Args: { track: "Kitara", effect: "ReaComp", setting: "ratio", value: 0.7 }

Tuetut setting-arvot: amount, mix, ratio, threshold, frequency, time, feedback
Tuetut value-arvot: numero 0-1 TAI "wet", "dry", "subtle", "heavy", "gentle", "strong"

ESIMERKKI:
Kayttaja: "Tee kitararaita Meshuggah-soundilla"
Sina:
Komento: create_track
Args: { name: "Kitara", role: "guitar" }

Komento: add_fx
Args: { track: "Kitara", fx_name: "ReaEQ" }

Komento: add_fx
Args: { track: "Kitara", fx_name: "ReaComp" }

Komento: adjust_effect
Args: { track: "Kitara", effect: "ReaComp", setting: "ratio", value: "heavy" }

"Loin kitararaidan ja lisasin ReaEQ:n ja ReaComp:in. Meshuggah-soundia varten:
- EQ: HPF 80-100 Hz, leikkaa 200-400 Hz, nosta 2-4 kHz
- Kompressori: nopea attack, korkea ratio
Jos sinulla on Ignite Emissary, lisaa se amp-simulaatioksi!"

=== SUOSITELLUT FX-KETJUT ===
Kun kayttaja pyytaa efekteja, lisaa ne TASSA JARJESTYKSESSA:

LAULU (Vocals):
1. ReaEQ (HPF 80-120 Hz)
2. ReaComp (kompressori)
3. ReaEQ (taajuuskorjain)
4. ReaVerbate (kaiku - send!)

KITARA (Guitar):
1. ReaGate (noise gate jos tarpeen)
2. Amp sim (Emissary tms.)
3. ReaEQ (leikkaa 200-400 Hz mutaisuus)
4. ReaComp (kevyt)

BASSO:
1. ReaEQ (HPF 30-40 Hz)
2. ReaComp (kompressori)
3. ReaEQ (taajuuskorjain)

RUMMUT:
1. ReaGate (bleedin poisto)
2. ReaEQ (taajuuskorjain)
3. ReaComp (kompressori)
`;

    prompt += `

MUISTA: Kayta DSL-komentoja, ole lyhyt ja ystavallinen. Ala selittaa komentoja liikaa.`;

    return prompt;
}

async function buildStrictJSONPrompt(userMessage = '') {
    const reaperInfo = await getCachedReaperInfo();
    const vstPlugins = getVSTPlugins();
    const vstCategories = getVSTCategories(vstPlugins);
    const studioSetup = await getStudioSetup();
    const artistKnowledge = loadArtistKnowledge(userMessage);
    const workflowKnowledge = loadWorkflowKnowledge(userMessage);
    const studioSetupKnowledge = loadStudioSetupKnowledge(userMessage, studioSetup);

    let prompt = `Olet kokenut studio- ja musiikkiasiantuntija. Autat käyttäjää tekemään musiikkia suomeksi.
TÄRKEÄÄ: message-kentässä kirjoita AINA luonnollista kieltä kuten kokenut tuottaja. ÄLÄ KOSKAAN laita komentoja tai koodia message-kenttään!
Puhu kuin studioammattilainen: kerro mitä teit, miksi, ja miltä soundi kuulostaa.

VASTAUSMUOTO - Vastaa AINA yhdellä JSON-objektilla:

YKSI KOMENTO:
{"action": "komento", "params": {...}, "message": "Selitys"}

USEITA KOMENTOJA:
{"commands": [{"action": "a", "params": {...}}, {"action": "b", "params": {...}}], "message": "Selitys"}

KESKUSTELU (ei komentoja):
{"message": "Vastaus"}

TÄRKEÄÄ: Vastaa VAIN yhdellä JSON-objektilla. Ei koodia, ei selityksiä JSON:n ulkopuolella.

=== KOMENNOT ===

RAIDAT:
- create_track: {"name": "nimi", "role": "guitar/bass/drums/keys/vocals/generic"}
- track_delete: {"track": "nimi"} tai {"track": "all"} (poistaa kaikki)
- track_duplicate: {"track": "nimi"}
- rename_track: {"track": "nimi", "name": "uusi_nimi"}
- set_volume: {"track": "nimi", "volume": -6}
- set_mute: {"track": "nimi", "mute": true}
- set_solo: {"track": "nimi", "solo": true}
- set_color: {"track": "nimi", "color": "red/blue/green/yellow/purple/orange/cyan/pink"}
- pan: {"track": "nimi", "pan": -1.0} (vasen=-1, keski=0, oikea=1)

EFEKTIT (käytä AINA näitä TARKKOJA nimiä):
- list_fx: {"track": "nimi"} - TARKISTA AINA ENSIN mitä efektejä raidalla jo on!
- inspect_fx: {"track": "nimi", "effect": "ReaEQ"} - tutki efektin parametrit ja arvot
- get_track_info: {"track": "nimi"} - raidan kokonaistila (volyymi, pan, efektit)
- add_fx: {"track": "nimi", "fx_name": "ReaEQ"}
  Reaperin omat: ReaEQ, ReaComp, ReaVerbate, ReaDelay, ReaGate, ReaLimit, ReaTune, ReaPitch, ReaFIR, ReaSynth
  Käyttäjän VST-pluginit: Katso KÄYTTÄJÄN VST-PLUGINIT -osio alla!
- adjust_effect: {"track": "nimi", "effect": "ReaComp", "setting": "ratio", "value": 0.7}
  setting: amount, mix, ratio, threshold, frequency, time, feedback, attack, release, gain
  value: numero 0-1 TAI "wet","dry","subtle","heavy","gentle","strong"
- effect_bypass: {"track": "nimi", "effect": "ReaEQ", "bypass": true}
- mastering_chain: {"genre": "pop"} - Luo masterointiketju master-raidalle genren mukaan
- chord_progression: {"track": "nimi", "progression": "A-F#m-D-E", "duration_per_chord": 4, "bars": 8}

TÄRKEÄÄ EFEKTEISTÄ: Kun muokkaat OLEMASSA OLEVAA raitaa, TARKISTA ENSIN list_fx:llä mitä siellä on!
Älä lisää samaa efektiä uudestaan - SÄÄDÄ olemassa olevia adjust_effect:llä.
KRIITTINEN: Kun lisäät efektejä, SÄÄDÄ AINA niiden arvot adjust_effect:llä samassa vastauksessa!

GENREKOHTAISET EFEKTIKETJUT:
- METALLI: ReaGate → TSE_808_2.0_x64 → [Amp: Emissary] → NadIR → ReaEQ → ReaComp
- JAZZ-KITARA: ReaEQ → ReaComp → ReaVerbate (leikkaa korkeat, kevyt kompressio, lämmin kaiku)
- ROCK: [Amp: bx_rockrack_V3] → NadIR → ReaEQ → ReaComp → ReaDelay
- POP: ReaEQ → ReaComp → ReaVerbate → ReaDelay
- AMBIENT: ReaEQ → ReaComp → ValhallaSupermassive_x64 → ReaDelay
MUISTA: Amp-simulaattori (Emissary, bx_rockrack jne.) VAATII AINA NadIR:n (cabinet IR) jälkeensä!

SUOMI→PLUGIN MUUNNOKSET (KRIITTINEN - muunna AINA):
- "kompressori"/"kompura" → fx_name: "ReaComp"
- "taajuuskorjain"/"EQ" → fx_name: "ReaEQ"
- "kaiku"/"reverb" → fx_name: "ReaVerbate"
- "viive"/"delay"/"echo" → fx_name: "ReaDelay"
- "viritin"/"tuner"/"viritys" → fx_name: "ReaTune"
- "kohinaportti"/"gate" → fx_name: "ReaGate"
- "limitteri"/"limiter" → fx_name: "ReaLimit"
- "pitch shifter"/"sävelkorkeuden siirto" → fx_name: "ReaPitch"
- "särö"/"amp"/"vahvistin" → Katso käyttäjän VST-listasta (esim. Emissary)
- "saturaatio"/"lämpöä" → JS: Saturation tai käyttäjän plugin

MIDI:
- create_midi_pattern: {"track": "nimi", "pattern": "basic_rock"} (presetit: basic_rock, metal, funk, jazz, pop)
  Presetit luovat 8 tahdin kompin vaihteluineen. KÄYTÄ AINA presettiä rumpuihin!
- create_midi_pattern: {"track": "nimi", "notes": [{"pitch": 60, "start": 0, "duration": 1, "velocity": 100}]}
- create_chord: {"track": "nimi", "chord": "Cmaj/Cm/G7/Am7/Fsus4", "start": 0, "duration": 4}
- chord_progression: {"track": "nimi", "progression": "Am-F-C-G", "duration_per_chord": 4, "bars": 32}
  SUOSI TÄTÄ sointukierroille! bars=32 tekee 4 kierrosta automaattisesti.
- midi_insert: {"track": "nimi", "notes": [...]} - Lisää nuotteja OLEMASSA OLEVAAN raitaan

MIDI-LUONNIN SÄÄNNÖT:
- Luo AINA vähintään 8 tahtia. Käyttäjä ei halua 1-2 tahdin pätkiä!
- SOINTUKIERROT: Käytä chord_progression + bars: 32. EI yksittäisiä create_chord-kutsuja.
- RUMMUT: Käytä AINA preset-patternia. Ne ovat monipuolisia 8 tahdin komppeja.
- Genreen sopiva TEMPO aina mukaan: Jazz 100-140, Rock 120-140, Metal 140-200, Pop 110-130, Funk 95-115

TRANSPORT:
- play: {}
- stop: {}
- record: {}
- undo: {}
- save: {}
- set_tempo: {"bpm": 120}
- get_tempo_info: {} - Hae nykyinen tempo ja tahtilaji
- set_time_signature: {"numerator": 3, "denominator": 4} - Aseta tahtilaji (esim. 3/4, 6/8, 7/8)
KRIITTINEN: Tahtilajin tai tempon muutos VAATII AINA komennon! ÄLÄ KOSKAAN väitä muuttaneesi tahtilajia ilman set_time_signature-komentoa tai tempoa ilman set_tempo-komentoa!

AUDIO-ANALYYSI:
- analyze: {"file": "C:/Music/mixdown.wav", "genre": "metal"}
  Analysoi WAV-tiedosto ja palauta miksausneuvoja.
  Jos käyttäjä antaa tiedostopolun, käytä sitä. Jos ei, ohjeista renderöimään ensin.
  Analysoi palauttaa: peak/RMS-tasot, taajuusjakauman, LUFS-arvion, ongelmatunnistuksen.

=== MIDI NUOTIT ===
Pitch-numerot: C4=60, D4=62, E4=64, F4=65, G4=67, A4=69, B4=71, C5=72
Rumpunuotit: kick=36, snare=38, hihat=42, open_hihat=46, crash=49, ride=51, tom_hi=48, tom_lo=45

=== ESIMERKIT ===

Käyttäjä: "Luo kitararaita"
{"action": "create_track", "params": {"name": "Kitara", "role": "guitar"}, "message": "Loin kitararaidan."}

Käyttäjä: "Lisää EQ ja kompressori"
{"commands": [
{"action": "add_fx", "params": {"track": "Kitara", "fx_name": "ReaEQ"}},
{"action": "add_fx", "params": {"track": "Kitara", "fx_name": "ReaComp"}}
], "message": "Lisäsin ReaEQ:n ja ReaComp:in kitararaitaan."}

Käyttäjä: "Tee Meshuggah-kitarasoundi"
HUOM: Tarkista VST-listasta onko Emissary/amp sim! Lisää AINA NadIR ampin jälkeen!
{"commands": [
{"action": "create_track", "params": {"name": "Meshuggah_Guitar", "role": "guitar"}},
{"action": "add_fx", "params": {"track": "Meshuggah_Guitar", "fx_name": "ReaGate"}},
{"action": "add_fx", "params": {"track": "Meshuggah_Guitar", "fx_name": "TSE_808_2.0_x64"}},
{"action": "add_fx", "params": {"track": "Meshuggah_Guitar", "fx_name": "Emissary"}},
{"action": "add_fx", "params": {"track": "Meshuggah_Guitar", "fx_name": "NadIR"}},
{"action": "add_fx", "params": {"track": "Meshuggah_Guitar", "fx_name": "ReaEQ"}},
{"action": "add_fx", "params": {"track": "Meshuggah_Guitar", "fx_name": "ReaComp"}},
{"action": "adjust_effect", "params": {"track": "Meshuggah_Guitar", "effect": "ReaGate", "setting": "Threshold", "value": 0.15}},
{"action": "adjust_effect", "params": {"track": "Meshuggah_Guitar", "effect": "TSE 808", "setting": "Drive", "value": 0.15}},
{"action": "adjust_effect", "params": {"track": "Meshuggah_Guitar", "effect": "TSE 808", "setting": "Volume", "value": 0.70}},
{"action": "adjust_effect", "params": {"track": "Meshuggah_Guitar", "effect": "Emissary", "setting": "LeadGain", "value": 0.35}},
{"action": "adjust_effect", "params": {"track": "Meshuggah_Guitar", "effect": "ReaComp", "setting": "Ratio", "value": 0.4}},
{"action": "set_color", "params": {"track": "Meshuggah_Guitar", "color": "red"}}
], "message": "Loin Meshuggah-kitararaidan! Signaaliketju: ReaGate → TSE 808 → Emissary → NadIR → ReaEQ → ReaComp. Gate leikkaa kohinan, 808 tiukentaa, Emissary tuo gainin, NadIR on cabinet-simulaatio."}

Käyttäjä: "Tee jazz-kitara pehmeällä soundilla"
{"commands": [
{"action": "create_track", "params": {"name": "Jazz_Guitar", "role": "guitar"}},
{"action": "add_fx", "params": {"track": "Jazz_Guitar", "fx_name": "ReaEQ"}},
{"action": "add_fx", "params": {"track": "Jazz_Guitar", "fx_name": "ReaComp"}},
{"action": "add_fx", "params": {"track": "Jazz_Guitar", "fx_name": "ReaVerbate"}},
{"action": "adjust_effect", "params": {"track": "Jazz_Guitar", "effect": "ReaEQ", "setting": "Freq-Band 2", "value": 0.15}},
{"action": "adjust_effect", "params": {"track": "Jazz_Guitar", "effect": "ReaEQ", "setting": "Gain-Band 2", "value": 0.35}},
{"action": "adjust_effect", "params": {"track": "Jazz_Guitar", "effect": "ReaComp", "setting": "Ratio", "value": 0.2}},
{"action": "adjust_effect", "params": {"track": "Jazz_Guitar", "effect": "ReaVerbate", "setting": "Mix", "value": 0.25}},
{"action": "adjust_effect", "params": {"track": "Jazz_Guitar", "effect": "ReaVerbate", "setting": "Room Size", "value": 0.6}}
], "message": "Loin jazz-kitararaidan! EQ leikkaa korkeat taajuudet pehmeämmäksi, kompressori tasoittaa dynamiikkaa kevyesti, ja reverb luo tilantuntua."}

Käyttäjä: "Vaihda tahtilaji 3/4:ään"
{"action": "set_time_signature", "params": {"numerator": 3, "denominator": 4}, "message": "Vaihdoin tahtilajin 3/4:ään - sopii hyvin valsseihin ja balladeihin."}

Käyttäjä: "Aseta tempo 140 ja tahtilaji 6/8"
{"commands": [
{"action": "set_tempo", "params": {"bpm": 140}},
{"action": "set_time_signature", "params": {"numerator": 6, "denominator": 8}}
], "message": "Asetin tempon 140 BPM:ään ja tahtilajin 6/8:aan."}

Käyttäjä: "Poista kaikki raidat"
{"action": "track_delete", "params": {"track": "all"}, "message": "Poistin kaikki raidat."}

Käyttäjä: "Tee rumpukomppi"
RUMPUJEN LUOMISEN PROSESSI (PAKOLLINEN):
1. ENSIN tarkista käyttäjän VST-listasta onko rumpu-VST (MT Power Drum Kit, Steven Slate Drums, Sitala, Sean Pandy Drums, EZDrummer, Superior Drummer, Addictive Drums ym.)
2. Jos rumpu-VST LÖYTYY → luo raita + lisää VST + lisää MIDI-pattern:
{"commands": [
{"action": "create_track", "params": {"name": "Rummut", "role": "drums"}},
{"action": "add_fx", "params": {"track": "Rummut", "fx_name": "MT Power Drum Kit"}},
{"action": "create_midi_pattern", "params": {"track": "Rummut", "pattern": "basic_rock"}}
], "message": "Loin rumpuraidan MT Power Drum Kit -soittimella ja rock-kompilla! Voit kuunnella painamalla play."}
3. Jos rumpu-VST:tä EI LÖYDY → luo silti raita ja MIDI-pattern, mutta KERRO SELKEÄSTI:
{"commands": [
{"action": "create_track", "params": {"name": "Rummut", "role": "drums"}},
{"action": "create_midi_pattern", "params": {"track": "Rummut", "pattern": "basic_rock"}}
], "message": "Loin rumpuraidan ja MIDI-kompin, mutta sinulla ei ole rumpu-VST:tä asennettuna - et kuule vielä ääntä!\n\n🥁 Suosittelen näitä ilmaisia rumpu-plugineita:\n• MT Power Drum Kit: https://www.powerdrumkit.com/ (monipuolinen, hyvä kaikkeen)\n• Steven Slate Drums Free: https://stevenslatedrums.com/ssd5free/ (erinomainen metalliin ja rockiin)\n\n📦 Asennusohjeet:\n1. Lataa plugin yllä olevasta linkistä\n2. Asenna/kopioi DLL-tiedosto kansioon: C:\\Program Files\\VSTPlugins\\\n3. Avaa REAPER → Options → Preferences → Plug-ins → VST\n4. Klikkaa 'Re-scan' ja odota\n5. Palaa tänne ja pyydä minua lisäämään plugin raidalle!"}

Käyttäjä: "Tee metallirummut"
HUOM: Valitse pattern "metal" ja sopiva tempo! Tarkista rumpu-VST ensin.
Jos rumpu-VST löytyy:
{"commands": [
{"action": "create_track", "params": {"name": "Metal_Drums", "role": "drums"}},
{"action": "add_fx", "params": {"track": "Metal_Drums", "fx_name": "Steven Slate Drums Free"}},
{"action": "create_midi_pattern", "params": {"track": "Metal_Drums", "pattern": "metal"}},
{"action": "set_tempo", "params": {"bpm": 180}},
{"action": "set_color", "params": {"track": "Metal_Drums", "color": "red"}}
], "message": "Loin metallikompin 180 BPM tempolla tupla-basarilla ja Steven Slate Drums -soundeilla!"}
Jos EI löydy → sama kaava kuin yllä, mutta kerro asennusohjeet ja suosittele erityisesti SSD Free:tä metalliin.

Käyttäjä: "Tee jazz-rummut"
HUOM: Jazz-rumpuihin sopii parhaiten MT Power Drum Kit - tarkista rumpu-VST ensin!
Jos rumpu-VST löytyy:
{"commands": [
{"action": "create_track", "params": {"name": "Jazz_Drums", "role": "drums"}},
{"action": "add_fx", "params": {"track": "Jazz_Drums", "fx_name": "MT Power Drum Kit"}},
{"action": "create_midi_pattern", "params": {"track": "Jazz_Drums", "pattern": "jazz"}},
{"action": "set_tempo", "params": {"bpm": 120}}
], "message": "Loin jazz-kompin ride-symbaalilla ja kevyillä ghost-nuoteilla 120 BPM tempossa! MT Power Drum Kit sopii hyvin jazziin - voit säätää sen sisäisiä soundeja akustisemmaksi."}
Jos rumpu-VST EI löydy:
{"commands": [
{"action": "create_track", "params": {"name": "Jazz_Drums", "role": "drums"}},
{"action": "create_midi_pattern", "params": {"track": "Jazz_Drums", "pattern": "jazz"}},
{"action": "set_tempo", "params": {"bpm": 120}}
], "message": "Loin jazz-rumpuraidan ja MIDI-kompin, mutta sinulla ei ole rumpu-VST:tä asennettuna!\n\n🥁 Jazz-rumpuihin suosittelen erityisesti:\n• MT Power Drum Kit: https://www.powerdrumkit.com/ - monipuoliset akustiset rummut, sopii jazziin erinomaisesti\n\n📦 Asennusohjeet:\n1. Lataa plugin linkistä\n2. Asenna/kopioi DLL-tiedosto: C:\\Program Files\\VSTPlugins\\\n3. REAPER → Options → Preferences → Plug-ins → VST → Re-scan\n4. Palaa tänne ja pyydä minua lisäämään plugin raidalle!"}

Käyttäjä: "Soita C-duuri sointuja pianolla"
PIANON LUOMISEN PROSESSI (PAKOLLINEN):
1. Luo AINA raita + sointu/nuotit samassa vastauksessa - ÄLÄ KOSKAAN luo tyhjää raitaa!
2. Tarkista käyttäjän VST-listasta piano/keys-plugin (LABS, Vital, Keyzone Classic, Piano One ym.)
3. Jos piano-VST löytyy → lisää se add_fx:llä ENNEN sointuja!
4. Jos piano-VST EI löydy → käytä ReaSynthiä JA kerro plugin-suositukset message-kentässä!

Jos piano-VST löytyy (esim. LABS, Keyzone Classic):
{"commands": [
{"action": "create_track", "params": {"name": "Piano", "role": "keys"}},
{"action": "add_fx", "params": {"track": "Piano", "fx_name": "LABS"}},
{"action": "create_chord", "params": {"track": "Piano", "chord": "Cmaj", "duration": 4}}
], "message": "Loin pianon C-duuri soinnulla (4 tahtia) LABS-pianosoundilla! Voit lisätä lisää sointuja pyytämällä esim. 'lisää Am7 sointu'."}

Jos piano-VST EI löydy:
{"commands": [
{"action": "create_track", "params": {"name": "Piano", "role": "keys"}},
{"action": "add_fx", "params": {"track": "Piano", "fx_name": "ReaSynth"}},
{"action": "create_chord", "params": {"track": "Piano", "chord": "Cmaj", "duration": 4}}
], "message": "Loin pianon C-duuri soinnulla. Käytin REAPERin ReaSynthiä, joka on yksinkertainen syntetisaattori.\n\n🎹 Parempiin pianosoundeihin suosittelen näitä ILMAISIA plugineita:\n• LABS by Spitfire Audio: https://labs.spitfireaudio.com/ - kauniita piano/pad-ääniä\n• Keyzone Classic: Hae googlesta 'Keyzone Classic VST' - aito piano-soundi\n• Piano One: https://neovst.com/piano-one/ - laadukas Steinway-piano\n• Vital: https://vital.audio/ - moderni syntetisaattori\n\n📦 Asennusohjeet: Lataa → asenna/kopioi C:\\Program Files\\VSTPlugins\\ → REAPER Re-scan"}

Käyttäjä: "Tee pianon sointukierto" / "Soita jotain pianolla"
HUOM: Jos käyttäjä ei kerro MITÄ sointuja haluaa, KYSY tarkentavia kysymyksiä message-kentässä:
{"message": "Millaisen pianosointukierron haluaisit? Kerro minulle:\n• Tyyli/genre (jazz, pop, klassinen, blues)?\n• Haluatko tietyn sointukierron (esim. C-Am-F-G)?\n• Tempo?\n\nVoin myös ehdottaa genreen sopivan sointukierron jos kerrot tyylin!"}
TAI jos genre/tyyli on selvä kontekstista, luo AINA oikeat soinnut JA tarkista piano-VST:

Pop/Rock (jos piano-VST löytyy): {"commands": [
{"action": "create_track", "params": {"name": "Piano", "role": "keys"}},
{"action": "add_fx", "params": {"track": "Piano", "fx_name": "LABS"}},
{"action": "create_chord", "params": {"track": "Piano", "chord": "Cmaj", "duration": 4}},
{"action": "create_chord", "params": {"track": "Piano", "chord": "Am", "duration": 4}},
{"action": "create_chord", "params": {"track": "Piano", "chord": "Fmaj", "duration": 4}},
{"action": "create_chord", "params": {"track": "Piano", "chord": "G7", "duration": 4}}
], "message": "Loin pianon sointukierrolla C - Am - F - G (klassinen pop-kierto, 4 tahtia per sointu). Haluatko muuttaa sointuja tai tempoa?"}

Käyttäjä: "Tee jazz-piano" / "Soita jazzpianoa"
Jazz (jos piano-VST löytyy): {"commands": [
{"action": "create_track", "params": {"name": "Jazz_Piano", "role": "keys"}},
{"action": "add_fx", "params": {"track": "Jazz_Piano", "fx_name": "LABS"}},
{"action": "create_chord", "params": {"track": "Jazz_Piano", "chord": "Dm7", "duration": 4}},
{"action": "create_chord", "params": {"track": "Jazz_Piano", "chord": "G7", "duration": 4}},
{"action": "create_chord", "params": {"track": "Jazz_Piano", "chord": "Cmaj7", "duration": 4}},
{"action": "create_chord", "params": {"track": "Jazz_Piano", "chord": "Am7", "duration": 4}},
{"action": "set_tempo", "params": {"bpm": 120}}
], "message": "Loin jazz-pianon ii-V-I-vi sointukierrolla (Dm7 - G7 - Cmaj7 - Am7)! Tämä on klassinen jazz-kierto. Tempo on 120 BPM."}
Jazz (jos piano-VST EI löydy): {"commands": [
{"action": "create_track", "params": {"name": "Jazz_Piano", "role": "keys"}},
{"action": "add_fx", "params": {"track": "Jazz_Piano", "fx_name": "ReaSynth"}},
{"action": "create_chord", "params": {"track": "Jazz_Piano", "chord": "Dm7", "duration": 4}},
{"action": "create_chord", "params": {"track": "Jazz_Piano", "chord": "G7", "duration": 4}},
{"action": "create_chord", "params": {"track": "Jazz_Piano", "chord": "Cmaj7", "duration": 4}},
{"action": "create_chord", "params": {"track": "Jazz_Piano", "chord": "Am7", "duration": 4}},
{"action": "set_tempo", "params": {"bpm": 120}}
], "message": "Loin jazz-pianon ii-V-I-vi sointukierrolla! Käytin ReaSynthiä koska sinulla ei ole piano-pluginia.\n\n🎹 Jazz-pianoon suosittelen erityisesti:\n• LABS by Spitfire Audio (labs.spitfireaudio.com) - erinomainen 'Soft Piano'\n• Piano One (neovst.com/piano-one/) - Steinway-grand, sopii jazziin\n\n📦 Asenna plugin → REAPER Re-scan → palaa pyytämään uusi piano-sound!"}

Käyttäjä: "Tee pop-kappale sointukierrolla Am-F-C-G pianolla ja rummuilla"
{"commands": [
{"action": "set_tempo", "params": {"bpm": 120}},
{"action": "create_track", "params": {"name": "Piano", "role": "keys"}},
{"action": "add_fx", "params": {"track": "Piano", "fx_name": "Keyzone_Classic"}},
{"action": "chord_progression", "params": {"track": "Piano", "progression": "Am-F-C-G", "duration_per_chord": 4, "bars": 32}},
{"action": "create_track", "params": {"name": "Rummut", "role": "drums"}},
{"action": "add_fx", "params": {"track": "Rummut", "fx_name": "Sean_Pandy_Drums"}},
{"action": "create_midi_pattern", "params": {"track": "Rummut", "pattern": "pop"}}
], "message": "Loin pop-kappaleen pohjan! Piano soittaa sointukiertoa Am-F-C-G neljä kertaa läpi (32 tahtia) Keyzone Classicilla. Rummut soittavat pop-komppia. Tempo on 120 BPM."}

Käyttäjä: "Keksi lisää tuohon rumpukomppiin" tai "Jatka tätä komppia"
HUOM: Kun käyttäjä pyytää JATKAMAAN tai LISÄÄMÄÄN olemassa olevaan MIDI:iin:
1. Älä luo uutta raitaa! Käytä OLEMASSA OLEVAA raitaa.
2. Käytä midi_insert-komentoa lisätäksesi nuotteja.
3. Kuuntele mitä raidalla jo on ja JATKA siitä luovasti.
{"action": "midi_insert", "params": {"track": "Rummut", "notes": [
{"pitch": 38, "start": 1, "duration": 0.5, "velocity": 100},
{"pitch": 42, "start": 0.5, "duration": 0.25, "velocity": 70},
{"pitch": 36, "start": 2.5, "duration": 0.25, "velocity": 90}
]}, "message": "Lisäsin komppiin virvelin, hi-hat-iskuja ja bassorumpusävyjä. Kokeile miltä kuulostaa!"}

Käyttäjä: "Lisää viritin raidalle"
{"action": "add_fx", "params": {"track": "Kitara", "fx_name": "ReaTune"}, "message": "Lisäsin ReaTunen (viritin) raidalle."}

Käyttäjä: "Säädä reverbiä kosteammaksi"
{"action": "adjust_effect", "params": {"track": "Laulu", "effect": "ReaVerbate", "setting": "mix", "value": "wet"}, "message": "Säädin reverbin kosteammaksi."}

Käyttäjä: "Mikä on hyvä kompressori-asetus lauluun?"
{"message": "Lauluun: Attack 10-30ms, Release 100-200ms, Ratio 3:1-4:1, Threshold niin että gain reduction on 3-6dB. Haluatko että lisään ReaCompin lauluraitaan?"}

Käyttäjä: "Analysoi miksaukseni" / "Miltä tämä kuulostaa?"
Jos käyttäjä EI anna tiedostopolkua:
{"message": "Analysoidakseni miksauksesi, tarvitsen renderöidyn WAV-tiedoston:\\n\\n1. Paina Reaperissa Ctrl+Alt+R (Render)\\n2. Valitse 'Entire project' ja formaatti WAV\\n3. Renderöi tiedosto\\n4. Kerro minulle tiedoston polku, esim: 'Analysoi C:/Music/mixdown.wav'\\n\\nVoit myös käyttää 🎧 Analysoi -nappia pikakomentopalkissa!"}

Käyttäjä: "Analysoi C:/Music/projekti.wav" TAI "Analysoi tiedosto D:/mixdown.wav"
Jos käyttäjä ANTAA tiedostopolun:
{"action": "analyze", "params": {"file": "C:/Music/projekti.wav"}, "message": "Analysoin tiedoston ja annan miksausneuvoja."}
`;

    // Lisää käyttäjän VST-pluginit - KAIKKI kategoriat
    const userPlugins = [];

    // RUMPU-VST:T - ENSIMMÄISENÄ JA NÄKYVÄSTI
    if (vstCategories.drums && vstCategories.drums.length > 0) {
        userPlugins.push(`*** RUMPU-VST:T: ${vstCategories.drums.join(', ')} *** → KÄYTÄ NÄITÄ kun luot rumpuja!`);
    }
    // INSTRUMENTTI-VST:T
    if (vstCategories.instruments && vstCategories.instruments.length > 0) {
        userPlugins.push(`*** INSTRUMENTIT/SYNTAT: ${vstCategories.instruments.join(', ')} *** → KÄYTÄ NÄITÄ pianolle/syntetisaattoreille!`);
    }

    if (vstCategories.amp && vstCategories.amp.length > 0) {
        userPlugins.push(`AMP-SIMULAATTORIT: ${vstCategories.amp.join(', ')}`);
    }
    if (vstCategories.distortion && vstCategories.distortion.length > 0) {
        userPlugins.push(`SÄRÖ/OVERDRIVE: ${vstCategories.distortion.join(', ')}`);
    }
    if (vstCategories.reverb && vstCategories.reverb.length > 0) {
        userPlugins.push(`REVERB: ${vstCategories.reverb.join(', ')}`);
    }
    if (vstCategories.delay && vstCategories.delay.length > 0) {
        userPlugins.push(`DELAY: ${vstCategories.delay.join(', ')}`);
    }
    if (vstCategories.compressor && vstCategories.compressor.length > 0) {
        userPlugins.push(`KOMPRESSORIT: ${vstCategories.compressor.join(', ')}`);
    }
    if (vstCategories.eq && vstCategories.eq.length > 0) {
        userPlugins.push(`EQ: ${vstCategories.eq.join(', ')}`);
    }
    if (vstCategories.other && vstCategories.other.length > 0) {
        userPlugins.push(`MUUT: ${vstCategories.other.slice(0, 30).join(', ')}`);
    }

    prompt += `\n=== KÄYTTÄJÄN VST-PLUGINIT ===\n`;

    // Rumpu-VST tila - KRIITTINEN TIETO
    if (!vstCategories.drums || vstCategories.drums.length === 0) {
        prompt += `⚠️ RUMPU-VST: EI ASENNETTUNA! Kun käyttäjä pyytää rumpuja → KERRO ENSIN että rumpu-VST puuttuu, suosittele MT Power Drum Kit (powerdrumkit.com) tai Steven Slate Drums Free (stevenslatedrums.com/ssd5free), anna asennusohjeet, luo silti raita+MIDI.\n`;
    }
    // Instrumentti-VST tila
    if (!vstCategories.instruments || vstCategories.instruments.length === 0) {
        prompt += `⚠️ INSTRUMENTTI-VST: EI ASENNETTUNA! Pianoon/synthiin käytä ReaSynth tai suosittele LABS (labs.spitfireaudio.com), Vital (vital.audio), Keyzone Classic.\n`;
    }

    if (userPlugins.length > 0) {
        prompt += `KRIITTINEN: Käytä näitä plugineja add_fx:ssä fx_name-kentässä! Älä hallusinoi plugineja joita ei ole listalla.\n`;
        prompt += userPlugins.join('\n') + '\n';
    } else {
        prompt += `Käyttäjällä ei ole lisä-VST:tä. Käytä Reaperin omia (ReaEQ, ReaComp jne.)\n`;
    }

    // Ilmaiset VST-suositukset puuttuvien osalta
    prompt += `\n=== PUUTTUVIEN VST:IDEN NEUVONTA ===
Jos käyttäjä tarvitsee pluginia jota hänellä EI OLE:
1. Kerro mitä pluginia tarvittaisiin ja miksi
2. Suosittele ILMAISTA vaihtoehtoa:
   - Amp sim: Ignite Amps Emissary (igniteamps.com) - ilmainen
   - Rummut: MT Power Drum Kit (powerdrumkit.com) tai Steven Slate Drums Free (stevenslatedrums.com/ssd5free)
   - Synth: Vital (vital.audio) - ilmainen
   - Reverb: Valhalla Supermassive (valhalladsp.com) - ilmainen
   - Kompressori: TDR Kotelnikov (tokyodawn.net) - ilmainen
   - EQ: TDR Nova (tokyodawn.net) - ilmainen
3. Kerro mistä ladata (anna URL)
4. Kerro minne tallentaa: C:\\Program Files\\VSTPlugins (VST2) tai C:\\Program Files\\Common Files\\VST3 (VST3)
5. Muistuta: REAPER → Options → Preferences → Plug-ins → VST → Re-scan

=== REAGATE VAROITUS ===
ReaGaten Threshold PITÄÄ olla MATALA (0.05-0.15)! LIIAN KORKEA arvo estää KAIKEN äänen!
Gate-arvot: Threshold 0.05-0.15, Hold 0.02, Release 0.05, Attack 0.01.

=== EFEKTIEN OLETUSARVOT ===
SÄÄDÄ AINA efektien arvot genreen sopiviksi - ÄLÄ jätä oletusarvoja!
ReaComp jazz/pop: Ratio 0.2, Thresh 0.45 | metal/rock: Ratio 0.5, Thresh 0.4
ReaVerbate jazz: Mix 0.25, Room 0.6 | rock: Mix 0.15, Room 0.4
ReaEQ: Käytä inspect_fx → adjust_effect TARKOILLA parametrinimillä.
\n`;

    // Lisää artistitieto jos relevantti
    if (artistKnowledge && artistKnowledge.length > 100) {
        // Rajoita 1500 merkkiin ettei prompt kasva liikaa
        const truncated = artistKnowledge.substring(0, 1500);
        prompt += `\n=== ARTISTIN SOUNDIOHJE ===\n${truncated}\nKäytä tätä tietoa kun rakennat artistin soundia. Lisää mainitut efektit add_fx-komennoilla.\n`;
    }

    // Lisää workflow knowledge jos relevantti (stem separation, podcast, jne.)
    if (workflowKnowledge && workflowKnowledge.length > 100) {
        const truncatedWf = workflowKnowledge.substring(0, 3000);
        prompt += `\n${truncatedWf}\nKäytä tätä tietoa vastauksessasi.\n`;
    }

    // Lisää studio setup knowledge jos relevantti (äänitys, interface, instrumentit)
    if (studioSetupKnowledge && studioSetupKnowledge.length > 100) {
        const truncatedSetup = studioSetupKnowledge.substring(0, 4000);
        prompt += `\n${truncatedSetup}\n`;
    }

    // Lisää käyttäjän studio setup
    if (studioSetup) {
        prompt += `\n=== KÄYTTÄJÄN STUDIO SETUP ===\n${studioSetup}\n
ÄÄNITYSTILANTEISSA:
1. Käytä yllä olevaa studio setup -tietoa antaaksesi HENKILÖKOHTAISIA ohjeita
2. Kysy MITÄ käyttäjä haluaa äänittää (kitara, basso, laulu, koskettimet)
3. Anna gain staging -ohjeet käyttäjän OMALLE interfacelle ja instrumentille
4. Suosittele amp simeja käyttäjän genren ja instrumentin mukaan\n`;
    }

    prompt += `\n=== REAPER ===\n${reaperInfo.connected ? `Yhteys OK. Versio: ${reaperInfo.reaper_version || 'Unknown'}\n${reaperInfo.track_list || 'Ei raitoja'}` : 'Ei yhteyttä'}

SÄÄNNÖT:
1. Vastaa AINA JSON:lla, ei koodia tai selityksiä ulkopuolella
2. Käytä TARKKOJA plugin-nimiä: ReaEQ, ReaComp, ReaVerbate, ReaTune (EI "efekti" tai "eq")
3. Kun käyttäjä pyytää soundia, luo raita JA lisää efektit JA SÄÄDÄ niiden arvot samassa vastauksessa
4. KRIITTINEN: Kun lisäät efektejä add_fx:llä, SÄÄDÄ AINA niiden arvot adjust_effect:llä SAMASSA vastauksessa! Älä jätä efektejä oletusarvoihin. Esim. jazz-kitaraan lisätty ReaVerbate → säädä heti: mix 0.3, roomsize 0.6, dampening 0.7
5. Anna hyödyllisiä neuvoja message-kentässä
5. Jos käyttäjä pyytää poistamaan, käytä track_delete (EI create_track)
6. KRIITTINEN RUMPUSÄÄNTÖ: Rumpukomppi/rummut = AINA näin:
   a) ENSIN tarkista käyttäjän VST-listasta onko rumpu-VST (MT Power Drum Kit, Steven Slate Drums, Sitala, EZDrummer, Superior Drummer, Addictive Drums)
   b) Jos rumpu-VST LÖYTYY: create_track + add_fx (rumpu-VST) + create_midi_pattern (preset)
   c) Jos rumpu-VST EI LÖYDY: create_track + create_midi_pattern (preset) + message-kentässä SELKEÄT ohjeet: mitä pluginia suositellaan, latauslinkki, asennusohjeet, Re-scan REAPER
   d) Ilman MIDI-patternia raidassa EI OLE nuotteja! Ilman rumpu-VST:tä ei kuulu ääntä!
   e) ÄLÄ KOSKAAN luo rumpuraitaa ilman create_midi_pattern -komentoa!
7. KRIITTINEN PIANOSÄÄNTÖ: Piano/kosketinsoitin = AINA näin:
   a) create_track + create_chord (tai create_midi_pattern nuoteilla) SAMASSA vastauksessa
   b) ÄLÄ KOSKAAN luo tyhjää pianoraitaa ilman nuotteja!
   c) Jos käyttäjä ei kerro mitä sointuja haluaa → KYSY tarkentavia kysymyksiä (genre, sointukierto, tempo) message-kentässä
   d) Jos genre on selvä kontekstista → ehdota sopivaa sointukiertoa ja luo se suoraan
   e) Tuetut soinnut: Cmaj, Cm, C7, Cmaj7, Cm7, Cdim, Caug, Csus2, Csus4 (kaikki sävellajit)
8. MUISTA: create_midi_pattern presetit: basic_rock, metal, funk, jazz, pop. Käytä AINA preset-patternia kun käyttäjä pyytää rumpuja/komppia/drumeja. ÄLÄ KOSKAAN yritä luoda pitkiä custom MIDI-nuottilistoja rumpuihin - käytä preset! Presetit luovat automaattisesti oikean mittaisen patternin.
9. KRIITTINEN: "viritin"/"tuner"/"viritys" = AINA add_fx + fx_name: "ReaTune". Ei koskaan "viritin" suoraan fx_name-kentässä!
10. KRIITTINEN: Tarkista AINA käyttäjän VST-listasta löytyykö pyydetty plugin ENNEN kuin kerrot ettei sitä ole. Käytä TARKKAA nimeä listasta fx_name-kentässä.
11. Jos käyttäjällä EI OLE tarvittavaa pluginia, neuvoo message-kentässä: mikä plugin, mistä lataa (URL), minne tallentaa, ja miten skannata REAPERissä.`;

    return prompt;
}

async function buildHuoltoSystemPrompt() {
    const reaperInfo = await getCachedReaperInfo();
    const bridgePath = mcpClient ? mcpClient.getBridgeDataPath() : 'N/A';
    const mcpStatus = mcpClient && mcpClient.connected ? 'Yhdistetty ✓' : 'Ei yhteyttä ✗';
    const reaperStatus = reaperInfo.connected ? 'Toimii ✓' : 'Ei yhteyttä ✗';

    // API-avainten tila
    const apiKeyStatus = {
        groq: apiKeys.groq ? 'Asetettu ✓' : 'Puuttuu ✗',
        google: apiKeys.google ? 'Asetettu ✓' : 'Puuttuu ✗',
        openrouter: apiKeys.openrouter ? 'Asetettu ✓' : 'Puuttuu ✗'
    };

    // Lataa huolto-knowledge tiedostosta
    let huoltoKnowledge = '';
    try {
        const huoltoKnowledgePath = path.join(KNOWLEDGE_PATH, 'huolto/hipare-guide.md');
        if (fs.existsSync(huoltoKnowledgePath)) {
            huoltoKnowledge = fs.readFileSync(huoltoKnowledgePath, 'utf-8');
        }
    } catch (err) {
        console.error('Huolto knowledge lataus epäonnistui:', err.message);
    }

    return `Olet Hipare-sovelluksen HUOLTO ja NEUVONTA -assistentti. Nimesi on Hipare-huolto.
Autat käyttäjää sovelluksen käytössä, vianmäärityksessä ja asetusten hallinnassa.
ET tee REAPER-komentoja tässä keskustelussa - ohjaat käyttäjän tekemään ne itse tai avaamaan uuden musiikkikeskustelun.

Vastaa AINA suomeksi, ystävällisesti ja selkeästi. Käytä konkreettisia ohjeita ja polkuja.
Ole kärsivällinen - käyttäjä voi olla täysin aloittelija niin musiikissa kuin tietokoneissakin.

═══════════════════════════════════════
JÄRJESTELMÄN NYKYTILA (KÄYTÄ NÄITÄ!)
═══════════════════════════════════════
- MCP Server: ${mcpStatus}
- REAPER-yhteys: ${reaperStatus}
- Bridge-tyyppi: MCP + Lua (tiedostopohjainen)
- Bridge_data: ${bridgePath}
- MCP-profiili: ${CONFIG.MCP_PROFILE}
- API-avaimet:
  • Groq: ${apiKeyStatus.groq}
  • Google Gemini: ${apiKeyStatus.google}
  • OpenRouter: ${apiKeyStatus.openrouter}

KÄYTÄ NÄITÄ TILATIETOJA AKTIIVISESTI VASTAUKSISSA! Esim:
- "Näen että REAPER-yhteys toimii" tai "REAPER-yhteyttä ei ole - käydään läpi vianmääritys"
- "Groq API-avain on asetettu" tai "Groq-avain puuttuu - tässä ohjeet sen hankkimiseen"

═══════════════════════════════════════
KÄYTTÄJÄN REAPER-POLUT
═══════════════════════════════════════
- REAPER-kansio: ${CONFIG.REAPER_PATH}
- Lua bridge: ${CONFIG.REAPER_PATH}\\Scripts\\mcp_bridge.lua
- Bridge data: ${bridgePath || CONFIG.REAPER_PATH + '\\\\Scripts\\\\mcp_bridge_data'}

═══════════════════════════════════════
KATTAVA HUOLTO-OPAS
═══════════════════════════════════════
${huoltoKnowledge}

═══════════════════════════════════════
VASTAUSOHJEET
═══════════════════════════════════════
- Vastaa AINA suomeksi, selkeästi ja ystävällisesti
- Aloita vastaus AINA tarkistamalla järjestelmän tila (yhteys, API-avaimet) ja mainitse havainnot
- Anna vaihe-vaiheelta -ohjeita numeroiduilla listoilla
- Käytä konkreettisia polkuja ja tarkkoja REAPER-valikon nimiä
- Jos käyttäjä kysyy miten tehdä musiikkia tai antaa REAPER-komentoja: "Avaa uusi musiikkikeskustelu klikkaamalla '+ Uusi keskustelu' sivupalkista!"
- Jos et tiedä vastausta, myönnä se rehellisesti - älä keksi
- Jos käyttäjä mainitsee virheilmoituksen, pyydä häntä kopioimaan tarkka virheilmoitus
- Muista: käyttäjä voi olla ensikertalainen - selitä termit tarvittaessa (esim. "DI = Direct Input, eli kitaran puhdas signaali")`;
}

// ============================================
// AI API CALLS
// ============================================
async function callGoogleGemini(messages, retryCount = 0) {
    const MAX_RETRIES = 3;
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationHistory = messages.filter(m => m.role !== 'system');

    // Määritellään DSL-työkalut Geminille
    const tools = [{
        functionDeclarations: [
            {
                name: "create_track",
                description: "Luo uusi raita Reaperiin",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Raidan nimi" },
                        role: { type: "string", description: "Raidan rooli (bass, drums, vocal, keys, guitar, etc.)" }
                    },
                    required: ["name"]
                }
            },
            {
                name: "rename_track",
                description: "Nimeä raita uudelleen",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "number", description: "Raidan indeksi (0, 1, 2...)" },
                        name: { type: "string", description: "Uusi nimi" }
                    },
                    required: ["track", "name"]
                }
            },
            {
                name: "set_volume",
                description: "Säädä raidan äänenvoimakkuutta",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "number", description: "Raidan indeksi" },
                        volume: { type: "string", description: "Äänenvoimakkuus (esim. '-6dB', '+3dB')" }
                    },
                    required: ["track", "volume"]
                }
            },
            {
                name: "set_mute",
                description: "Mykistä raita (mute=true) tai poista mykistys (mute=false)",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "number", description: "Raidan indeksi (0-pohjainen)" },
                        mute: { type: "boolean", description: "true=mykistä, false=poista mykistys" }
                    },
                    required: ["track", "mute"]
                }
            },
            {
                name: "add_fx",
                description: "Lisää efekti/plugin raidalle (esim. ReaEQ, ReaComp, ReaVerbate, Keyzone Classic)",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "number", description: "Raidan indeksi (0-pohjainen)" },
                        fx_name: { type: "string", description: "Efektin tarkka nimi (esim. ReaEQ, ReaComp)" }
                    },
                    required: ["track", "fx_name"]
                }
            },
            {
                name: "set_pan",
                description: "Säädä raidan panorointia (vasemmalle/oikealle)",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "number", description: "Raidan indeksi" },
                        pan: { type: "number", description: "Panorointi: -1.0 (vasen) - 0 (keski) - 1.0 (oikea)" }
                    },
                    required: ["track", "pan"]
                }
            },
            {
                name: "create_midi_pattern",
                description: "Luo MIDI-rumpupattern raidalle. HUOM: track on NUMERO (indeksi), ei raidan nimi!",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "integer", description: "Raidan indeksi NUMERONA: 0=ensimmäinen, 1=toinen, jne." },
                        preset: { type: "string", enum: ["basic_rock", "metal", "funk", "jazz", "pop"], description: "Preset-tyyppi" }
                    },
                    required: ["track", "preset"]
                }
            },
            {
                name: "play",
                description: "Aloita toisto",
                parameters: { type: "object", properties: {} }
            },
            {
                name: "stop",
                description: "Pysäytä toisto",
                parameters: { type: "object", properties: {} }
            },
            {
                name: "list_tracks",
                description: "Listaa kaikki raidat projektissa",
                parameters: { type: "object", properties: {} }
            },
            {
                name: "list_fx",
                description: "Listaa raidan kaikki efektit ja niiden tila (enabled/bypass)",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi tai numero (esim. 'Oma soitto' tai '2')" }
                    },
                    required: ["track"]
                }
            },
            {
                name: "inspect_fx",
                description: "Näytä efektin KAIKKI parametrit ja niiden nykyarvot. Käytä AINA ennen adjust_effect-komentoa.",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi (esim. 'Oma soitto')" },
                        effect: { type: "string", description: "Efektin nimi tai osa nimestä (esim. 'Emissary', 'ReaEQ', 'TSE 808')" }
                    },
                    required: ["track", "effect"]
                }
            },
            {
                name: "adjust_effect",
                description: "Säädä efektin yksittäistä parametria. TÄRKEÄÄ: Käytä inspect_fx ensin parametrien nimien selvittämiseen!",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi (esim. 'Oma soitto')" },
                        effect: { type: "string", description: "Efektin nimi (esim. 'Emissary', 'ReaEQ')" },
                        setting: { type: "string", description: "Parametrin TARKKA nimi inspect_fx:stä (esim. 'LeadGain', 'Freq-Band 1')" },
                        value: { type: "number", description: "Arvo välillä 0.0-1.0 (normalisoitu)" }
                    },
                    required: ["track", "effect", "setting", "value"]
                }
            },
            {
                name: "get_track_info",
                description: "Hae raidan koko tila: volume, pan, efektilista",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi" }
                    },
                    required: ["track"]
                }
            },
            {
                name: "set_tempo",
                description: "Aseta projektin tempo",
                parameters: {
                    type: "object",
                    properties: {
                        bpm: { type: "number", description: "Tempo BPM:nä (esim. 120, 140)" }
                    },
                    required: ["bpm"]
                }
            },
            {
                name: "get_tempo_info",
                description: "Hae projektin nykyinen tempo ja tahtilaji",
                parameters: {
                    type: "object",
                    properties: {}
                }
            },
            {
                name: "set_time_signature",
                description: "Aseta projektin tahtilaji",
                parameters: {
                    type: "object",
                    properties: {
                        numerator: { type: "integer", description: "Iskuja per tahti (esim. 3, 4, 5, 6, 7)" },
                        denominator: { type: "integer", description: "Nuottiarvo per isku (4 = neljäsosanuotti, 8 = kahdeksasosa)" }
                    },
                    required: ["numerator", "denominator"]
                }
            },
            {
                name: "create_chord",
                description: "Luo yksittäinen sointu MIDI-nuotteina raidalle",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi" },
                        chord: { type: "string", description: "Sointumerkintä: C, Cm, G7, Am7, Dmaj7, Fsus4 jne." },
                        start: { type: "number", description: "Aloituskohta tahdeissa (0 = alku)" },
                        duration: { type: "number", description: "Kesto tahdeissa (oletus 4)" },
                        velocity: { type: "integer", description: "MIDI velocity 0-127 (oletus 80)" }
                    },
                    required: ["track", "chord"]
                }
            },
            {
                name: "chord_progression",
                description: "Luo kokonainen sointukierto raidalle automaattisesti. SUOSI TÄTÄ yksittäisten create_chord-kutsujen sijaan!",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi" },
                        progression: { type: "string", description: "Soinnut väliviivalla: Am-F-C-G tai Dm7-G7-Cmaj7-Am7" },
                        duration_per_chord: { type: "number", description: "Tahdin kesto per sointu (oletus 4)" },
                        bars: { type: "integer", description: "Kokonaiskesto tahdeissa. Aseta 32 = 4 kierrosta. VÄHINTÄÄN 16!" }
                    },
                    required: ["track", "progression"]
                }
            },
            {
                name: "midi_insert",
                description: "Lisää MIDI-nuotteja OLEMASSA OLEVAAN raitaan. Käytä tätä kun haluat jatkaa tai lisätä nuotteja käyttäjän aloittamaan komppiin.",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi" },
                        notes: {
                            type: "array",
                            description: "Nuotit arrayina",
                            items: {
                                type: "object",
                                properties: {
                                    pitch: { type: "integer", description: "MIDI pitch (36=kick, 38=snare, 42=hihat, 60=C4)" },
                                    start: { type: "number", description: "Aloituskohta tahdeissa" },
                                    duration: { type: "number", description: "Kesto tahdeissa" },
                                    velocity: { type: "integer", description: "Voimakkuus 0-127" }
                                }
                            }
                        }
                    },
                    required: ["track", "notes"]
                }
            },
            {
                name: "set_color",
                description: "Aseta raidan väri",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi" },
                        color: { type: "string", description: "Väri: red, blue, green, yellow, purple, orange, cyan, pink" }
                    },
                    required: ["track", "color"]
                }
            },
            {
                name: "track_delete",
                description: "Poista raita tai kaikki raidat",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi tai 'all' poistaa kaikki" }
                    },
                    required: ["track"]
                }
            },
            {
                name: "effect_bypass",
                description: "Kytke efekti päälle tai pois (bypass)",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi" },
                        effect: { type: "string", description: "Efektin nimi" },
                        bypass: { type: "boolean", description: "true=ohita, false=käytössä" }
                    },
                    required: ["track", "effect", "bypass"]
                }
            },
            {
                name: "analyze",
                description: "Analysoi WAV-tiedosto ja anna miksausneuvoja. Jos ei tiedostopolkua, ohjeista renderöimään.",
                parameters: {
                    type: "object",
                    properties: {
                        file: { type: "string", description: "WAV-tiedoston polku (esim. C:/Music/mixdown.wav)" },
                        genre: { type: "string", description: "Genre-konteksti analyysille (metal, jazz, pop jne.)" }
                    }
                }
            },
            {
                name: "set_solo",
                description: "Aseta raidan solo päälle/pois",
                parameters: {
                    type: "object",
                    properties: {
                        track: { type: "string", description: "Raidan nimi" },
                        solo: { type: "boolean", description: "true=solo, false=ei soloa" }
                    },
                    required: ["track", "solo"]
                }
            },
            {
                name: "mastering_chain",
                description: "Luo genreen sopiva masterointiketju master-raidalle",
                parameters: {
                    type: "object",
                    properties: {
                        genre: { type: "string", description: "Genre: pop, rock, metal, jazz, electronic jne." }
                    },
                    required: ["genre"]
                }
            }
        ]
    }];

    // Muodosta Gemini-viestit
    const geminiContents = [];

    // Lisää system prompt ensimmäiseen viestiin
    if (systemMessage) {
        geminiContents.push({
            role: "user",
            parts: [{ text: systemMessage.content }]
        });
        geminiContents.push({
            role: "model",
            parts: [{ text: "Ymmärsin. Olen studioasiantuntija ja käytän työkaluja." }]
        });
    }

    // Lisää keskusteluhistoria
    conversationHistory.forEach(msg => {
        geminiContents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        });
    });

    try {
        const response = await axios.post(API_CONFIG.gemini.url, {
            contents: geminiContents,
            tools: tools,
            toolConfig: { functionCallingConfig: { mode: "AUTO" } }
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        });

        console.log('🔍 Gemini raw response:', JSON.stringify(response.data, null, 2).substring(0, 1000));

        const candidate = response.data.candidates?.[0];
        if (!candidate) throw new Error('Ei vastausta Geminilta');

        // Tarkista MALFORMED_FUNCTION_CALL - yritä parsia finishMessage
        if (candidate.finishReason === 'MALFORMED_FUNCTION_CALL' && candidate.finishMessage) {
            console.log('⚠️ Gemini malformed function call, yritetään parsia:', candidate.finishMessage);
            // Palauta finishMessage tekstinä, jotta parseAllCommands voi käsitellä sen
            return candidate.finishMessage;
        }

        // Gemini 2.5 voi palauttaa useita parts (thinking + vastaus)
        const parts = candidate.content?.parts || [];
        const part = parts.find(p => p.text || p.functionCall) || parts[0];
        if (!part) throw new Error('Tyhjä vastaus Geminilta');

        // Tarkista onko functionCall
        if (part.functionCall) {
            const funcName = part.functionCall.name;
            const funcArgs = part.functionCall.args || {};

            console.log(`🤖 Gemini kutsui funktiota: ${funcName}`, funcArgs);

            // Palauta strukturoitu vastaus
            return JSON.stringify({
                _gemini_function_call: true,
                function: funcName,
                arguments: funcArgs
            });
        }

        // Normaali tekstivastaus
        if (part.text) {
            return part.text;
        }

        throw new Error('Ei vastausta Geminilta');
    } catch (error) {
        // Rate limit (429) - odota ja yritä uudelleen
        if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
            const waitTime = Math.pow(2, retryCount + 1) * 10000; // 20s, 40s, 80s
            console.log(`⏳ Gemini rate limit, odotetaan ${waitTime/1000}s ja yritetään uudelleen (${retryCount + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return callGoogleGemini(messages, retryCount + 1);
        }
        throw error;
    }
}

async function callOpenRouter(messages, modelKey) {
    const config = getModelConfig(modelKey);
    const response = await axios.post(config.url, {
        model: config.model, messages: messages, max_tokens: 2000, temperature: 0.7
    }, {
        headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': `http://localhost:${port}`,
            'X-Title': 'Hipare'
        },
        timeout: 60000
    });
    if (response.data.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
    }
    throw new Error('Ei vastausta OpenRouterilta');
}

async function callGroq(messages, modelKey, retryCount = 0) {
    const config = getModelConfig(modelKey);
    const MAX_RETRIES = 3;

    try {
        const response = await axios.post(config.url, {
            model: config.model,
            messages: messages,
            max_tokens: 4000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });
        if (response.data.choices?.[0]?.message?.content) {
            return response.data.choices[0].message.content;
        }
        throw new Error('Ei vastausta Groqilta');
    } catch (error) {
        // Rate limit (429) - odota ja yritä uudelleen
        if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
            const waitTime = Math.pow(2, retryCount + 1) * 10000; // 20s, 40s, 80s
            console.log(`⏳ Rate limit, odotetaan ${waitTime/1000}s ja yritetään uudelleen (${retryCount + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return callGroq(messages, modelKey, retryCount + 1);
        }
        throw error;
    }
}

// ============================================
// HELPERS
// ============================================
function createAutoTitle(message) {
    const words = message.trim().replace(/\s+/g, ' ').split(' ');
    return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
}

function updateConversationTitleIfNeeded(conversationId, message) {
    return new Promise((resolve) => {
        db.get(`SELECT title FROM conversations WHERE id = ?`, [conversationId], (err, row) => {
            if (err || !row) return resolve(false);
            if (['Uusi keskustelu', 'New conversation'].includes(row.title)) {
                const autoTitle = createAutoTitle(message);
                db.run(`UPDATE conversations SET title = ? WHERE id = ? AND title != 'Huolto'`, [autoTitle, conversationId], () => resolve(true));
            } else {
                resolve(false);
            }
        });
    });
}

function isHuoltoConversation(conversationId) {
    return new Promise((resolve) => {
        db.get(`SELECT title, pinned FROM conversations WHERE id = ?`, [conversationId], (err, row) => {
            resolve(!err && row && row.title === 'Huolto' && row.pinned === 1);
        });
    });
}

// ============================================
// API ROUTES
// ============================================
app.get('/api/test', (req, res) => {
    res.json({ status: 'OK', message: 'Hipare backend running!', version: '5.1' });
});

app.get('/api/vst-plugins', (req, res) => {
    const plugins = getVSTPlugins();
    res.json({ plugins, count: plugins.length });
});

app.get('/api/vst-categories', (req, res) => {
    const plugins = getVSTPlugins();
    res.json(getVSTCategories(plugins));
});

app.get('/api/reaper-info', async (req, res) => {
    res.json(await getCachedReaperInfo());
});

app.get('/api/reaper-test', async (req, res) => {
    const health = await checkReaperHealth();
    res.json(health);
});

app.get('/api/mcp-status', async (req, res) => {
    try {
        const bridgeDataPath = mcpClient ? mcpClient.getBridgeDataPath() : null;
        const bridgeDirExists = bridgeDataPath ? fs.existsSync(bridgeDataPath) : false;

        const status = {
            mcp_connected: mcpClient && mcpClient.connected,
            mcp_process_running: mcpClient && mcpClient.process !== null,
            bridge_data_path: bridgeDataPath,
            bridge_dir_exists: bridgeDirExists,
            pending_requests: mcpClient ? mcpClient.pendingRequests.size : 0
        };

        // Tarkista onko Lua bridge ladattu (tarkista bridge_data kansio)
        if (bridgeDirExists) {
            const files = fs.readdirSync(bridgeDataPath);
            status.bridge_files_count = files.length;
            status.lua_bridge_loaded = files.length > 0;
        } else {
            status.lua_bridge_loaded = false;
            status.bridge_files_count = 0;
        }

        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MCP Tools List - Debug endpoint
app.get('/api/mcp-tools', async (req, res) => {
    try {
        if (!mcpClient || !mcpClient.connected) {
            return res.status(503).json({
                error: 'MCP ei ole yhdistetty',
                tools: []
            });
        }

        // Kutsu MCP:n tools/list metodia
        const result = await mcpClient.request({
            method: 'tools/list',
            params: {}
        });

        res.json({
            success: true,
            count: result.tools ? result.tools.length : 0,
            tools: result.tools || []
        });
    } catch (error) {
        console.error('❌ MCP tools list virhe:', error.message);
        res.status(500).json({
            error: error.message,
            tools: []
        });
    }
});

app.get('/api/studio-setup', async (req, res) => {
    res.json({ description: await getStudioSetup() });
});

app.post('/api/studio-setup', async (req, res) => {
    await saveStudioSetup(req.body.description || '');
    res.json({ success: true });
});

// ============================================
// SUORA KOMENTOTESTI - DEBUG ENDPOINT
// ============================================
app.post('/api/test-command', async (req, res) => {
    const { command, args } = req.body;

    if (!command) {
        return res.status(400).json({ error: 'command puuttuu' });
    }

    console.log(`\n🧪 TEST COMMAND: ${command}`, args);

    try {
        const result = await sendToReaper(command, args || {});
        console.log('🧪 TEST RESULT:', result);
        res.json(result);
    } catch (error) {
        console.error('🧪 TEST ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

// Suora MCP-työkalu kutsu (ohittaa sendToReaper mappauksen)
app.post('/api/mcp-call', async (req, res) => {
    const { tool, args } = req.body;

    if (!tool) {
        return res.status(400).json({ error: 'tool puuttuu' });
    }

    console.log(`\n🔧 DIRECT MCP CALL: ${tool}`, args);

    try {
        if (!mcpClient || !mcpClient.connected) {
            return res.status(503).json({ error: 'MCP ei ole yhdistetty' });
        }

        const result = await mcpClient.callTool(tool, args || {});
        console.log('🔧 MCP RESULT:', JSON.stringify(result, null, 2));
        res.json({
            success: !result.isError,
            output: result.content?.[0]?.text || result,
            raw: result
        });
    } catch (error) {
        console.error('🔧 MCP ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// AUDIO ANALYSIS API
// ============================================

/**
 * Analysoi renderöity audio Python-skriptillä
 */
app.post('/api/analyze-audio', async (req, res) => {
    const { wav_path, genre, track_name } = req.body;

    if (!wav_path) {
        return res.status(400).json({ error: 'wav_path puuttuu' });
    }

    try {
        const { spawn } = require('child_process');
        const pythonScript = path.join(__dirname, 'audio_analyzer.py');

        // Kutsu Python-skriptiä
        const python = spawn('python', [pythonScript, wav_path]);

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('Python error:', stderr);
                return res.status(500).json({ error: stderr || 'Python script failed' });
            }

            // Parsitaan JSON-osio vastauksesta
            try {
                const jsonMatch = stdout.match(/--- Raw JSON ---\n([\s\S]+)$/);
                if (jsonMatch) {
                    const analysis = JSON.parse(jsonMatch[1]);
                    res.json({
                        success: true,
                        analysis: analysis,
                        formatted: stdout.split('--- Raw JSON ---')[0].trim()
                    });
                } else {
                    res.json({
                        success: true,
                        raw_output: stdout
                    });
                }
            } catch (parseError) {
                res.json({
                    success: true,
                    raw_output: stdout
                });
            }
        });
    } catch (error) {
        console.error('Audio analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Pyydä Reaperia renderöimään ja analysoimaan
 */
app.post('/api/listen', async (req, res) => {
    const { target, genre } = req.body;
    // target: "project" | "selection" | "track:TrackName"

    try {
        if (!mcpClient || !mcpClient.connected) {
            return res.status(503).json({ error: 'MCP ei ole yhdistetty' });
        }

        // 1. Renderöi Reaperista
        console.log(`🎧 Kuuntelu alkaa: ${target || 'project'}`);

        // Käytä Reaper Action ID:tä renderöintiin
        // 40015 = Render project
        // 41716 = Render selected tracks to stems

        let renderResult;
        if (target === 'selection') {
            // Renderöi valittu alue
            renderResult = await mcpClient.callTool('execute_action', { action_id: 40015 });
        } else if (target?.startsWith('track:')) {
            // Solo track, render, unsolo
            const trackName = target.replace('track:', '');
            await mcpClient.callTool('dsl_track_solo', { track: trackName, solo: true });
            renderResult = await mcpClient.callTool('execute_action', { action_id: 40015 });
            await mcpClient.callTool('dsl_track_solo', { track: trackName, solo: false });
        } else {
            // Renderöi koko projekti
            renderResult = await mcpClient.callTool('execute_action', { action_id: 40015 });
        }

        res.json({
            success: true,
            message: 'Renderöinti aloitettu. Avaa Reaperin renderöinti-ikkuna ja valitse kohde.',
            target: target || 'project',
            genre: genre,
            note: 'Renderöinnin jälkeen voit analysoida tiedoston /api/analyze-audio endpointilla.'
        });

    } catch (error) {
        console.error('Listen error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Settings API
app.get('/api/settings', async (req, res) => {
    const bridgeDir = await getSetting('bridge_dir') || (mcpClient ? mcpClient.getBridgeDataPath() : null);
    const mcpProfile = await getSetting('mcp_profile') || CONFIG.MCP_PROFILE;
    const reaperPath = await getSetting('reaper_path') || CONFIG.REAPER_PATH;
    res.json({
        bridge_dir: bridgeDir,
        mcp_profile: mcpProfile,
        reaper_path: reaperPath
    });
});

app.post('/api/settings', async (req, res) => {
    const { bridge_dir, mcp_profile, selected_models, reaper_path } = req.body;
    if (bridge_dir) {
        await saveSetting('bridge_dir', bridge_dir);
        CONFIG.REAPER_MCP_BRIDGE_DIR = bridge_dir;
    }
    if (mcp_profile) {
        await saveSetting('mcp_profile', mcp_profile);
        CONFIG.MCP_PROFILE = mcp_profile;
    }
    if (selected_models) {
        await saveSetting('selected_models', JSON.stringify(selected_models));
    }
    if (reaper_path) {
        await saveSetting('reaper_path', reaper_path);
        CONFIG.REAPER_PATH = reaper_path;
    }
    res.json({ success: true });
});

// API Keys Management
app.get('/api/api-keys', (req, res) => {
    const maskKey = (key) => {
        if (!key) return null;
        if (key.length <= 8) return '****';
        return key.substring(0, 4) + '...' + key.substring(key.length - 4);
    };
    res.json({
        groq: !!apiKeys.groq,
        google: !!apiKeys.google,
        openrouter: !!apiKeys.openrouter,
        groq_masked: maskKey(apiKeys.groq),
        google_masked: maskKey(apiKeys.google),
        openrouter_masked: maskKey(apiKeys.openrouter)
    });
});

app.post('/api/api-keys', async (req, res) => {
    try {
        const newKeys = req.body;
        const envPath = path.join(__dirname, '.env');

        // Read current .env
        let envContent = '';
        try {
            envContent = fs.readFileSync(envPath, 'utf8');
        } catch (e) {
            envContent = '';
        }

        // Parse existing .env into lines
        const lines = envContent.split('\n');
        const envMap = {};
        const lineOrder = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === '' || trimmed.startsWith('#')) {
                lineOrder.push(line);
                continue;
            }
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > 0) {
                const key = trimmed.substring(0, eqIdx);
                envMap[key] = trimmed.substring(eqIdx + 1);
                lineOrder.push(key);
            } else {
                lineOrder.push(line);
            }
        }

        // Update keys
        for (const [key, value] of Object.entries(newKeys)) {
            if (key.endsWith('_API_KEY') || key.endsWith('_KEY')) {
                envMap[key] = value;
                if (!lineOrder.includes(key)) {
                    lineOrder.push(key);
                }
            }
        }

        // Rebuild .env content
        const newEnvLines = lineOrder.map(item => {
            if (envMap[item] !== undefined) {
                return `${item}=${envMap[item]}`;
            }
            return item;
        });

        fs.writeFileSync(envPath, newEnvLines.join('\n'));
        console.log('API-avaimet päivitetty .env-tiedostoon');

        res.json({ success: true, message: 'API-avaimet tallennettu. Käynnistä palvelin uudelleen.' });
    } catch (error) {
        console.error('API-avainten tallennus epäonnistui:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Language API
app.get('/api/language', async (req, res) => {
    const lang = await getSetting('ui_language');
    res.json({ language: lang || 'fi' });
});

app.post('/api/language', async (req, res) => {
    const { language } = req.body;
    if (!['fi', 'en'].includes(language)) {
        return res.status(400).json({ error: 'Unsupported language' });
    }
    await saveSetting('ui_language', language);
    res.json({ success: true, language });
});

// Onboarding API
app.get('/api/onboarding-status', async (req, res) => {
    const done = await getSetting('onboarding_completed');
    res.json({ completed: done === 'true' });
});

app.post('/api/onboarding-complete', async (req, res) => {
    await saveSetting('onboarding_completed', 'true');
    res.json({ success: true });
});

app.post('/api/onboarding-reset', async (req, res) => {
    await saveSetting('onboarding_completed', 'false');
    res.json({ success: true });
});

// Model Management API
app.get('/api/available-models', async (req, res) => {
    const result = {
        openrouter: [],
        groq: [],
        google: []
    };

    // Hae OpenRouter mallit dynaamisesti
    if (apiKeys.openrouter) {
        try {
            const response = await axios.get('https://openrouter.ai/api/v1/models', {
                timeout: 10000
            });

            if (response.data?.data) {
                response.data.data
                    .sort((a, b) => {
                        // Järjestä: ilmaiset ensin, sitten halvimmat
                        const priceA = parseFloat(a.pricing?.prompt || 999);
                        const priceB = parseFloat(b.pricing?.prompt || 999);
                        return priceA - priceB;
                    })
                    .forEach(model => {
                        const pricingPerMToken = model.pricing?.prompt ?
                            parseFloat(model.pricing.prompt) * 1000000 : 0;

                        // Määritä ikoni mallin perusteella
                        let icon = '🤖';
                        if (model.id.includes('llama')) icon = '🦙';
                        else if (model.id.includes('claude') && model.id.includes('opus')) icon = '👑';
                        else if (model.id.includes('claude') && model.id.includes('sonnet')) icon = '🎨';
                        else if (model.id.includes('claude') && model.id.includes('haiku')) icon = '⚡';
                        else if (model.id.includes('gemini') || model.id.includes('google')) icon = '🤖';
                        else if (model.id.includes('gpt-4')) icon = '🧠';
                        else if (model.id.includes('gpt-3.5')) icon = '💬';
                        else if (model.id.includes('mistral')) icon = '🌬️';

                        // HUOM: OpenRouter ":free" mallit EIVÄT ole oikeasti ilmaisia!
                        // Ne ovat erittäin halpoja mutta maksullisia.
                        // Vain Groq on oikeasti 100% ilmainen.
                        const isReallyFree = false; // OpenRouter ei ole koskaan ilmainen
                        const hasFreeSuffix = model.id.includes(':free');

                        // Tarkista onko mallilla tool calling -tuki
                        const hasToolcall = model.id.includes('llama-3') ||
                                           model.id.includes('claude') ||
                                           model.id.includes('gpt-4') ||
                                           model.id.includes('gpt-3.5') ||
                                           model.id.includes('gemini') ||
                                           model.id.includes('mixtral');

                        result.openrouter.push({
                            id: model.id,
                            name: model.name + (hasFreeSuffix ? ' (halpa)' : ''),
                            icon: icon,
                            context: model.context_length,
                            pricing: pricingPerMToken,
                            isFree: isReallyFree,  // EI KOSKAAN ilmainen
                            isLowCost: hasFreeSuffix || pricingPerMToken < 0.5,
                            hasToolcall: hasToolcall,
                            description: (model.description || '') + (hasFreeSuffix ? ' | HUOM: Ei oikeasti ilmainen!' : '')
                        });
                    });
            }
        } catch (error) {
            console.error('❌ OpenRouter API virhe:', error.message);
        }
    }

    // Hae Groq mallit dynaamisesti
    if (apiKeys.groq) {
        try {
            const response = await axios.get('https://api.groq.com/openai/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKeys.groq}` },
                timeout: 10000
            });

            if (response.data?.data) {
                response.data.data.forEach(model => {
                    let icon = '🤖';
                    if (model.id.includes('llama')) icon = '🦙';
                    else if (model.id.includes('mixtral')) icon = '🌀';
                    else if (model.id.includes('gemma')) icon = '💎';

                    // Tarkista onko mallilla tool calling -tuki
                    const hasToolcall = model.id.includes('llama-3') ||
                                       model.id.includes('mixtral') ||
                                       model.id.includes('gemma2');

                    result.groq.push({
                        id: model.id,
                        name: model.id,
                        icon: icon + ' ⚡',  // Groq on nopea
                        context: model.context_window || 8192,
                        pricing: 0,  // Groq on OIKEASTI ilmainen
                        isFree: true,  // Groq on 100% ilmainen
                        isLowCost: true,
                        hasToolcall: hasToolcall,
                        description: 'Groq - Nopea ja 100% ILMAINEN'
                    });
                });
            }
        } catch (error) {
            console.error('❌ Groq API virhe:', error.message);
        }
    }

    // Hae Google mallit dynaamisesti
    if (apiKeys.google) {
        try {
            const response = await axios.get(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeys.google}`,
                { timeout: 10000 }
            );

            if (response.data?.models) {
                response.data.models
                    .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
                    .forEach(model => {
                        // Kaikilla Gemini-malleilla on function calling -tuki
                        const hasToolcall = model.supportedGenerationMethods?.includes('generateContent');

                        result.google.push({
                            id: model.name,
                            name: model.displayName || model.name.replace('models/', ''),
                            icon: '🤖',
                            context: model.inputTokenLimit || 0,
                            pricing: 0,  // Google Free tier (rajoitettu)
                            isFree: true,  // Ilmainen tiettyyn rajaan asti
                            isLowCost: true,
                            hasToolcall: hasToolcall,
                            description: (model.description || '') + ' | Ilmainen (päivittäinen raja)'
                        });
                    });
            }
        } catch (error) {
            console.error('❌ Google API virhe:', error.message);
        }
    }

    res.json(result);
});

app.get('/api/selected-models', async (req, res) => {
    const selected = await getSetting('selected_models');
    let modelIds = [];

    if (!selected) {
        // Oletuksena Gemini-mallit ja Groq
        if (apiKeys.google) {
            modelIds.push('gemini-2.5-flash');  // Paras nopea
            modelIds.push('gemini-2.0-flash');  // Perus
        }
        if (apiKeys.groq) modelIds.push('llama-3.3-70b-versatile');
    } else {
        modelIds = JSON.parse(selected);
    }

    // Lisää metadata jokaiselle mallille
    const modelsWithMeta = modelIds.map(id => {
        const config = getModelConfig(id);
        return {
            id: id,
            name: config.name,
            icon: config.icon,
            description: config.description || '',
            quality: config.quality || 3,
            speed: config.speed || 3,
            cost: config.cost || 3,
            context: config.context || 'N/A'
        };
    });

    res.json(modelsWithMeta);
});

app.post('/api/selected-models', async (req, res) => {
    const { models } = req.body;
    if (!Array.isArray(models) || models.length === 0 || models.length > 5) {
        return res.status(400).json({ error: 'Valitse 1-5 mallia' });
    }
    await saveSetting('selected_models', JSON.stringify(models));
    res.json({ success: true });
});

// Conversations API
app.get('/api/conversations', (req, res) => {
    db.all(`SELECT id, title, model, pinned, created_at, genres FROM conversations ORDER BY pinned ASC, created_at DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.post('/api/conversations', (req, res) => {
    const { title, model, genres } = req.body;
    const genresJson = JSON.stringify(genres || []);
    db.run(`INSERT INTO conversations (title, model, genres) VALUES (?, ?, ?)`,
        [title || 'Uusi keskustelu', model || 'llama', genresJson],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                id: this.lastID,
                title: title || 'Uusi keskustelu',
                model: model || 'llama',
                genres: genres || [],
                pinned: 0
            });
        }
    );
});

// Päivitä keskustelun genrejä
app.put('/api/conversations/:id/genres', (req, res) => {
    const { genres } = req.body;
    const genresJson = JSON.stringify(genres || []);
    db.run(`UPDATE conversations SET genres = ? WHERE id = ?`, [genresJson, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, genres: genres || [] });
    });
});

app.put('/api/conversations/:id', (req, res) => {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Otsikko ei voi olla tyhja' });
    db.get(`SELECT pinned FROM conversations WHERE id = ?`, [req.params.id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Ei loytynyt' });
        if (row.pinned === 1) return res.status(403).json({ error: 'Ei voi nimetä lukittua' });
        db.run(`UPDATE conversations SET title = ? WHERE id = ?`, [title.trim(), req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

app.delete('/api/conversations/:id', (req, res) => {
    db.get(`SELECT pinned FROM conversations WHERE id = ?`, [req.params.id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Ei loytynyt' });
        if (row.pinned === 1) return res.status(403).json({ error: 'Ei voi poistaa lukittua' });
        db.run(`DELETE FROM conversations WHERE id = ?`, [req.params.id], () => {
            db.run(`DELETE FROM messages WHERE conversation_id = ?`, [req.params.id]);
            res.json({ success: true });
        });
    });
});

app.post('/api/conversations/:id/clear', (req, res) => {
    db.get(`SELECT title FROM conversations WHERE id = ?`, [req.params.id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Ei loytynyt' });
        if (row.title !== 'Huolto') return res.status(403).json({ error: 'Vain Huolto voidaan tyhjentaa' });
        db.run(`DELETE FROM messages WHERE conversation_id = ?`, [req.params.id], () => {
            res.json({ success: true });
        });
    });
});

app.get('/api/conversations/:id/messages', (req, res) => {
    db.all(`SELECT id, sender, content, model, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC`, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// ============================================
// COMMAND PARSING HELPERS
// ============================================

/**
 * Parsii KAIKKI komennot AI-vastauksesta
 * Palauttaa: [{ action: 'create_track', params: {...}, explanation: '...' }, ...]
 */
function parseAllCommands(aiResponse, isFreeModel) {
    const commands = [];

    // 1. STRICT JSON MODE: Yritä parsea JSON (array tai object)
    if (isFreeModel) {
        try {
            let jsonStr = aiResponse.trim();
            // Poista markdown-kääre
            if (jsonStr.startsWith('```json')) {
                jsonStr = jsonStr.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim();
            } else if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/```\s*\n?/g, '').replace(/```\s*$/g, '').trim();
            }

            // Tarkista onko useita JSON-objekteja rivinvaihdolla erotettuina
            // Esim: {"action": "a"}\n{"action": "b"}
            if (jsonStr.includes('}\n{') || jsonStr.includes('}\r\n{')) {
                const jsonObjects = jsonStr.split(/\}[\r\n]+\{/).map((s, i, arr) => {
                    if (i === 0) return s + '}';
                    if (i === arr.length - 1) return '{' + s;
                    return '{' + s + '}';
                });

                const multiCommands = [];
                let combinedMessage = '';

                for (const objStr of jsonObjects) {
                    try {
                        const obj = JSON.parse(objStr);
                        if (obj.action) {
                            multiCommands.push({
                                action: obj.action,
                                params: obj.params || {},
                                explanation: obj.message || ''
                            });
                            if (obj.message && !combinedMessage) combinedMessage = obj.message;
                        }
                    } catch (e) {
                        console.log('⚠️ Yksittäisen JSON-objektin parsinta epäonnistui:', e.message);
                    }
                }

                if (multiCommands.length > 0) {
                    console.log(`🔀 Yhdistettiin ${multiCommands.length} erillistä JSON-objektia`);
                    multiCommands._userMessage = combinedMessage;
                    return multiCommands;
                }
            }

            const parsed = JSON.parse(jsonStr);

            // Tarkista vastauksen tyyppi
            if (parsed.commands && Array.isArray(parsed.commands)) {
                // UUSI MUOTO: {"commands": [...], "message": "..."}
                parsed.commands.forEach(cmd => {
                    if (cmd.action) {
                        commands.push({
                            action: cmd.action,
                            params: cmd.params || {},
                            explanation: parsed.message || cmd.explanation || ''
                        });
                    }
                });
                // Tallenna message myöhempää käyttöä varten
                if (parsed.message && commands.length > 0) {
                    commands._userMessage = parsed.message;
                }
            } else if (Array.isArray(parsed)) {
                // Vanha array-muoto
                parsed.forEach(cmd => {
                    if (cmd.action) {
                        commands.push({
                            action: cmd.action,
                            params: cmd.params || {},
                            explanation: cmd.explanation || cmd.message || ''
                        });
                    }
                });
            } else if (parsed.action) {
                // Yksittäinen komento: {"action": ..., "message": "..."}
                commands.push({
                    action: parsed.action,
                    params: parsed.params || {},
                    explanation: parsed.message || parsed.explanation || ''
                });
            } else if (parsed.message && !parsed.action) {
                // Pelkkä keskustelu: {"message": "..."}
                // Palautetaan tyhjä commands-lista mutta message talteen
                commands._userMessage = parsed.message;
                console.log(`💬 Keskusteluvastaus: ${parsed.message.substring(0, 100)}...`);
                return commands; // Tyhjä lista, mutta message on tallessa
            }

            if (commands.length > 0) {
                console.log(`🎯 Strict JSON parsed: ${commands.length} komentoa`);
                return commands;
            } else if (commands._userMessage) {
                // Pelkkä message, ei komentoja
                return commands;
            }
        } catch (e) {
            console.log('⚠️ Strict JSON parse failed, trying text parsing:', e.message);
        }
    }

    // 2. TEKSTI-PARSINTA: Etsi kaikki "Komento: X Args: {...}" parit
    // Käytetään global flag (g) että löydetään kaikki
    const commandPattern = /Komento:\s*(\w+)\s*\n?Args?:\s*(\{[^\}]*\})/gi;
    let match;

    while ((match = commandPattern.exec(aiResponse)) !== null) {
        const commandName = match[1];
        const argsStr = match[2];

        try {
            const argsString = argsStr
                .replace(/(\w+):/g, '"$1":')
                .replace(/'/g, '"');
            const args = JSON.parse(argsString);

            commands.push({
                action: commandName,
                params: args,
                explanation: ''
            });

            console.log(`📋 Parsittu komento ${commands.length}: ${commandName}`, args);
        } catch (e) {
            console.log(`⚠️ Args-parsinta epäonnistui komennolle ${commandName}:`, e.message);
        }
    }

    if (commands.length > 0) {
        console.log(`✅ Löytyi ${commands.length} komentoa tekstistä`);
        return commands;
    }

    // 3. SUORA MUOTO: "create_track { ... }"
    const directPattern = /(create_track|rename_track|set_volume|set_mute|set_solo|set_color|add_fx|play|stop|list_tracks|list_fx|inspect_fx|adjust_effect|get_track_info|create_chord|chord_progression|create_midi_pattern|midi_insert|set_tempo|set_time_signature|get_tempo_info|get_tempo|effect_bypass|mastering_chain|analyze|track_delete|set_pan|pan)\s*(\{[^\}]*\})?/gi;

    while ((match = directPattern.exec(aiResponse)) !== null) {
        const commandName = match[1];
        const argsStr = match[2];

        let args = {};
        if (argsStr) {
            try {
                const argsString = argsStr
                    .replace(/(\w+):/g, '"$1":')
                    .replace(/'/g, '"');
                args = JSON.parse(argsString);
            } catch (e) {
                console.log(`⚠️ Args-parsinta epäonnistui:`, e.message);
            }
        }

        commands.push({
            action: commandName,
            params: args,
            explanation: ''
        });
    }

    if (commands.length > 0) {
        console.log(`✅ Löytyi ${commands.length} suoraa komentoa`);
    }

    return commands;
}

/**
 * Suorittaa komennot järjestyksessä ja palauttaa yhteenvedon
 */
async function executeCommandsSequentially(commands) {
    const results = [];

    // Kriittiset komennot joiden epäonnistuminen keskeyttää ketjun
    const criticalCommands = ['create_track', 'track_delete'];
    // Komennot jotka vaativat pidemmän viiveen (efektien lataus)
    const slowCommands = ['add_fx', 'add_plugin', 'mastering_chain'];

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        console.log(`🔧 Suoritetaan komento ${i + 1}/${commands.length}: ${cmd.action}`);

        const result = await sendToReaper(cmd.action, cmd.params);
        results.push({
            command: cmd.action,
            params: cmd.params,
            success: result.success,
            error: result.error,
            output: result.output,
            explanation: cmd.explanation
        });

        // Jos kriittinen komento epäonnistuu, keskeytä ketju
        if (!result.success && criticalCommands.includes(cmd.action)) {
            console.log(`❌ Kriittinen komento ${cmd.action} epäonnistui - ketju keskeytetään`);
            results.push({
                command: '__chain_aborted__',
                params: {},
                success: false,
                error: `Ketju keskeytettiin koska ${cmd.action} epäonnistui: ${result.error}`,
                explanation: `Onnistuneet komennot ennen keskeytystä: ${results.filter(r => r.success).map(r => r.command).join(', ') || 'ei mitään'}`
            });
            break;
        }

        // Viive komentojen välillä
        if (i < commands.length - 1) {
            const delay = slowCommands.includes(cmd.action) ? 500 : 300;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return results;
}

/**
 * Siivoa AI:n vastaus: poista komentoteksti ja tekninen kieli käyttäjän näkymästä.
 * Hipare on studio-asiantuntija, ei koodibotti.
 */
function cleanResponseForUser(text) {
    if (!text) return '';

    // Poista "Komento: xxx\nArgs: {...}" -rivit (molemmat muodot)
    let cleaned = text.replace(/Komento:\s*\w+\s*\n\s*Args:\s*\{[^}]*\}\s*\n?/g, '');

    // Poista JSON-lohkot {"action":..., "params":...}
    cleaned = cleaned.replace(/\{"action"\s*:\s*"[^"]*"\s*,\s*"params"\s*:\s*\{[^}]*\}[^}]*\}/g, '');

    // Poista {"commands": [...]} mutta säilytä message
    cleaned = cleaned.replace(/\{"commands"\s*:\s*\[[\s\S]*?\]\s*,?\s*"message"\s*:\s*"([^"]*)"\s*\}/g, '$1');

    // Poista koodiblokkit ```json ... ```
    cleaned = cleaned.replace(/```json\s*[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/```\s*[\s\S]*?```/g, '');

    // Poista JSON-arrayt nuottidataa (MIDI notes): [{"pitch":..., ...}]
    cleaned = cleaned.replace(/\[\s*\{\s*"pitch"\s*:\s*\d+[\s\S]*?\}\s*\]/g, '');

    // Poista yksittäiset JSON-objektit jotka sisältävät pitch/start/duration/velocity
    cleaned = cleaned.replace(/\{\s*"pitch"\s*:\s*\d+[^}]*\}/g, '');

    // Poista rivit jotka näyttävät JSON key-value -pareilta (esim , { "pitch": 42, "start": 0.25 })
    cleaned = cleaned.replace(/,?\s*\{\s*"[a-z_]+"\s*:\s*[^}]+\}/g, '');

    // Poista JSON-komennot kuten {"action": "midi_insert", ...}
    cleaned = cleaned.replace(/\{"[a-z_]+"\s*:\s*"[^"]*"[^}]*\}/g, '');

    // Poista ylimääräiset pilkut, sulkeet ja välilyönnit
    cleaned = cleaned.replace(/[\[\]{}]/g, '');
    cleaned = cleaned.replace(/,\s*,/g, ',');

    // Poista ylimääräiset tyhjät rivit
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

    // Jos jäljelle ei jää järkevää tekstiä, palauta geneerinen viesti
    if (cleaned.length < 5 || cleaned.match(/^[\s,.:!?]*$/)) {
        return '';
    }

    return cleaned;
}

/**
 * Luo käyttäjälle näkyvän yhteenvedon komentojen tuloksista
 * Muotoilee vastaukset luonnollisiksi lauseiksi, ei teknisiksi checksummoiksi
 */
function formatCommandResults(results) {
    if (results.length === 0) return "Tehty! 👍";

    // Debug: tulosta tulokset
    console.log('📊 formatCommandResults:', JSON.stringify(results, null, 2));

    // Ryhmittele komennot tyypin mukaan
    const tracksCreated = results.filter(r => r.success && r.command === 'create_track');
    const fxAdded = results.filter(r => r.success && r.command === 'add_fx');
    const volumeSet = results.filter(r => r.success && r.command === 'set_volume');
    const colorSet = results.filter(r => r.success && r.command === 'set_color');
    const tracksRenamed = results.filter(r => r.success && r.command === 'rename_track');
    const otherSuccessful = results.filter(r => r.success && !['create_track', 'add_fx', 'set_volume', 'set_color', 'rename_track'].includes(r.command));
    const failed = results.filter(r => !r.success);

    let summary = "";

    // Raitojen luonti
    if (tracksCreated.length > 0) {
        if (tracksCreated.length === 1) {
            const trackName = tracksCreated[0].params?.name || 'raita';
            summary += `Loin raidan "${trackName}". `;
        } else {
            summary += `Loin ${tracksCreated.length} raitaa. `;
        }
    }

    // Nimeäminen
    if (tracksRenamed.length > 0) {
        const newName = tracksRenamed[0].params?.name || 'uusi nimi';
        summary += `Nimesin raidan nimellä "${newName}". `;
    }

    // Efektit
    if (fxAdded.length > 0) {
        const fxNames = fxAdded.map(f => f.params?.fx_name || 'efekti').join(', ');
        if (fxAdded.length === 1) {
            summary += `Lisäsin efektin: ${fxNames}. `;
        } else {
            summary += `Lisäsin ${fxAdded.length} efektiä: ${fxNames}. `;
        }
    }

    // Äänenvoimakkuus
    if (volumeSet.length > 0) {
        summary += `Säädin äänenvoimakkuutta. `;
    }

    // Väritys
    if (colorSet.length > 0) {
        const color = colorSet[0].params?.color || 'väri';
        summary += `Väritin raidan (${color}). `;
    }

    // Muut onnistuneet - käyttäjäystävälliset viestit
    if (otherSuccessful.length > 0) {
        otherSuccessful.forEach(r => {
            const cmd = r.command;
            if (cmd === 'play') summary += `Toisto aloitettu. `;
            else if (cmd === 'stop') summary += `Toisto pysäytetty. `;
            else if (cmd === 'list_tracks') summary += `Raidat listattu. `;
            else if (cmd === 'mute' || cmd === 'set_mute') summary += `Mykistys asetettu. `;
            else if (cmd === 'solo' || cmd === 'set_solo') summary += `Solo asetettu. `;
            else if (cmd === 'pan' || cmd === 'set_pan' || cmd === 'track_pan') summary += `Panorointi säädetty. `;
            else if (cmd === 'create_midi_pattern') summary += `MIDI-pattern luotu. `;
            else if (cmd === 'create_chord') summary += `Sointu luotu. `;
            else if (cmd === 'delete_track' || cmd === 'track_delete') summary += `Raita poistettu. `;
            else if (cmd === 'adjust_effect' || cmd === 'adjust_fx') {
                const effect = r.params?.effect || 'efekti';
                const setting = r.params?.setting || 'parametri';
                const value = r.params?.value || '';
                summary += `Säädin ${effect} ${setting} → ${value}. `;
            }
            else if (cmd === 'effect_bypass') {
                const effect = r.params?.effect || 'efekti';
                const bypass = r.params?.bypass ? 'ohitettu' : 'käytössä';
                summary += `${effect} ${bypass}. `;
            }
            else summary += `${r.explanation || cmd}. `;
        });
    }

    // Virheet
    if (failed.length > 0) {
        summary += `\n\n⚠️ ${failed.length} toimintoa epäonnistui:\n`;
        failed.forEach(r => {
            summary += `- ${humanizeError(r.error)}\n`;
        });
    }

    return summary.trim() || "Tehty! 👍";
}

// ============================================
// MAIN MESSAGE HANDLER
// ============================================
app.post('/api/messages', async (req, res) => {
    let { conversation_id, message, model } = req.body;
    if (!conversation_id || !message || !model) {
        return res.status(400).json({ error: 'Puuttuvia tietoja' });
    }

    // Tarkista analyysitila
    let analyzeModeActive = false;
    if (message.startsWith('[ANALYZE_MODE] ')) {
        analyzeModeActive = true;
        message = message.replace('[ANALYZE_MODE] ', '');
        console.log('🎧 Analyysitila aktiivinen');
    }

    try {
        // Tallenna käyttäjän viesti (ilman [ANALYZE_MODE] prefixiä)
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO messages (conversation_id, sender, content, model) VALUES (?, 'user', ?, ?)`,
                [conversation_id, message, model], (err) => err ? reject(err) : resolve());
        });

        await updateConversationTitleIfNeeded(conversation_id, message);

        // Hae historia
        const history = await new Promise((resolve, reject) => {
            db.all(`SELECT sender, content FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 10`,
                [conversation_id], (err, rows) => err ? reject(err) : resolve(rows || []));
        });
        history.reverse();

        const isHuolto = await isHuoltoConversation(conversation_id);
        const modelConfig = getModelConfig(model);

        // Hae keskustelun genret
        const conversationGenres = await new Promise((resolve, reject) => {
            db.get(`SELECT genres FROM conversations WHERE id = ?`, [conversation_id], (err, row) => {
                if (err) return reject(err);
                try {
                    const genres = row?.genres ? JSON.parse(row.genres) : [];
                    resolve(genres);
                } catch (e) {
                    resolve([]);
                }
            });
        });

        // Get user's language preference
        const userLang = await getSetting('ui_language') || 'fi';

        // Määritä system prompt mallin mukaan
        let systemPrompt;
        const isFreeModel = modelConfig.type === 'groq' ||
                           (modelConfig.type === 'openrouter' && modelConfig.model.includes(':free'));

        if (isHuolto) {
            systemPrompt = await buildHuoltoSystemPrompt();
        } else if (isFreeModel) {
            systemPrompt = await buildStrictJSONPrompt(message);
            console.log(`🎯 Using strict JSON prompt (free model: ${modelConfig.name})`);
        } else {
            systemPrompt = await buildMusicSystemPrompt(conversationGenres, message);
        }

        // Add language instruction based on user preference
        if (userLang === 'en') {
            const langPrefix = `LANGUAGE INSTRUCTION: The user's interface language is English. You MUST respond in English. Write all your messages, explanations, and descriptions in English. Use professional music production terminology in English. This overrides any Finnish language instructions below.\n\n`;
            systemPrompt = langPrefix + systemPrompt;
        }

        // Lisää analyysikonteksti jos analyysitila on päällä
        if (analyzeModeActive && !isHuolto) {
            const analyzeContext = userLang === 'en' ? `
=== 🎧 ANALYZE MODE ACTIVE ===
The user has activated analyze mode. You should:
1. LISTEN to the user's request and analyze what they want to do with audio
2. USE context memory - remember what we've discussed before and agreed mixing goals
3. EXECUTE commands in long sequences - don't just create one track, do complete mixing operations
4. If the user asks to analyze audio, use the analyze command on WAV files
5. WE ARE MIXING - take concrete actions: add effects, adjust levels, pan, create new tracks as needed

IMPORTANT: Use multiple commands in the same response! For mixing you can:
- Add multiple effects at once (EQ + compressor + reverb)
- Adjust multiple parameters
- Create aux tracks (reverb bus, parallel compression)
- Pan and adjust levels

Don't create a new track every time - use existing tracks if they suit the task!
` : `
=== 🎧 ANALYYSITILA AKTIIVINEN ===
Käyttäjä on aktivoinut analyysitilan. Sinun tulee:
1. KUUNNELLA käyttäjän pyyntöä ja analysoida mitä he haluavat tehdä audiolle
2. HYÖDYNTÄÄ kontekstimuistia - muista mitä olemme aiemmin keskustelleet ja sovitut miksaustavoitteet
3. TOTEUTTAA komentoja pitkissä sarjoissa - älä luo vain yhtä raitaa, vaan tee kokonaisia miksausoperaatioita
4. Jos käyttäjä pyytää analysoimaan audiota, käytä analyze-komentoa WAV-tiedostolle
5. OLEMME MIKSAAMASSA - tee konkreettisia toimia: lisää efektejä, säädä tasoja, panoroi, luo uusia raitoja tarvittaessa

TÄRKEÄÄ: Käytä useita komentoja samassa vastauksessa! Esim. miksaukseen voit:
- Lisätä useita efektejä kerralla (EQ + kompressori + reverb)
- Säätää useita parametreja
- Luoda apuraitoja (reverb bus, parallel compression)
- Panoroida ja säätää tasoja

Älä joka kerta luo uutta raitaa - käytä olemassa olevia raitoja jos ne sopivat tehtävään!
`;
            systemPrompt = systemPrompt + '\n' + analyzeContext;
        }

        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.content }))
        ];

        console.log(`\n🤖 Kutsutaan ${modelConfig.name}...`);

        let aiResponse;
        if (modelConfig.type === 'google') {
            aiResponse = await callGoogleGemini(apiMessages);
        } else if (modelConfig.type === 'groq') {
            aiResponse = await callGroq(apiMessages, model);
        } else {
            aiResponse = await callOpenRouter(apiMessages, model);
        }

        console.log('📝 AI vastaus:', aiResponse.substring(0, 500) + '...');
        logForCursor('ai_response', { model: model, raw: aiResponse.substring(0, 1000) });

        let userVisibleResponse = aiResponse;
        let codeExecuted = false;

        if (!isHuolto) {
            // GEMINI MULTI-TURN FUNCTION CALLING: Tukee useita peräkkäisiä tool-kutsuja
            if (modelConfig.type === 'google') {
                try {
                    const parsed = JSON.parse(aiResponse);
                    if (parsed._gemini_function_call) {
                        const MAX_TURNS = 8; // Maksimi 8 peräkkäistä function call -kierrosta
                        let turnCount = 0;
                        let currentResponse = parsed;
                        let allResults = [];
                        let finalTextResponse = '';

                        // Rakennetaan Gemini-keskusteluhistoria function call -silmukkaa varten
                        const geminiLoop = [...apiMessages];

                        while (currentResponse._gemini_function_call && turnCount < MAX_TURNS) {
                            turnCount++;
                            const command = currentResponse.function;
                            const args = currentResponse.arguments || {};
                            console.log(`🎯 Gemini function call ${turnCount}/${MAX_TURNS}: ${command}`, JSON.stringify(args));

                            // Suorita komento
                            const commandResult = await sendToReaper(command, args);
                            codeExecuted = true;

                            let resultText = '';
                            if (!commandResult.success) {
                                resultText = `Error: ${commandResult.error || 'Command failed'}`;
                            } else {
                                resultText = commandResult.output || commandResult.result || 'OK';
                            }

                            allResults.push({ command, args, success: commandResult.success, result: resultText });
                            console.log(`📥 Function result ${turnCount}: ${resultText.substring(0, 200)}`);

                            // Lisää function call ja tulos keskusteluun ja kutsu Geminiä uudelleen
                            geminiLoop.push({
                                role: 'assistant',
                                content: `[Function call: ${command}(${JSON.stringify(args)})]`
                            });
                            geminiLoop.push({
                                role: 'user',
                                content: `[Function result: ${resultText}]\n\nJatka tehtävää. Voit kutsua seuraavan työkalun tai antaa lopullisen vastauksen tekstinä.`
                            });

                            // Kutsu Geminiä uudelleen tulosten kanssa
                            try {
                                const nextResponse = await callGoogleGemini(geminiLoop);
                                try {
                                    const nextParsed = JSON.parse(nextResponse);
                                    if (nextParsed._gemini_function_call) {
                                        currentResponse = nextParsed;
                                        continue; // Jatka silmukkaa
                                    }
                                } catch (e) {
                                    // Ei JSON = tekstivastaus, silmukka päättyy
                                }
                                finalTextResponse = nextResponse;
                                break; // Gemini antoi tekstivastauksen, lopetetaan
                            } catch (e) {
                                console.log(`⚠️ Gemini multi-turn error at turn ${turnCount}:`, e.message);
                                finalTextResponse = `Suoritin ${turnCount} toimintoa. Viimeinen tulos: ${resultText}`;
                                break;
                            }
                        }

                        // Muodosta lopullinen vastaus
                        if (!finalTextResponse) {
                            // Saavutettiin maksimikierrokset
                            const successCount = allResults.filter(r => r.success).length;
                            finalTextResponse = `Suoritin ${successCount}/${allResults.length} toimintoa onnistuneesti.`;
                            for (const r of allResults) {
                                finalTextResponse += `\n${r.success ? '✅' : '❌'} ${r.command}: ${r.result.substring(0, 100)}`;
                            }
                        }

                        userVisibleResponse = finalTextResponse;
                        await getCachedReaperInfo(true);

                        // Tallenna vastaus ja palaa
                        await new Promise((resolve, reject) => {
                            db.run(`INSERT INTO messages (conversation_id, sender, content, model) VALUES (?, 'assistant', ?, ?)`,
                                [conversation_id, userVisibleResponse, model], (err) => err ? reject(err) : resolve());
                        });

                        return res.json({
                            response: userVisibleResponse,
                            codeExecuted: codeExecuted
                        });
                    }
                } catch (e) {
                    // Ei JSON tai ei function call, jatka normaaliin parseemiseen
                    console.log('💭 Ei Gemini function call, parsitaan tekstinä');
                }
            }

            // PARSII KAIKKI KOMENNOT (tukee useita komentoja)
            const commands = parseAllCommands(aiResponse, isFreeModel);

            if (commands.length > 0) {
                console.log(`✅ Löytyi ${commands.length} komentoa, suoritetaan järjestyksessä...`);

                // Suorita kaikki komennot järjestyksessä
                const results = await executeCommandsSequentially(commands);
                codeExecuted = true;

                // MULTI-TURN TEXT LOOP: Lähetä tulokset takaisin AI:lle jatkotyöstöä varten
                const MAX_TEXT_TURNS = 4;
                let textTurnCount = 0;
                let continueLoop = results.some(r => r.success) && !isFreeModel; // Vain premium-malleille
                let loopMessages = [...apiMessages];

                // Lisää alkuperäinen vastaus ja tulokset
                loopMessages.push({ role: 'assistant', content: aiResponse.substring(0, 2000) });
                const resultSummary = results.map(r =>
                    `${r.success ? '✅' : '❌'} ${r.command}: ${(r.output || r.error || 'OK').substring(0, 300)}`
                ).join('\n');
                loopMessages.push({
                    role: 'user',
                    content: `[Komennot suoritettu. Tulokset:]\n${resultSummary}\n\n[Jatka tehtävää tulosten perusteella. Jos lisätoimia tarvitaan (esim. inspect_fx tai adjust_effect), kirjoita uudet komennot. Jos tehtävä on valmis, kirjoita pelkkä tekstivastaus ilman komentoja.]`
                });

                while (continueLoop && textTurnCount < MAX_TEXT_TURNS) {
                    textTurnCount++;
                    console.log(`🔄 Multi-turn text loop ${textTurnCount}/${MAX_TEXT_TURNS}...`);

                    try {
                        let nextAIResponse;
                        if (modelConfig.type === 'google') {
                            nextAIResponse = await callGoogleGemini(loopMessages);
                        } else if (modelConfig.type === 'openrouter') {
                            nextAIResponse = await callOpenRouter(loopMessages, model);
                        } else {
                            break; // Muu malli, ei jatkolooppia
                        }

                        const nextCommands = parseAllCommands(nextAIResponse, isFreeModel);

                        if (nextCommands.length > 0) {
                            console.log(`🔄 Turn ${textTurnCount}: ${nextCommands.length} uutta komentoa`);
                            const nextResults = await executeCommandsSequentially(nextCommands);

                            loopMessages.push({ role: 'assistant', content: nextAIResponse.substring(0, 2000) });
                            const nextResultSummary = nextResults.map(r =>
                                `${r.success ? '✅' : '❌'} ${r.command}: ${(r.output || r.error || 'OK').substring(0, 300)}`
                            ).join('\n');
                            loopMessages.push({
                                role: 'user',
                                content: `[Tulokset:]\n${nextResultSummary}\n\n[Jatka tai anna lopullinen vastaus.]`
                            });

                            results.push(...nextResults);
                        } else {
                            // AI vastasi tekstillä = tehtävä valmis
                            console.log(`🔄 Turn ${textTurnCount}: AI vastasi tekstillä, loop päättyy`);
                            if (nextCommands._userMessage || nextAIResponse.length > 10) {
                                userVisibleResponse = nextCommands._userMessage || nextAIResponse;
                            }
                            continueLoop = false;
                        }
                    } catch (e) {
                        console.log(`⚠️ Multi-turn text error at turn ${textTurnCount}:`, e.message);
                        continueLoop = false;
                    }
                }

                // Käytä AI:n omaa message-kenttää jos se on olemassa
                if (!userVisibleResponse && commands._userMessage) {
                    userVisibleResponse = commands._userMessage;
                } else if (!userVisibleResponse) {
                    // Muuten luo yhteenveto tuloksista
                    userVisibleResponse = formatCommandResults(results);
                }

                // Päivitä cache jos joku komento onnistui
                if (results.some(r => r.success)) {
                    await getCachedReaperInfo(true); // forceRefresh
                }
            } else if (commands._userMessage) {
                // Pelkkä keskusteluvastaus, ei komentoja
                console.log('💬 AI vastasi keskustelulla (ei komentoja)');
                userVisibleResponse = commands._userMessage;

                // Hallusinaatiotunnistus: AI väittää tehneensä jotain mutta ei antanut komentoa
                const hallucinationPatterns = /muutin tahtilajin|vaihdoin tahtilajin|asetin tahtilajin|tahtilaji on nyt|muutin tempon|asetin tempon|tempo on nyt|changed time signature|set time signature|changed tempo|set tempo/i;
                if (hallucinationPatterns.test(userVisibleResponse)) {
                    console.log('🚨 HALLUSINAATIO HAVAITTU: AI väitti muuttaneensa tempoa/tahtilajia ilman komentoa!');
                    userVisibleResponse += '\n\n⚠️ Huom: En pystynyt toteuttamaan pyyntöä - yritä uudelleen tai anna komento tarkemmin (esim. "Aseta tahtilaji 5/4 komennolla set_time_signature").';
                }
            } else {
                // Ei komentoja eikä viestiä - AI vastasi vain tekstillä
                console.log('⚠️ Ei DSL-komentoa vastauksessa (AI vastasi vain tekstillä)');
                // Kokeillaan parsia message JSON:sta
                try {
                    const parsed = JSON.parse(aiResponse.trim().replace(/```json\s*\n?/g, '').replace(/```\s*$/g, ''));
                    if (parsed.message) {
                        userVisibleResponse = parsed.message;
                    }
                } catch (e) {
                    // Jätetään alkuperäinen vastaus
                }

                // Hallusinaatiotunnistus myös pelkälle tekstille
                const hallucinationPatterns2 = /muutin tahtilajin|vaihdoin tahtilajin|asetin tahtilajin|tahtilaji on nyt|muutin tempon|asetin tempon|tempo on nyt/i;
                if (hallucinationPatterns2.test(userVisibleResponse || aiResponse)) {
                    console.log('🚨 HALLUSINAATIO HAVAITTU: AI väitti muuttaneensa tempoa/tahtilajia ilman komentoa!');
                    userVisibleResponse = (userVisibleResponse || aiResponse) + '\n\n⚠️ Huom: En pystynyt toteuttamaan pyyntöä - yritä uudelleen tai anna komento tarkemmin (esim. "Aseta tahtilaji 5/4 komennolla set_time_signature").';
                }
            }
        }

        // Siivoa vastaus: poista komentoteksti käyttäjän näkymästä
        userVisibleResponse = cleanResponseForUser(userVisibleResponse.trim()) || "Tehty!";

        // Tallenna AI vastaus
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO messages (conversation_id, sender, content, model) VALUES (?, 'ai', ?, ?)`,
                [conversation_id, userVisibleResponse, model], (err) => err ? reject(err) : resolve());
        });

        res.json({ success: true, response: userVisibleResponse, model, code_executed: codeExecuted });

    } catch (error) {
        console.error('❌ Virhe:', error.message);
        res.status(500).json({ success: false, error: humanizeError(error.message) });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// START
// ============================================
async function startServer() {
    try {
        // 1. Alusta tietokanta
        await initializeDatabase();

        // 2. Käynnistä MCP client
        console.log('Käynnistetään MCP server...');
        const mcpServerPath = path.join(__dirname, 'total-reaper-mcp', 'total-reaper-mcp-main');
        mcpClient = new MCPClient(CONFIG.PYTHON_PATH, mcpServerPath, CONFIG.MCP_PROFILE);

        try {
            await mcpClient.start();
            console.log('✅ MCP Server käynnissä');

            // Initialize MCP protocol
            console.log('Alustetaan MCP-protokolla...');
            await mcpClient.initialize();
            console.log('✅ MCP-protokolla alustettu');

            // Anna MCP:lle hetki aikaa valmistua
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('❌ MCP käynnistys epäonnistui:', error.message);
            console.log('⚠️ Jatketaan ilman MCP:tä (offline-tila)');
        }

        // 3. Käynnistä HTTP-palvelin ensin
        const vstPlugins = getVSTPlugins();

        app.listen(port, async () => {
            console.log(`
╔══════════════════════════════════════════════════════╗
║  HIPARE v1.0 MCP EDITION                             ║
╠══════════════════════════════════════════════════════╣
║  URL: http://localhost:${port}                         ║
║  MCP: ${mcpClient && mcpClient.connected ? 'Yhdistetty ✅' : 'Ei yhteytta ❌'}                          ║
║  VST: ${String(vstPlugins.length).padEnd(4)} pluginia                              ║
╚══════════════════════════════════════════════════════╝
            `);

            // 4. Tarkista Reaper taustalla
            setTimeout(async () => {
                try {
                    const reaperStatus = await checkReaperHealth();
                    if (reaperStatus.connected) {
                        console.log('✅ Reaper yhdistetty:', reaperStatus.track_count, 'raitaa');
                    } else {
                        console.log('⚠️ Reaper:', reaperStatus.error);
                    }
                } catch (err) {
                    console.log('⚠️ Reaper check epäonnistui');
                }
            }, 500);
        });
    } catch (error) {
        console.error('Kaynnistys epaonnistui:', error.message);
        process.exit(1);
    }
}

// Siisti sammutus
process.on('SIGINT', async () => {
    console.log('\n\nSuljetaan Hipare...');
    if (mcpClient) {
        console.log('Suljetaan MCP client...');
        await mcpClient.stop();
    }
    console.log('Näkemiin! 👋');
    process.exit(0);
});

startServer();