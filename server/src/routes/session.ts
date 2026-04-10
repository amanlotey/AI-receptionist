import express from "express";
import fetch from "node-fetch";
import { instructionsMap } from "../utils/Instructions";
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const scenario = _req.query.scenario || "pizza";
    const selectedInstructions =
      instructionsMap[scenario] || instructionsMap.pizza;

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-realtime",
          voice: "marin",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",

          modalities: ["audio", "text"],
          instructions: `
    ## Speaking Style
    - Speak calmly and clearly, about 15% slower than normal (≈ 0.5 × speed).
    - Keep responses short but complete.
    ## Language
    - Speak only in Arabic.
    ${selectedInstructions}
  `,

          // 🎧 Automatic speech-to-text
          input_audio_transcription: {
            model: "gpt-4o-mini-transcribe",
            language: "en",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenAI Realtime API error:", data);
      return res.status(500).json({ error: data });
    }

    res.json(data);
  } catch (err) {
    console.error("⚠️ Session error:", err);
    res.status(500).json({ error: "Internal session error" });
  }
});

export default router;
