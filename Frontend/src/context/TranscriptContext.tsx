"use client"

import React, { createContext, useContext, useState } from "react"

export interface TranscriptItem {
  id: string
  role: "user" | "assistant"
  text: string
  partial?: boolean
  timestamp: string
  createdAtMs: number
}

interface TranscriptContextType {
  transcripts: TranscriptItem[]
  addTranscript: (role: "user" | "assistant", text: string, partial?: boolean) => void
  finalizeTranscript: (role: "user" | "assistant", text: string) => void
  clearTranscripts: () => void
}

const TranscriptContext = createContext<TranscriptContextType | null>(null)

export const TranscriptProvider = ({ children }: { children: React.ReactNode }) => {
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([])

  /* ✅ Add or update live transcript for the same role */
  const addTranscript = (role: "user" | "assistant", text: string, partial = false) => {
    setTranscripts((prev) => {
      const updated = [...prev]

      // Backward-compatible manual findLastIndex
      let lastIndex = -1
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === role && updated[i].partial) {
          lastIndex = i
          break
        }
      }

      if (lastIndex !== -1) {
        // Merge into the existing partial rather than replacing everything
        updated[lastIndex] = {
          ...updated[lastIndex],
          text,
          partial,
        }
        return updated
      }

      // Otherwise create a new entry
      return [
        ...updated,
        {
          id: `${Date.now()}-${role}`,
          role,
          text,
          partial,
          timestamp: new Date().toLocaleTimeString(),
          createdAtMs: Date.now() + (role === "assistant" ? 1 : 0), // ✅ ensures correct user→assistant order
        },
      ]
    })
  }

  /* ✅ Finalize transcript once completed */
  const finalizeTranscript = (role: "user" | "assistant", text: string) => {
    setTranscripts((prev) => {
      const updated = [...prev]

      let lastIndex = -1
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === role && updated[i].partial) {
          lastIndex = i
          break
        }
      }

      if (lastIndex !== -1) {
        updated[lastIndex] = { ...updated[lastIndex], text, partial: false }
        return updated
      }

      // If no partial found, just add it as a finalized line
      return [
        ...updated,
        {
          id: `${Date.now()}-${role}`,
          role,
          text,
          partial: false,
          timestamp: new Date().toLocaleTimeString(),
          createdAtMs: Date.now() + (role === "assistant" ? 1 : 0), // ✅ same ordering fix
        },
      ]
    })
  }

  /* 🧹 Reset transcripts manually when desired */
  const clearTranscripts = () => setTranscripts([])

  return (
    <TranscriptContext.Provider
      value={{ transcripts, addTranscript, finalizeTranscript, clearTranscripts }}
    >
      {children}
    </TranscriptContext.Provider>
  )
}

/* ✅ Hook for consuming transcript context */
export const useTranscript = () => {
  const ctx = useContext(TranscriptContext)
  if (!ctx) throw new Error("useTranscript must be used within TranscriptProvider")
  return ctx
}
