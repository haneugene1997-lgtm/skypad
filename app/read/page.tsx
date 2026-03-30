"use client";

import Link from "next/link";
import { useDB } from "@/hooks/useDB";
import { getArticles, Article } from "@/lib/db";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProgressBar } from "@/components/ui/ProgressBar";

const TAG_COLORS: Record<string, { pill: string; bar: string }> = {
  Productivity: { pill: "pill-purple", bar: "var(--purple)" },
  Strategy:     { pill: "pill-teal",   bar: "var(--teal)" },
  Finance:      { pill: "pill-amber",  bar: "var(--amber)" },
  Leadership:   { pill: "pill-blue",   bar: "var(--blue)" },
};

export default function ReadPage() {
  const { data: articles, loading } = useDB(getArticles);

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">Reading List</h1>
          <p className="text-sm text-[var(--muted)] mt-1">All articles saved offline</p>
        </div>

        {/* Search bar */}
        <div
          className="mx-5 mb-4 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-4 h-4 text-[var(--muted)]">
            <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
          </svg>
          <input
            placeholder="Search articles…"
            className="flex-1 bg-transparent outline-none text-sm text-[var(--muted)] placeholder:text-[var(--muted)]"
          />
        </div>

        {/* Article list */}
        <div className="px-5 flex flex-col gap-3 pb-6">
          {loading && (
            <div className="text-[var(--muted)] text-sm text-center py-12">Loading…</div>
          )}
          {articles?.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}

          {/* Add article CTA */}
          <Link
            href="/read/add"
            className="flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium text-[var(--muted)] transition-opacity active:opacity-70"
            style={{ border: "1px dashed var(--border2)" }}
          >
            <span className="text-lg">+</span> Save new article
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const colors = TAG_COLORS[article.tag] ?? { pill: "pill-blue", bar: "var(--blue)" };

  return (
    <Link
      href={`/read/${article.id}`}
      className="block p-4 rounded-2xl transition-opacity active:opacity-70 animate-fade-up"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg inline-block mb-2 ${colors.pill}`}>
        {article.tag}
      </span>
      <h3 className="text-[15px] font-medium leading-snug mb-2">{article.title}</h3>
      <div className="flex items-center gap-3 text-xs text-[var(--muted)] mb-3">
        <span>{article.readingTimeMin} min read</span>
        <span>·</span>
        <span>{article.author}</span>
      </div>
      {article.progressPct > 0 ? (
        <div>
          <ProgressBar value={article.progressPct} color={colors.bar} />
          <p className="text-[11px] text-[var(--muted)] mt-1">{article.progressPct}% complete</p>
        </div>
      ) : (
        <p className="text-[11px] text-[var(--muted)]">Not started</p>
      )}
    </Link>
  );
}
