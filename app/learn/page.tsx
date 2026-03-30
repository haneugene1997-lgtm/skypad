"use client";

import Link from "next/link";
import { useDB } from "@/hooks/useDB";
import { getDecks, Deck } from "@/lib/db";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useI18n } from "@/hooks/useI18n";

const DECK_COLORS = [
  { pill: "pill-teal",   bar: "var(--teal)",   iconBg: "icon-bg-teal" },
  { pill: "pill-blue",   bar: "var(--blue)",   iconBg: "icon-bg-blue" },
  { pill: "pill-amber",  bar: "var(--amber)",  iconBg: "icon-bg-amber" },
  { pill: "pill-purple", bar: "var(--purple)", iconBg: "icon-bg-purple" },
];

export default function LearnPage() {
  const { data: decks, loading } = useDB(getDecks);
  const { t } = useI18n();

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">{t("flashcardDecks")}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{t("flashcardDecksSub")}</p>
        </div>

        {/* Stats pill row */}
        <div className="flex gap-3 px-5 mb-5">
          {[
            { labelKey: "dueToday" as const, value: "18", color: "var(--amber)" },
            { labelKey: "mastered" as const, value: "35", color: "var(--teal)" },
            { labelKey: "streak" as const, value: "7d", color: "var(--blue)" },
          ].map((stat) => (
            <div
              key={stat.labelKey}
              className="flex-1 rounded-2xl py-3 text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xl font-semibold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">{t(stat.labelKey)}</p>
            </div>
          ))}
        </div>

        {/* Deck list */}
        <div className="px-5 flex flex-col gap-3 pb-6">
          {loading && (
            <p className="text-[var(--muted)] text-sm text-center py-12">{t("loading")}</p>
          )}
          {decks?.map((deck, i) => (
            <DeckCard key={deck.id} deck={deck} colors={DECK_COLORS[i % DECK_COLORS.length]} />
          ))}

          {/* Add deck CTA */}
          <button
            className="flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium text-[var(--muted)] transition-opacity active:opacity-70"
            style={{ border: "1px dashed var(--border2)" }}
          >
            <span className="text-lg">+</span> {t("createNewDeck")}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function DeckCard({ deck, colors }: { deck: Deck; colors: typeof DECK_COLORS[0] }) {
  const { t } = useI18n();
  const pct = deck.cardCount > 0 ? Math.round((deck.masteredCount / deck.cardCount) * 100) : 0;
  const due = deck.cardCount - deck.masteredCount;

  return (
    <Link
      href={`/learn/${deck.id}`}
      className="block p-4 rounded-2xl transition-opacity active:opacity-70 animate-fade-up"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-medium">{deck.title}</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {t("cardsTotalLine", { n: deck.cardCount })}
          </p>
        </div>
        {due > 0 && (
          <span className={`text-[11px] font-semibold px-2 py-1 rounded-xl ${colors.pill}`}>
            {t("dueCount", { n: due })}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
        <span>{t("masteredLabel")}</span>
        <span>{deck.masteredCount} / {deck.cardCount}</span>
      </div>
      <ProgressBar value={pct} color={colors.bar} />
    </Link>
  );
}
