import express from "express";
import fetch from "node-fetch";
import { supabase } from "../index"; // adjust path if needed

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    console.log("🧾 Generating summary for session:", sessionId);

    // Step 1: Find the call linked to this session
    const { data: callRecord, error: callError } = await supabase
      .from("calls")
      .select("id")
      .eq("session_id", sessionId)
      .single();

    if (callError || !callRecord) {
      console.error("❌ No matching call for session:", callError);
      return res
        .status(404)
        .json({ error: "No matching call found for sessionId" });
    }

    const callId = callRecord.id;

    // Step 2: Fetch all related transcripts
    const { data: logs, error: logsError } = await supabase
      .from("transcripts")
      .select("speaker, text, timestamp")
      .eq("call_id", callId)
      .order("timestamp", { ascending: true });

    if (logsError) {
      console.error("❌ Supabase fetch error:", logsError);
      return res
        .status(500)
        .json({ error: "Failed to fetch logs", details: logsError.message });
    }

    if (!logs || logs.length === 0) {
      return res
        .status(404)
        .json({ error: "No conversation found for this call" });
    }

    // Step 3: Build conversation text
    const conversation = logs
      .map((l) => `${l.speaker.toUpperCase()}: ${l.text}`)
      .join("\n");

    // Step 4: Ask OpenAI to summarize the conversation
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that writes concise, professional summaries (2 to 3 sentences max) of customer service or order conversations. Focus only on key actions, requests, and outcomes — no filler or repetition.",
          },
          {
            role: "user",
            content: `Summarize the following conversation:\n\n${conversation}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenAI summary error:", data);
      return res
        .status(500)
        .json({ error: "OpenAI summary failed", details: data });
    }

    const summary =
      data?.choices?.[0]?.message?.content || "No summary generated.";

    // Step 5: Save summary back to calls table
    await supabase
      .from("calls")
      .update({ summary, status: "Completed" })
      .eq("id", callId);

    console.log("✅ Summary saved to call:", callId);

    res.json({ sessionId, callId, summary });
  } catch (err: any) {
    console.error("⚠️ Summary route error:", err);
    res
      .status(500)
      .json({
        error: "Internal summary generation error",
        details: err.message,
      });
  }
});

export default router;
