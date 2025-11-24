# Honey – AI Voice Study Buddy (Browser Voice + LLM)

<div align="center">
  <img src="/Assets/honey_logo.png" alt="Honey Logo" width="400"/>
</div>

Honey is a small web app that acts as a voice‑first AI "study buddy" for students.

You can talk to Honey in your browser, and she replies out loud in English (Indian style).  
She helps you manage tasks, run focus timers, and generate study plans, while also chatting like a slightly sassy but supportive friend.

---

## Features

- **Voice Conversation**
  - Talk to Honey using your microphone (Web Speech API).
  - She replies with speech (browser `speechSynthesis`) + chat bubbles.
  - Voice selector to choose from available system voices (tries to default to an Indian‑style female voice).

- **Tasks / To‑Do List**
  - Add tasks by voice or via the UI.
  - Mark tasks as done by clicking them.
  - Clear all tasks at once via button or voice.
  - Example voice commands:
    - `Add task finish physics assignment`
    - `Show my tasks`
    - `Clear my tasks`
  - Tasks are stored in `localStorage` so they persist in the browser.

- **Study Timer (Focus Mode)**
  - 25‑minute focus timer with start/stop buttons.
  - Can also start/stop by voice:
    - `Start timer`
    - `Stop timer`
  - Honey announces when focus starts and when time is up.

- **Study Plan Generation**
  - Honey can create day‑by‑day study plans for upcoming exams using an LLM.
  - You tell her your exam, timeframe, and available hours; she returns a concrete plan.
  - The latest plan is saved in `localStorage` so it stays after refresh.

- **Personality**
  - Female Indian assistant called **Honey**.
  - Friendly, playful, a bit flirty and teasing, but safe and supportive.
  - Speaks casual Indian English ("yaar", "arre", etc.).

---

## Tech Stack

- **Frontend**
  - HTML, CSS, vanilla JavaScript
  - Web Speech API (`SpeechRecognition`) for speech‑to‑text
  - `speechSynthesis` for text‑to‑speech
  - `localStorage` for tasks and the last study plan

- **Backend**
  - Node.js + Express
  - Single `/api/chat` endpoint that calls the LLM

- **LLM**
  - [Groq](https://console.groq.com/) API
  - Model: `llama-3.1-8b-instant` (can be changed)

- **Deployment**
  - Hosted as a Node web service on [Render](https://render.com/)
  - Environment variable `GROQ_API_KEY` configured on Render for the Groq API

---

## Project Structure

```text
.
├── Assets/
│   ├── honey_logo.png     # Honey logo for README
│   └── preview.png        # Screenshot used in the README
│
├── public/
│   ├── index.html         # UI layout (chat + tasks + timer + plan)
│   ├── style.css          # Styling (dark, minimal, black/grey)
│   └── script.js          # Frontend logic (voice, chat, tasks, timer, plan)
│
├── index.js               # Node.js server (Express + Groq API call)
├── package.json           # Dependencies and start script
└── README.md              # This file
```

Express serves static files from `public/` and explicitly sends `public/index.html` for `/`.

---

## Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/broskell/honey-voice-buddy.git
cd honey-voice-buddy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Groq API key

1. Create an account at [Groq](https://console.groq.com/).
2. Go to **API Keys** → **Create API Key**.
3. Copy your key (starts with `gsk_...`).
4. The server reads the key from an environment variable called `GROQ_API_KEY`.

#### Option A – Set environment variable (recommended)

**macOS / Linux (bash / zsh):**

```bash
export GROQ_API_KEY="gsk_your_real_key_here"
npm start
```

**Windows PowerShell:**

```powershell
$env:GROQ_API_KEY="gsk_your_real_key_here"
npm start
```

#### Option B – (Only for quick local testing)

You can temporarily hard‑code your key in `index.js` instead of `process.env.GROQ_API_KEY`, but **never commit that or push it to GitHub**.

**Important:** Never commit your real key to a public repo.  
Keep `process.env.GROQ_API_KEY` in Git and only set the key via env vars locally or on Render.

### 4. Start the server

```bash
npm start
# or
node index.js
```

By default it runs on `http://localhost:3000`.

### 5. Open the app

Open your browser at:

```
http://localhost:3000
```

- Allow microphone permission when asked.
- Try talking to Honey or typing in the chat box.

---

## Example Things to Say

- **Conversation:**
  - `Honey, how are you today?`
  - `Roast me for procrastinating, but motivate me after that.`
  - `I'm feeling lazy today, convince me to study.`

- **Tasks:**
  - `Add task finish math homework`
  - `Show my tasks`
  - `Clear my tasks`

- **Timer:**
  - `Start timer`
  - `Stop timer`

- **Study plan:**
  - `Honey, I have a physics exam in 7 days, make a study plan.`

---

## Deployment Notes (Render)

High‑level steps used to deploy this app:

1. Push the code to GitHub (`broskell/honey-voice-buddy`).
2. On Render, create a **New Web Service**:
   - Connect the GitHub repo.
   - Set:
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** Free
3. In the service **Environment** tab, add:
   - **Key:** `GROQ_API_KEY`
   - **Value:** `gsk_...` (your real Groq key, no quotes)
4. Deploy. Render runs `index.js`, which serves the frontend from `public/` and exposes `/api/chat`.
5. Share the Render URL (e.g. `https://honey-voice-buddy.onrender.com`) as the live demo.

---

## Screenshots

### Main Interface
![Main Interface](/Assets/preview.png)

The app features:

- **Left panel:** Chat interface with voice controls
- **Right panel:** Tasks, Study Timer, and Study Plan sections
- Clean black, white, and grey aesthetic
- Responsive design for mobile and desktop

---

## Notes

- This project is meant as a learning / portfolio piece: browser voice + LLM + simple productivity tools.
- The UI is intentionally minimal: dark, grey/black, inspired by modern AI interfaces.
- Feel free to fork it, change the persona, or add more tools (notes, calendar integration, etc.)

---

## Future Enhancements

- [ ] Add more voice commands (e.g. notes, mood tracking)
- [ ] Implement calendar integration
- [ ] Add note-taking feature
- [ ] Support for multiple languages
- [ ] Progress tracking for study plans
- [ ] Break reminders during focus sessions

---

## License

MIT License – feel free to use this project for learning or personal use.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Built with ❤️ by Kellampalli Saathvik (@broskell) for students who need a study buddy**