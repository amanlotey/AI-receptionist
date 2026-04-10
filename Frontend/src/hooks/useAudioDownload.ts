import { useRef } from "react"
import { convertWebMBlobToWav } from "../../lib/audioUtils"

function useAudioDownload() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const startRecording = async (remoteStream: MediaStream) => {
    console.log("🎙️ [Recorder] Starting recording...")
    let micStream: MediaStream
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log("🎤 [Recorder] Microphone stream captured:", micStream.getTracks().length)
    } catch (err) {
      console.error("❌ [Recorder] Failed to get mic stream:", err)
      micStream = new MediaStream()
    }

    const audioContext = new AudioContext()
    const destination = audioContext.createMediaStreamDestination()

    try {
      const remoteSource = audioContext.createMediaStreamSource(remoteStream)
      remoteSource.connect(destination)
      console.log("🔊 [Recorder] Remote stream connected")
    } catch (err) {
      console.error("⚠️ [Recorder] Remote stream not valid:", err)
    }

    try {
      const micSource = audioContext.createMediaStreamSource(micStream)
      micSource.connect(destination)
      console.log("🎧 [Recorder] Mic stream connected")
    } catch (err) {
      console.error("⚠️ [Recorder] Mic stream not valid:", err)
    }

    const options = { mimeType: "audio/webm" }
    try {
      const mediaRecorder = new MediaRecorder(destination.stream, options)
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
          console.log("💾 [Recorder] Chunk added:", event.data.size, "bytes")
        }
      }
      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      console.log("✅ [Recorder] Recording started")
    } catch (err) {
      console.error("❌ [Recorder] Failed to start MediaRecorder:", err)
    }
  }

  const stopRecording = () => {
    console.log("🛑 [Recorder] Stopping recording...")
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.requestData()
      setTimeout(() => {
        mediaRecorderRef.current?.stop()
        mediaRecorderRef.current = null
        console.log("🧱 [Recorder] Final chunks recorded:", recordedChunksRef.current.length)
      }, 500)
    }
  }

  const downloadRecording = async () => {
    console.log("⬇️ [Recorder] Preparing download...")
    if (recordedChunksRef.current.length === 0) {
      console.warn("⚠️ [Recorder] No chunks found — nothing to download")
      return
    }

    const webmBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" })
    console.log("📦 [Recorder] WebM blob created:", webmBlob.size, "bytes")

    try {
      const wavBlob = await convertWebMBlobToWav(webmBlob)
      console.log("🎼 [Recorder] WAV conversion complete:", wavBlob.size, "bytes")

      const url = URL.createObjectURL(wavBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `realtime_agent_${Date.now()}.wav`
      a.click()

      console.log("✅ [Recorder] Download started")
      setTimeout(() => URL.revokeObjectURL(url), 200)
    } catch (err) {
      console.error("❌ [Recorder] Error converting or downloading:", err)
    }
  }

  return { startRecording, stopRecording, downloadRecording }
}

export default useAudioDownload
