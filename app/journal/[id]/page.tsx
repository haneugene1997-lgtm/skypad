"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { getJournalEntry, saveJournalEntry, JournalEntry } from "@/lib/db";
import { useAppStore } from "@/lib/store";

const MOODS = ["😌", "🔥", "🤔", "✨", "😤", "🧘"];

function newEntry(location: string): JournalEntry {
  return {
    id: `journal-${Date.now()}`,
    title: "",
    body: "",
    mood: "😌",
    location,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDraft: true,
  };
}

export default function JournalEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const flight = useAppStore((s) => s.flight);
  const isNew = params.id === "new";

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load or init
  useEffect(() => {
    if (isNew) {
      setEntry(newEntry(`${flight.origin} → ${flight.destination}`));
    } else {
      getJournalEntry(params.id).then((e) => {
        if (e) setEntry(e);
      });
    }
  }, [isNew, params.id, flight]);

  // Auto-save with debounce
  const autoSave = useCallback((updated: JournalEntry) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      await saveJournalEntry(updated);
      setSaving(false);
    }, 800);
  }, []);

  const update = (patch: Partial<JournalEntry>) => {
    setEntry((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      autoSave(updated);
      return updated;
    });
  };

  const handleDone = async () => {
    if (!entry) return;
    await saveJournalEntry({ ...entry, isDraft: false });
    router.back();
  };

  if (!entry) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg)]">
        <p className="text-[var(--muted)] text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[var(--blue)] text-[15px] active:opacity-70"
        >
          <svg viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-2.5 h-4">
            <path d="M9 1L1 8l8 7" />
          </svg>
          Journal
        </button>
        <span className="text-sm text-[var(--muted)]">
          {saving ? "Saving…" : "Draft"}
        </span>
        <button
          onClick={handleDone}
          className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white active:opacity-70"
          style={{ background: "var(--amber)" }}
        >
          Done
        </button>
      </div>

      {/* Editor body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Meta */}
        <div className="px-5 flex-shrink-0">
          <p className="text-xs text-[var(--muted)]">
            {format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy")}
          </p>
          {entry.location && (
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--blue)" }}>
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                <path d="M6 11S1 7.5 1 4.5a5 5 0 0 1 10 0C11 7.5 6 11 6 11z" />
                <circle cx="6" cy="4.5" r="1.5" />
              </svg>
              {entry.location} · Airplane Mode
            </p>
          )}
        </div>

        {/* Title */}
        <input
          value={entry.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Entry title…"
          className="w-full bg-transparent outline-none text-2xl font-bold tracking-tight px-5 py-3 placeholder:text-[var(--muted)] flex-shrink-0"
        />

        {/* Divider */}
        <div className="mx-5 mb-4 flex-shrink-0" style={{ height: "1px", background: "var(--border)" }} />

        {/* Body */}
        <textarea
          value={entry.body}
          onChange={(e) => update({ body: e.target.value })}
          placeholder="What's on your mind at 35,000 feet?"
          className="flex-1 w-full bg-transparent outline-none resize-none px-5 text-[17px] leading-relaxed overflow-y-auto"
          style={{ color: "rgba(240,244,255,0.85)" }}
        />

        {/* Toolbar */}
        <div
          className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => update({ mood })}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all active:scale-90"
              style={{
                background: entry.mood === mood ? "rgba(244,185,66,0.15)" : "var(--glass)",
                border: `1px solid ${entry.mood === mood ? "rgba(244,185,66,0.4)" : "var(--border)"}`,
              }}
            >
              {mood}
            </button>
          ))}
          <button
            onClick={handleDone}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold text-white active:opacity-70"
            style={{ background: "var(--amber)" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
