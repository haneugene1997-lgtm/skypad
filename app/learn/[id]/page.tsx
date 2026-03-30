"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDeck, getCardsByDeck, reviewCard, Deck, Flashcard } from "@/lib/db";
import clsx from "clsx";

type Rating = 0 | 1 | 2;

export default function DeckPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDeck(id), getCardsByDeck(id)]).then(([d, c]) => {
      setDeck(d ?? null);
      setCards(c);
      setLoading(false);
    });
  }, [id]);

  const card = cards[index];

  const handleFlip = () => {
    if (!flipped) setFlipped(true);
  };

  const handleRate = async (rating: Rating) => {
    if (!card) return;
    await reviewCard(card, rating);
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg)]">
        <p className="text-[var(--muted)] text-sm">Loading deck…</p>
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
          Decks
        </button>
        <span className="text-[17px] font-semibold">{deck?.title ?? "Review"}</span>
        <button
          onClick={() => router.back()}
          className="text-[var(--blue)] text-[15px] active:opacity-70"
        >
          Done
        </button>
      </div>

      {done ? (
        <DoneScreen total={cards.length} onBack={() => router.back()} />
      ) : (
        <div className="flex-1 flex flex-col items-center px-5 py-4 gap-5">
          {/* Progress */}
          <div className="w-full">
            <div className="flex justify-between text-xs text-[var(--muted)] mb-2">
              <span>Card {index + 1} of {cards.length}</span>
              <span>{Math.round(((index) / cards.length) * 100)}% done</span>
            </div>
            <div className="h-1 rounded-full w-full" style={{ background: "var(--border)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(index / cards.length) * 100}%`, background: "var(--teal)" }}
              />
            </div>
          </div>

          {/* Card */}
          <button
            onClick={handleFlip}
            className={clsx(
              "w-full flex-1 max-h-72 rounded-3xl flex flex-col items-center justify-center p-8 transition-all duration-300 active:scale-[0.98]",
              flipped
                ? "border-[var(--teal)]"
                : "border-[var(--border)]"
            )}
            style={{
              background: flipped ? "rgba(62,207,178,0.05)" : "var(--glass)",
              border: `1px solid ${flipped ? "rgba(62,207,178,0.3)" : "var(--border)"}`,
            }}
          >
            {!flipped ? (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-5">
                  Korean
                </p>
                <p className="text-5xl font-bold tracking-tight text-center">
                  {card?.front}
                </p>
                {card?.reading && (
                  <p className="text-sm text-[var(--muted)] mt-2 font-mono">{card.reading}</p>
                )}
                <p className="text-xs text-[var(--muted)] mt-6">tap to reveal →</p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--teal)] mb-5 opacity-70">
                  English
                </p>
                <p className="text-2xl font-semibold text-center text-[var(--teal)]">
                  {card?.back}
                </p>
                {card?.example && (
                  <p className="text-sm text-[var(--muted)] mt-4 text-center leading-relaxed">
                    "{card.example}"
                  </p>
                )}
              </>
            )}
          </button>

          {/* Rating buttons — only shown after flip */}
          <div
            className={clsx(
              "w-full flex gap-3 transition-all duration-300",
              flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}
          >
            {([
              { label: "Again", sub: "<1m",  rating: 0, color: "var(--red)",    borderColor: "rgba(224,92,92,0.3)"   },
              { label: "Good",  sub: "4d",   rating: 1, color: "var(--blue)",   borderColor: "rgba(79,142,247,0.3)"  },
              { label: "Easy",  sub: "7d",   rating: 2, color: "var(--teal)",   borderColor: "rgba(62,207,178,0.3)"  },
            ] as { label: string; sub: string; rating: Rating; color: string; borderColor: string }[]).map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleRate(btn.rating)}
                className="flex-1 py-4 rounded-2xl flex flex-col items-center gap-1 transition-opacity active:opacity-70"
                style={{
                  background: "var(--glass)",
                  border: `1px solid ${btn.borderColor}`,
                }}
              >
                <span className="text-lg" style={{ color: btn.color }}>
                  {btn.rating === 0 ? "↩" : btn.rating === 1 ? "✓" : "⚡"}
                </span>
                <span className="text-sm font-medium">{btn.label}</span>
                <span className="text-[11px] text-[var(--muted)]">{btn.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DoneScreen({ total, onBack }: { total: number; onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 animate-fade-up">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
        style={{ background: "rgba(62,207,178,0.12)", border: "1px solid rgba(62,207,178,0.25)" }}
      >
        🎉
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Session complete!</h2>
        <p className="text-[var(--muted)] text-sm leading-relaxed">
          You reviewed {total} cards.<br />Great work at 35,000 feet.
        </p>
      </div>
      <button
        onClick={onBack}
        className="px-8 py-3 rounded-2xl font-medium text-white active:opacity-70"
        style={{ background: "var(--teal)" }}
      >
        Back to decks
      </button>
    </div>
  );
}
