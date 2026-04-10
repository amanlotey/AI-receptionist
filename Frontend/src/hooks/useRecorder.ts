import { useState, useRef } from "react";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunks.current = [];
    mediaRecorder.start();
    setIsRecording(true);

    mediaRecorder.ondataavailable = e => chunks.current.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      setAudioURL(URL.createObjectURL(blob));
    };
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const getAudioBlob = () =>
    new Promise<Blob>((resolve, reject) => {
      if (!mediaRecorderRef.current) return reject("No recorder");
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      resolve(blob);
    });

  return { isRecording, audioURL, startRecording, stopRecording, getAudioBlob };
}
