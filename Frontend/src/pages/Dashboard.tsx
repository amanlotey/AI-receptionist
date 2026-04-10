import React, { useEffect, useState, useRef } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useAudioRecorder } from "../context/AudioRecorderContext"
import { useAuth0 } from "@auth0/auth0-react"

interface Transcript {
  text: string
  speaker: "user" | "agent"
  created_at?: string
}

interface Call {
  id: string
  session_id: string
  status: string
  summary: string | null
  created_at: string
  transcripts: Transcript[]
  caller_name?: string
  caller_number?: string
  duration?: string
  intent?: string
}

const UnitedCloudDashboard: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([])
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { downloadRecording } = useAudioRecorder()
  const { user, logout } = useAuth0()

  // Profile menu
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ===========================================
  // FETCH + REALTIME LISTENERS (FIXED)
  // ===========================================
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/calls")
        const data = await res.json()

        // Ensure transcript array exists
        const normalized = data.map((c: Call) => ({
          ...c,
          transcripts: c.transcripts || []
        }))

        setCalls(normalized)
        setSelectedCallId(normalized[0]?.id || null)
      } catch (err) {
        console.error("⚠️ Failed to fetch calls:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCalls()

    // ---- Supabase Realtime (v2) ----
    const callSub = supabase.channel("realtime:calls")
    callSub.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "calls" },
      (payload) => {
        const newCall = {
          ...payload.new,
          transcripts: []
        } as Call

        setCalls((prev) => [newCall, ...prev])
      }
    )
    callSub.subscribe()

    const transcriptSub = supabase.channel("realtime:transcripts")
    transcriptSub.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "transcripts" },
      (payload) => {
        const { call_id, text, speaker } = payload.new

        setCalls((prev) =>
          prev.map((call) =>
            call.id === call_id
              ? {
                  ...call,
                  transcripts: [...(call.transcripts || []), { text, speaker }]
                }
              : call
          )
        )
      }
    )
    transcriptSub.subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(callSub)
      supabase.removeChannel(transcriptSub)
    }
  }, [])

  const selectedCall = calls.find((c) => c.id === selectedCallId)
  const callTranscripts = selectedCall?.transcripts || []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading call data...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Incoming Calls Dashboard</h1>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((p) => !p)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src={user?.picture || "https://via.placeholder.com/40"}
              className="w-9 h-9 rounded-full border border-gray-300"
            />
            <span className="font-medium text-sm">{user?.name || "User"}</span>
          </button>

          {open && (
            <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg border border-gray-200 w-48 z-50">
              <ul className="text-sm text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Account Settings</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Preferences</li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600 border-t border-gray-200"
                  onClick={() =>
                    logout({ logoutParams: { returnTo: window.location.origin } })
                  }
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Calls", value: 50 },
          { label: "Answered", value: 45 },
          { label: "Missed", value: 5 },
          { label: "Avg Duration", value: "03:45" }
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center"
          >
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Section */}
      <div className="flex gap-6">
        {/* Calls Table */}
        <div className="w-2/3 bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="py-3 px-4">Date/Time</th>
                <th className="py-3 px-4">Caller</th>
                <th className="py-3 px-4">Number</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Intent</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr
                  key={call.id}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedCallId === call.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setSelectedCallId(call.id)}
                >
                  <td className="py-2 px-4">
                    {new Date(call.created_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="py-2 px-4">{call.caller_name || "Unknown"}</td>
                  <td className="py-2 px-4">{call.caller_number || "—"}</td>
                  <td className="py-2 px-4">{call.duration || "—"}</td>
                  <td className="py-2 px-4">{call.intent || "—"}</td>
                  <td className="py-2 px-4">{call.status || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Call Details */}
        <div className="w-1/3 bg-white rounded-xl border shadow-sm p-5 flex flex-col">
          {selectedCall ? (
            <>
              <h2 className="text-lg font-semibold mb-3">Call Details</h2>
              <p className="font-medium">{selectedCall.caller_name || "Unknown"}</p>
              <p className="text-gray-500 text-sm mb-4">
                {selectedCall.caller_number || "—"}
              </p>

              <div className="text-sm space-y-1 mb-4">
                <p>
                  <strong>Date/Time:</strong>{" "}
                  {new Date(selectedCall.created_at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
                <p>
                  <strong>Status:</strong> {selectedCall.status}
                </p>
                <p>
                  <strong>Duration:</strong> {selectedCall.duration || "—"}
                </p>
              </div>

              <div className="border-t pt-3 text-sm">
                <strong>AI Summary:</strong>
                <p className="text-gray-600 mt-1">
                  {selectedCall.summary || "No summary available."}
                </p>
              </div>

              {/* Audio */}
              <div className="mt-4 border-t pt-3">
                <strong>Recording:</strong>
                <div className="flex items-center justify-between mt-2">
                  <audio controls className="w-full rounded-lg">
                    Your browser does not support the audio element.
                  </audio>
                  <button
                    onClick={downloadRecording}
                    className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm text-white ml-3"
                  >
                    ⬇ Download Recording
                  </button>
                </div>
              </div>

              {/* Transcript */}
              <div className="mt-4 border-t pt-3">
                <details>
                  <summary className="cursor-pointer font-medium text-sm">
                    Full Transcript
                  </summary>

                  <div className="mt-2 text-sm text-gray-700 max-h-48 overflow-y-auto space-y-1">
                    {callTranscripts.length > 0 ? (
                      callTranscripts.map((t, i) => (
                        <p key={i}>
                          <strong>{t.speaker === "user" ? "Customer:" : "Agent:"}</strong>{" "}
                          {t.text}
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-400">No transcript yet.</p>
                    )}
                  </div>
                </details>
              </div>

              {/* Notes */}
              <div className="mt-4 border-t pt-3">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add notes here..."
                />
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-sm">Select a call to view details</div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h3 className="font-semibold mb-3 text-gray-800">Insights — This Month</h3>
          <ul className="text-sm space-y-1">
            <li>📅 Appointments: 18</li>
            <li>💬 Inquiries: 9</li>
            <li>⚠️ Complaints: 3</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h3 className="font-semibold mb-3 text-gray-800">Insights — Last Month</h3>
          <ul className="text-sm space-y-1">
            <li>📅 Appointments: 15</li>
            <li>💬 Inquiries: 12</li>
            <li>⚠️ Complaints: 6</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default UnitedCloudDashboard
