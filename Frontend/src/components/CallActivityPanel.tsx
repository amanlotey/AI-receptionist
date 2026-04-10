import React, { useState } from "react";

interface Call {
  id: string;
  caller?: string | null;
  duration?: string | null;
  status: "Live" | "Completed" | "Missed" | string;
  summary?: string | null;
  intentTags?: string[];
  session_id?: string;
  created_at?: string;
}

interface Props {
  calls: Call[] | undefined;
  selectedCallId: string | null;
  setSelectedCallId: (id: string) => void;
}

const CallActivityPanel: React.FC<Props> = ({
  calls = [],
  selectedCallId,
  setSelectedCallId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // 🔍 Filter calls by search term
  const filteredCalls = calls.filter((call) => {
    const target =
      `${call.caller ?? ""} ${call.summary ?? ""} ${call.session_id ?? ""}`.toLowerCase();
    return target.includes(searchTerm.toLowerCase());
  });

  return (
    <aside className=" bg-neutral-900 border-r border-neutral-800 p-4 overflow-y-auto">
      {/* Title */}
      

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search calls..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-neutral-800 text-gray-300 px-3 py-1 rounded mb-3 outline-none focus:ring-2 focus:ring-blue-600"
      />

      {/* No Calls Found */}
      {!filteredCalls || filteredCalls.length === 0 ? (
        <p className="text-gray-500 text-sm mt-6 text-center">
          No calls found.
        </p>
      ) : (
        filteredCalls.map((call) => (
          <div
            key={call.id}
            onClick={() => setSelectedCallId(call.id)}
            className={`p-3 mb-2 rounded-lg cursor-pointer transition border ${
              selectedCallId === call.id
                ? "bg-blue-800/30 border-blue-500/40"
                : "bg-neutral-800 hover:bg-neutral-700 border-transparent"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 font-medium">
                {call.caller || call.session_id || "Unknown Caller"}
              </span>
              <span
                className={`font-medium ${
                  call.status === "Live"
                    ? "text-yellow-400"
                    : call.status === "Completed"
                    ? "text-green-400"
                    : call.status === "Missed"
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {call.status || "Unknown"}
              </span>
            </div>

            {/* Duration + Date */}
            <p className="text-xs text-gray-400">
              {call.duration
                ? call.duration
                : call.created_at
                ? new Date(call.created_at).toLocaleString()
                : ""}
            </p>

            {/* Summary */}
            <p className="text-sm mt-1 text-gray-200 line-clamp-2">
              {call.summary || "No summary yet."}
            </p>

            {/* Intent Tags */}
            {call.intentTags && call.intentTags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {call.intentTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </aside>
  );
};

export default CallActivityPanel;
