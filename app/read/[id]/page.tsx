"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getArticle, updateArticleProgress, Article } from "@/lib/db";
import { ProgressBar } from "@/components/ui/ProgressBar";

const TAG_COLORS: Record<string, { pill: string; bar: string }> = {
  Productivity: { pill: "pill-purple", bar: "var(--purple)" },
  Strategy:     { pill: "pill-teal",   bar: "var(--teal)" },
  Finance:      { pill: "pill-amber",  bar: "var(--amber)" },
  Leadership:   { pill: "pill-blue",   bar: "var(--blue)" },
};

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [fontSize, setFontSize] = useState(17);

  useEffect(() => {
    getArticle(id).then((a) => setArticle(a ?? null));
  }, [id]);

  // Track scroll progress and persist to IndexedDB
  useEffect(() => {
    if (!article) return;
    const el = document.getElementById("reader-scroll");
    if (!el) return;

    const onScroll = () => {
      const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
      if (pct > article.progressPct) {
        updateArticleProgress(article.id, pct).catch(console.error);
        setArticle((prev) => prev ? { ...prev, progressPct: pct } : prev);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [article]);

  if (!article) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg)]">
        <p className="text-[var(--muted)] text-sm">Loading…</p>
      </div>
    );
  }

  const colors = TAG_COLORS[article.tag] ?? { pill: "pill-blue", bar: "var(--blue)" };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      {/* Nav bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[var(--blue)] text-[15px] active:opacity-70"
        >
          <svg viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-2.5 h-4">
            <path d="M9 1L1 8l8 7" />
          </svg>
          Articles
        </button>
        <div className="flex gap-4">
          <button className="text-[var(--muted)] active:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button className="text-[var(--muted)] active:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>

      {/* Font size controls */}
      <div
        className="flex items-center gap-3 px-4 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <button
          onClick={() => setFontSize((s) => Math.max(13, s - 1))}
          className="text-xs font-medium px-3 py-1 rounded-lg text-[var(--muted)] active:opacity-70"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          A−
        </button>
        <span className="text-xs text-[var(--muted)] flex-1 text-center">Reading mode</span>
        <button
          onClick={() => setFontSize((s) => Math.min(22, s + 1))}
          className="text-xs font-medium px-3 py-1 rounded-lg text-[var(--muted)] active:opacity-70"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          A+
        </button>
      </div>

      {/* Reading progress */}
      <ProgressBar value={article.progressPct} color={colors.bar} />

      {/* Scrollable content */}
      <div id="reader-scroll" className="flex-1 overflow-y-auto">
        <div className="px-5 pt-5 pb-8">
          {/* Tag */}
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg inline-block mb-3 ${colors.pill}`}>
            {article.tag}
          </span>

          {/* Title */}
          <h1 className="text-2xl font-bold leading-tight tracking-tight mb-2">
            {article.title}
          </h1>

          {/* Byline */}
          <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-5">
            <span>{article.author}</span>
            <span>·</span>
            <span>{article.readingTimeMin} min read</span>
            <span>·</span>
            <span className="text-[var(--teal)]">● Saved offline</span>
          </div>

          <div className="h-px mb-5" style={{ background: "var(--border)" }} />

          {/* Body */}
          <div
            className="leading-relaxed text-[rgba(240,244,255,0.85)] [&_p]:mb-5 [&_strong]:text-white [&_strong]:font-semibold"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>

      {/* Bottom toolbar */}
      <div
        className="flex items-center justify-around px-4 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid var(--border)", background: "rgba(10,14,26,0.95)" }}
      >
        {[
          { label: "Save", icon: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /> },
          { label: "Share", icon: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></> },
          { label: "Focus", icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></> },
        ].map((btn) => (
          <button
            key={btn.label}
            className="flex flex-col items-center gap-1 py-1 px-4 text-[var(--muted)] active:opacity-70 transition-opacity"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              {btn.icon}
            </svg>
            <span className="text-[10px]">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
