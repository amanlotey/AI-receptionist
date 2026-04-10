"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRealtimeSession } from "../components/useRealtimeSession";
import ChatControls from "../components/ChatControls";
import LogPanel from "../components/LogPanel";
import { useTranscript } from "../context/TranscriptContext";

const VoiceAssistant: React.FC = () => {
  const [scenario, setScenario] = useState<"pizza" | "retail">("pizza");
  const { isConnected, startChat, endChat, log } = useRealtimeSession(scenario);
  const { transcripts } = useTranscript(); // ✅ User + AI transcripts

  // 🔄 Auto-scroll to bottom when new transcript added
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop =
        transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

  // 🔁 Ensure proper ordering: user → assistant
  const sortedTranscripts = [...transcripts].sort((a, b) => {
    if (a.createdAtMs !== b.createdAtMs) return a.createdAtMs - b.createdAtMs;
    if (a.role === "user" && b.role === "assistant") return -1;
    if (a.role === "assistant" && b.role === "user") return 1;
    return 0;
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="bg-neutral-900 text-white p-5 rounded-2xl shadow-2xl shadow-blue-500/20 max-w-md w-full">
        <h2 className="text-xl font-bold mb-3">🎙️ AI Receptionist</h2>

        {/* 👇 Mode Switch */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">Current Mode:</span>
          <select
            value={scenario}
            onChange={(e) =>
              setScenario(e.target.value as "pizza" | "retail")
            }
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-sm"
          >
            <option value="pizza"> Room Booking</option>
            <option value="retail">🛍️ Retail Support</option>
          </select>
        </div>

        {/* 🎤 Chat Controls */}
        <ChatControls
          isConnected={isConnected}
          startChat={startChat}
          endChat={endChat}
        />

        {/* 🗣️ Live Transcript Display */}
        <div
          ref={transcriptContainerRef}
          className="mt-6 space-y-4 max-h-72 overflow-y-auto border border-neutral-800 rounded-lg p-3 bg-neutral-950/50"
        >
          {sortedTranscripts.map((t) => (
            <div key={t.id} className="mb-2">
              <p
                className={`text-sm ${
                  t.role === "user" ? "text-blue-400" : "text-green-400"
                }`}
              >
                <strong>
                  {t.role === "user" ? "🎙️ You:" : "🤖 Assistant:"}
                </strong>{" "}
                {t.text}
                {t.partial && (
                  <span className="text-gray-500"> (listening…)</span>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* 🧾 Log Panel */}
        <LogPanel log={log} />
      </div>
    </div>
  );
};

export default VoiceAssistant;
