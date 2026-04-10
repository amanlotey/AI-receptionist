import express from "express";
import { supabase } from "../index";

const router = express.Router();

router.get("/", async (_req, res) => {
  const { data: calls, error } = await supabase
    .from("calls")
    .select("*, transcripts(text, speaker)")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(calls);
});

export default router;
