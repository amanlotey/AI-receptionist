export async function logMessage(sessionId: string, speaker: "user" | "agent", message: string) {
  try {
    await fetch("http://localhost:8080/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, speaker, message }),
    });
  } catch (err) {
    console.warn("⚠️ Log failed:", err);
  }
}

export async function saveSummary(sessionId: string, summary: string) {
  console.log("🧾 Summary already saved on backend for session:", sessionId);
}

