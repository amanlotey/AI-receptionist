import express from "express";
import { supabase } from "../index";

const router = express.Router();

router.post("/", async (req, res) => {
  const { sessionId, speaker, message } = req.body;

  if (!sessionId || !speaker || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // -------------------------------
  // 1. Try to find existing call
  // -------------------------------
  const { data: call, error: callError } = await supabase
    .from("calls")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (callError) {
    console.error("❌ Supabase error finding call:", callError);
    return res.status(500).json({ error: "DB error fetching call" });
  }

  let callId = call?.id;

  // -------------------------------
  // 2. Create new call if missing
  // -------------------------------
  if (!callId) {
    const { data: newCall, error: insertError } = await supabase
      .from("calls")
      .insert([{ session_id: sessionId, status: "Live" }])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Failed to create new call:", insertError);
      return res.status(500).json({ error: "Could not create call" });
    }

    callId = newCall.id;
  }

  // -------------------------------
  // 3. Insert transcript
  // -------------------------------
  const { error: transcriptError } = await supabase
    .from("transcripts")
    .insert([{ call_id: callId, speaker, text: message }]);

  if (transcriptError) {
    console.error("❌ Failed to insert transcript:", transcriptError);
    return res.status(500).json({ error: "Transcript insert failed" });
  }

  res.json({ success: true });
});

export default router;
