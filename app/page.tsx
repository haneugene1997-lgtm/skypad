"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { seedIfEmpty } from "@/lib/db";
import { useOffline } from "@/hooks/useOffline";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function HomePage() {
  const flight = useAppStore((s) => s.flight);
  const isOffline = useOffline();

  useEffect(() => {
    // Seed sample data on first run
    seedIfEmpty().catch(console.error);
  }, []);

  const remainingH = Math.floor(flight.remainingMin / 60);
  const remainingM = flight.remainingMin % 60;

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-sm text-[var(--muted)] mb-0.5">Good morning,</p>
          <h1 className="text-3xl font-semibold tracking-tight">SkyPad ✈</h1>
        </div>

        {/* Flight card */}
        <div
          className="mx-5 my-4 rounded-[20px] p-5 relative overflow-hidden animate-fade-up"
          style={{
            background: "linear-gradient(135deg,#0a1628 0%,#0d1f3c 40%,#0a1628 100%)",
            border: "1px solid rgba(79,142,247,0.2)",
          }}
        >
          {/* Glow orbs */}
          <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(79,142,247,0.12) 0%,transparent 70%)" }} />
          <div className="absolute -bottom-10 left-5 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(62,207,178,0.07) 0%,transparent 70%)" }} />

          {/* Top row */}
          <div className="flex justify-between items-start mb-5 relative">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: isOffline ? "rgba(244,185,66,0.12)" : "rgba(48,209,88,0.12)",
                border: `1px solid ${isOffline ? "rgba(244,185,66,0.3)" : "rgba(48,209,88,0.3)"}`,
                color: isOffline ? "var(--amber)" : "var(--teal)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-blink"
                style={{ background: isOffline ? "var(--amber)" : "var(--teal)" }}
              />
              {isOffline ? "Airplane Mode" : "Online"}
            </div>
            <span className="text-xs text-[var(--muted)]">{flight.flightNumber}</span>
          </div>

          {/* Route */}
          <div className="flex items-center justify-between mb-4 relative">
            <div>
              <p className="text-3xl font-bold tracking-tight">{flight.origin}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Seoul</p>
            </div>
            <div className="flex-1 flex items-center justify-center px-3">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="text-2xl mx-2 opacity-60">✈</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">{flight.destination}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">San Francisco</p>
            </div>
          </div>

          {/* Stats bar */}
          <div
            className="flex justify-around rounded-xl py-2.5"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="text-center">
              <p className="text-base font-semibold">{remainingH}h {remainingM}m</p>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">Remaining</p>
            </div>
            <div className="w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="text-center">
              <p className="text-base font-semibold text-[var(--teal)]">Synced</p>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">Content</p>
            </div>
            <div className="w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="text-center">
              <p className="text-base font-semibold">3</p>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">Modules</p>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="px-5 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
            Your Modules
          </p>
          <div className="grid grid-cols-2 gap-3">
            <ModuleCard
              href="/read"
              icon="📖"
              iconBg="icon-bg-purple"
              title="Read"
              sub="5 articles saved"
              progress={68}
              progressColor="var(--purple)"
              badge="68%"
            />
            <ModuleCard
              href="/learn"
              icon="🧠"
              iconBg="icon-bg-teal"
              title="Learn"
              sub="3 decks ready"
              progress={42}
              progressColor="var(--teal)"
              badge="42%"
            />
            <ModuleCard
              href="/journal"
              icon="✍️"
              iconBg="icon-bg-amber"
              title="Journal"
              sub="4 entries"
              progress={0}
              progressColor="var(--amber)"
              badge=""
            />
            <ModuleCard
              href="/"
              icon="📊"
              iconBg="icon-bg-blue"
              title="Progress"
              sub="Flight stats"
              progress={0}
              progressColor="var(--blue)"
              badge=""
            />
          </div>
        </div>

        {/* Continue section */}
        <div className="px-5 pt-3 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
            Continue where you left off
          </p>
          <div className="flex flex-col gap-px rounded-2xl overflow-hidden" style={{ background: "var(--glass)" }}>
            <RecentItem
              href="/read/article-1"
              icon="📄"
              iconBg="rgba(124,92,252,0.12)"
              title="The Deep Work Revolution"
              meta="68% · 4 min left"
              badge="Read"
              badgeClass="pill-purple"
            />
            <RecentItem
              href="/learn/deck-korean-biz"
              icon="🃏"
              iconBg="rgba(62,207,178,0.12)"
              title="Korean Business Vocab"
              meta="12 / 30 cards"
              badge="Learn"
              badgeClass="pill-teal"
            />
            <RecentItem
              href="/journal/journal-1"
              icon="📝"
              iconBg="rgba(244,185,66,0.12)"
              title="Mid-year reflection"
              meta="Draft · started today"
              badge="Journal"
              badgeClass="pill-amber"
            />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────

function ModuleCard({
  href, icon, iconBg, title, sub, progress, progressColor, badge,
}: {
  href: string; icon: string; iconBg: string; title: string; sub: string;
  progress: number; progressColor: string; badge: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[20px] p-4 relative block transition-opacity active:opacity-70"
      style={{ background: "var(--glass)", border: "1px solid var(--border)" }}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-[11px] font-medium text-[var(--muted)]">
          {badge}
        </span>
      )}
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center text-2xl mb-3`}>
        {icon}
      </div>
      <p className="text-[15px] font-medium">{title}</p>
      <p className="text-xs text-[var(--muted)] mt-0.5">{sub}</p>
      {progress > 0 && (
        <ProgressBar value={progress} color={progressColor} className="mt-3" />
      )}
    </Link>
  );
}

function RecentItem({
  href, icon, iconBg, title, meta, badge, badgeClass,
}: {
  href: string; icon: string; iconBg: string; title: string;
  meta: string; badge: string; badgeClass: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 transition-opacity active:opacity-70"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-[var(--muted)]">{meta}</p>
      </div>
      <span className={`text-[11px] font-medium px-2 py-1 rounded-xl ${badgeClass}`}>
        {badge}
      </span>
    </Link>
  );
}
