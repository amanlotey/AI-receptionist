import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranscript } from "../context/TranscriptContext";
import { useAudioRecorder } from "../context/AudioRecorderContext";
import { audioFormatForCodec, applyCodecPreferences } from "../utils/codecUtils";
import { logMessage, saveSummary } from "./supabaseLogger";

export function useRealtimeSession(scenario: "pizza" | "retail" = "pizza") {
  const [isConnected, setIsConnected] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const sessionId = useRef<string>(uuidv4());
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const { startRecording, stopRecording, downloadRecording } = useAudioRecorder();
  const { addTranscript, finalizeTranscript, clearTranscripts } = useTranscript();

  const addLog = (text: string, color = "#0af") => {
    console.log(`%c${text}`, `color:${color};font-weight:bold;`);
    setLog((prev) => [...prev, text]);
  };

  useEffect(() => {
    const audioEl = new Audio();
    audioEl.autoplay = true;
    audioRef.current = audioEl;
  }, []);

  // 🚀 Start Chat
  const startChat = async () => {
    try {
      clearTranscripts();
      addLog("🔑 Requesting ephemeral key from backend...", "yellow");

      const res = await fetch(`http://localhost:8080/session?scenario=${scenario}`);
      const data = await res.json();
      const ek = data.client_secret?.value;
      if (!ek) throw new Error("Invalid ephemeral key response");

      const codec = "opus";
      const audioFormat = audioFormatForCodec(codec);
      addLog(`🎧 Codec: ${codec} → Format: ${audioFormat}`, "lime");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = localStream;
      for (const track of localStream.getTracks()) pc.addTrack(track, localStream);

      const remoteStream = new MediaStream();
      pc.ontrack = (event) => {
        event.streams[0].getAudioTracks().forEach((t) => remoteStream.addTrack(t));
        if (audioRef.current) audioRef.current.srcObject = remoteStream;
      };

      applyCodecPreferences(pc, codec);

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onmessage = async (event) => {
        if (!event.data) return;
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        addLog(`📨 Event: ${msg.type}`, "#0af");

        if (msg.type === "conversation.item.input_audio_transcription.delta" && msg.delta)
          addTranscript("user", msg.delta, true);

        if (
          msg.type === "conversation.item.input_audio_transcription.completed" &&
          msg.transcript
        ) {
          finalizeTranscript("user", msg.transcript);
          await logMessage(sessionId.current, "user", msg.transcript);
        }

        if (msg.type === "response.audio_transcript.delta" && msg.delta)
          addTranscript("assistant", msg.delta, true);

        if (msg.type === "response.audio_transcript.done" && msg.transcript) {
          finalizeTranscript("assistant", msg.transcript);
          await logMessage(sessionId.current, "agent", msg.transcript);
        }

        if (msg.type === "response.content_part.added" && msg.content?.[0]?.text) {
          const text = msg.content[0].text;
          finalizeTranscript("assistant", text);
          await logMessage(sessionId.current, "agent", text);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ek}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );

      const answerSdp = await response.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      await startRecording(remoteStream);
      addLog("🎙️ Recording started", "lime");
      addLog("✅ Connected via WebRTC to GPT-4o Realtime", "lime");

      setIsConnected(true);
    } catch (err) {
      console.error("❌ startChat error:", err);
      addLog(`❌ ${err}`, "red");
    }
  };

  // 🛑 End Chat
  const endChat = async () => {
    try {
      stopRecording();
      addLog("🛑 Recording stopped", "orange");

      dcRef.current?.close();
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }

      setIsConnected(false);
      addLog("🛑 Chat ended", "orange");

      addLog("🧠 Generating conversation summary...", "yellow");
      const res = await fetch(
        `http://localhost:8080/api/summary?sessionId=${sessionId.current}`
      );
      if (!res.ok) {
        const err = await res.text();
        addLog("❌ Summary generation failed", "red");
        console.error(err);
        return;
      }

      const data = await res.json();
      addLog(`✅ Summary saved: ${data.summary}`, "lime");
      await saveSummary(sessionId.current, data.summary);
    } catch (err) {
      console.error("❌ endChat error:", err);
      addLog(`❌ ${err}`, "red");
    }
  };

  return { isConnected, startChat, endChat, downloadRecording, log };
}
