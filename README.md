# Hipare - AI Assistant for REAPER DAW

**Hipare** was born from a simple idea: what if you could just *tell* your DAW what you want to hear, and watch it happen in real time? Instead of clicking through menus and tweaking knobs, you describe the sound you're after in plain language — and Hipare makes it happen directly in your REAPER project, right before your eyes.

The name comes from our beloved dog's nickname. The heart shape in the logo is the shape of the heart marking on our Hippu's nose. Every good project needs a good companion. 🐕

> **⚠️ Disclaimer:** Hipare interacts directly with your REAPER projects and can create, modify, and delete tracks, effects, and other project data. While it is designed to be helpful, **always save your work before use**. The authors are not responsible for any unintended changes to your projects or files. Use at your own discretion — and keep backups, just like any good producer would.

## Features

- **Natural Language Control** — Tell Hipare what you want in plain language: *"Add a warm pad with reverb"*, *"Make the drums punchier"*, *"Create a bass line in E minor"*
- **Multi-Model AI** — Choose between Google Gemini, Groq (Llama), and OpenRouter models depending on your needs and budget
- **Live REAPER Integration** — Changes happen in real time through the MCP bridge — watch tracks, effects, and MIDI appear as you chat
- **Drum Pattern Generation** — Describe a groove and get MIDI drum patterns created automatically
- **Audio Analysis** — Hipare can listen to your tracks and suggest improvements
- **VST Plugin Management** — Browse, search, and apply your installed VST plugins through conversation
- **Artist Knowledge System** — Reference artists and genres to guide the AI's creative decisions
- **Conversation History** — Pick up where you left off with persistent chat sessions
- **Studio Setup Profiles** — Tell Hipare about your gear and workflow for more relevant suggestions
- **Finnish & English UI** — Switch interface language from settings

## Prerequisites

- **Windows 10+**
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **REAPER 7+** — [Download](https://www.reaper.fm/)
- At least one API key (Groq is free to start)

## Installation (step by step)

### Step 1 — Clone the repository

```bash
git clone https://github.com/Hipare/Hipare-Reaper-agent.git
cd Hipare-Reaper-agent
```

### Step 2 — Install Node.js dependencies

```bash
npm install
```

### Step 3 — Install Python dependencies

```bash
pip install flask flask-cors
```

### Step 4 — Set up API keys

```bash
cp .env.example .env
```

Open `.env` in any text editor (Notepad works) and add at least one API key:

```env
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

| Key | Where to get it | Notes |
|-----|----------------|-------|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | Free tier available, fast Llama models |
| `GOOGLE_API_KEY` | [aistudio.google.com](https://aistudio.google.com/apikey) | Gemini models, good for complex tasks |
| `OPENROUTER_API_KEY` | [openrouter.ai](https://openrouter.ai/keys) | Access to many models, pay-per-use |

### Step 5 — Set up REAPER Lua bridge

This is the critical step that connects Hipare to REAPER:

1. **Open REAPER**
2. Go to **Actions → Show action list**
3. Click **"Load..."** in the bottom left
4. Navigate to the Hipare project folder and select:
   ```
   total-reaper-mcp/total-reaper-mcp-main/lua/mcp_bridge.lua
   ```
5. Click **"Run/Close"**
6. You should see in REAPER's console: **"REAPER MCP Bridge started"**

> **💡 Tip:** You need to run this Lua script every time you restart REAPER. You can add it to REAPER's startup actions to automate this — see REAPER documentation on "SWS Auto-start actions".

### Step 6 — Start the MCP server

Open a terminal in the project folder:

```bash
python -m total-reaper-mcp.total-reaper-mcp-main.server.app
```

### Step 7 — Start Hipare

Open another terminal in the project folder:

```bash
node server.js
```

### Step 8 — Open Hipare

Open your browser and go to:

```
http://localhost:3002
```

The onboarding wizard will guide you through the first-time setup.

## Quick start checklist

- [ ] Node.js installed
- [ ] Python installed
- [ ] REAPER open with a project
- [ ] Lua bridge running in REAPER (Step 5)
- [ ] MCP server running (Step 6)
- [ ] Hipare server running (Step 7)
- [ ] Browser open at localhost:3002

## Desktop App (optional)

If you want to run Hipare as a desktop application instead of in a browser, you need [Rust](https://rustup.rs/) installed. Then:

```bash
cd src-tauri
cargo tauri build
```

Pre-built Windows installers are available on the [Releases](https://github.com/Hipare/Hipare-Reaper-agent/releases) page. Note: the desktop app still requires Node.js and the server running in the background.

## Project Structure

```
Hipare-Reaper-agent/
├── server.js              # Main Express server & AI logic
├── reaper_bridge.py       # Python bridge for REAPER communication
├── audio_analyzer.py      # Audio analysis module
├── package.json           # Node.js dependencies
├── .env.example           # Environment variable template
├── public/                # Frontend web interface
│   ├── index.html
│   ├── locales/           # Finnish & English translations
│   ├── css/
│   └── js/
├── knowledge/             # Artist & genre reference data
├── total-reaper-mcp/      # MCP bridge & Lua scripts for REAPER
│   └── total-reaper-mcp-main/
│       └── lua/
│           └── mcp_bridge.lua  ← This runs inside REAPER
├── src-tauri/             # Tauri desktop app (optional)
└── LICENSES/              # Third-party licenses
```

## Credits & Acknowledgments

- REAPER MCP bridge based on [total-reaper-mcp](https://github.com/shiehn/total-reaper-mcp) by shiehn (MIT License) — modified for Hipare integration
- Background image by [Arnaud Girault](https://unsplash.com/@arnaudgirault) on [Unsplash](https://unsplash.com)
- Built with love and Hippu 🐕

## Support Development

If you find Hipare useful, consider supporting its development:

☕ [Buy Me a Coffee](https://buymeacoffee.com/hipare)

## Contact

📧 Feedback & questions: [hipare@proton.me](mailto:hipare@proton.me)

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

This project includes components from [total-reaper-mcp](https://github.com/shiehn/total-reaper-mcp) (MIT License) — see [LICENSES/total-reaper-mcp-MIT.txt](LICENSES/total-reaper-mcp-MIT.txt) for the original license.
