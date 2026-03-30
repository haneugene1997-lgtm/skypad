"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useDB } from "@/hooks/useDB";
import { getJournalEntries, JournalEntry } from "@/lib/db";
import { BottomNav } from "@/components/ui/BottomNav";

export default function JournalPage() {
  const { data: entries, loading } = useDB(getJournalEntries);

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-end justify-between px-5 pt-5 pb-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Journal</h1>
            <p className="text-sm text-[var(--muted)] mt-1">{entries?.length ?? 0} entries</p>
          </div>
          <Link
            href="/journal/new"
            className="px-4 py-2 rounded-2xl text-sm font-semibold text-white active:opacity-70 transition-opacity"
            style={{ background: "var(--amber)" }}
          >
            + New
          </Link>
        </div>

        {/* Search */}
        <div
          className="mx-5 mb-5 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-4 h-4 text-[var(--muted)]">
            <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
          </svg>
          <input
            placeholder="Search entries…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--muted)] text-[var(--muted)]"
          />
        </div>

        {/* Entry list */}
        <div className="px-5 flex flex-col gap-3 pb-6">
          {loading && (
            <p className="text-[var(--muted)] text-sm text-center py-12">Loading…</p>
          )}

          {entries?.map((entry) => (
            <JournalCard key={entry.id} entry={entry} />
          ))}

          {/* Empty state */}
          {!loading && entries?.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">✍️</p>
              <p className="text-[var(--muted)] text-sm">No entries yet.</p>
              <p className="text-[var(--muted)] text-sm">Tap <strong className="text-[var(--amber)]">+ New</strong> to start writing.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function JournalCard({ entry }: { entry: JournalEntry }) {
  const dateStr = format(new Date(entry.updatedAt), "MMM d, yyyy");

  return (
    <Link
      href={`/journal/${entry.id}`}
      className="block p-4 rounded-2xl transition-opacity active:opacity-70 animate-fade-up"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0 leading-none mt-0.5">{entry.mood}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] text-[var(--muted)] uppercase tracking-wider">{dateStr}</p>
            {entry.location && (
              <>
                <span className="text-[var(--muted)] opacity-40">·</span>
                <p className="text-[11px] text-[var(--blue)]">{entry.location}</p>
              </>
            )}
            {entry.isDraft && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded ml-auto"
                style={{ background: "rgba(244,185,66,0.12)", color: "var(--amber)" }}
              >
                Draft
              </span>
            )}
          </div>
          <h3 className="text-[15px] font-medium leading-snug mb-1">{entry.title}</h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-2">
            {entry.body.slice(0, 120)}…
          </p>
        </div>
      </div>
    </Link>
  );
}
