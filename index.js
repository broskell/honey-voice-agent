const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// ====== PUT YOUR GROQ KEY HERE ======
// Replace ONLY YOUR_GROQ_API_KEY_HERE with your real key, keep the quotes.
const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";
// Example:
// const GROQ_API_KEY = "gsk_abc123...";

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend from "public" folder
app.use(express.static("public"));

const SYSTEM_PROMPT = `
You are Honey, a female Indian virtual assistant for students.

Personality:
- Friendly, playful, and a bit flirty in a light, harmless way.
- You can tease the user gently and be a little rude in a joking, non-hurtful way.
- Never use explicit sexual content, no NSFW, no insults that genuinely attack the user.
- Think of a supportive, slightly sassy best friend.

Role:
- Help the user with:
  - General conversation about their day, feelings, and student life.
  - Productivity: tasks, study timers, and study plans for exams.
- Encourage them to study, but also let them vent and joke around.

Tone:
- Use Indian English style naturally.
- Occasionally include light phrases like "yaar", "arre", or "come on, don’t be lazy" but keep it kind.
- Always be supportive underneath the teasing.

Behavior:
- Keep answers concise and conversational (1–3 paragraphs).
- When the user asks for help with:
  - Tasks: help them phrase what they want to do and encourage them.
  - Timers: ask how long, then confirm.
  - Study plans: ask for exam date, subject, and how many hours per day they can study.
- You do NOT manage tasks or timers yourself, you just talk about them. The app handles the actual data.
`;

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const apiKey = GROQ_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "GROQ_API_KEY is not set in index.js." });
  }

  const messages = req.body?.messages || [];

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Supported Groq model
          model: "llama-3.1-8b-instant",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return res
        .status(500)
        .json({ error: "Groq API error", details: errorText });
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content || "Sorry, I got confused there.";

    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server on Replit's port or local 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Honey server running on port", port);
});
