import React from "react";
import { useAudioRecorder } from "../context/AudioRecorderContext";

interface Transcript {
  speaker: "Agent" | "Customer";
  text: string;
  time: string;
}

interface Props {
  transcripts: Transcript[];
  summary: string;
}

const TranscriptSummaryPanel: React.FC<Props> = ({ transcripts, summary }) => {
  const { downloadRecording } = useAudioRecorder();

  return (
    <section className="flex-1 p-4 border-b border-neutral-800">
      <h2 className="text-lg font-semibold mb-2">🧾 Transcript & Summary</h2>

      <div className="bg-neutral-900 rounded-lg p-4 h-[45vh] overflow-y-auto mb-3">
        {transcripts.map((line, idx) => (
          <div key={idx} className="mb-2">
            <strong
              className={
                line.speaker === "Agent" ? "text-green-400" : "text-blue-400"
              }
            >
              {line.speaker}
            </strong>
            <span className="text-gray-400 text-xs ml-2">{line.time}</span>
            <p className="text-gray-200">{line.text}</p>
          </div>
        ))}
      </div>

      <h3 className="text-md font-semibold text-gray-300 mb-1">📋 Summary</h3>
      <p className="bg-neutral-900 p-3 rounded-lg text-gray-200 mb-3 text-sm">
        {summary}
      </p>

      <div className="flex gap-2">
        <button className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm">
          Summarize Again
        </button>
        <button
          onClick={downloadRecording}
          className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm"
        >
          ⬇ Download Recording
        </button>
      </div>
    </section>
  );
};

export default TranscriptSummaryPanel;
