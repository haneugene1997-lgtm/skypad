"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "@/hooks/useI18n";
import { useDB } from "@/hooks/useDB";
import { getBoardingPass, type BoardingPass } from "@/lib/db";
import type { Locale } from "@/lib/locale-store";

function pickPass(bp: BoardingPass, locale: Locale) {
  const en = locale === "en";
  return {
    flightDate: en ? bp.flightDateEn : bp.flightDateKo,
    originCity: en ? bp.originCityEn : bp.originCityKo,
    destCity: en ? bp.destCityEn : bp.destCityKo,
    arrival: en ? bp.arrivalEn : bp.arrivalKo,
    cabin: en ? bp.cabinEn : bp.cabinKo,
  };
}

export default function MyFlightPage() {
  const { t, locale } = useI18n();
  const { data: pass, loading } = useDB(() => getBoardingPass(), []);

  const demoAction = () => window.alert(t("boardingDemoNote"));

  if (loading || !pass) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg)]">
        <BoardingHeader title={t("boardingTitle")} />
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-[var(--muted)]">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const p = pickPass(pass, locale);
  const qrValue = `SKYPAD|${pass.flightNumber}|${pass.originCode}-${pass.destCode}|${pass.passengerLine}|${pass.seat}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg)]">
      <BoardingHeader title={t("boardingTitle")} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-36 pt-3">
        <div
          className="mx-auto max-w-md overflow-hidden rounded-2xl shadow-xl"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
        >
          {/* Blue band */}
          <div
            className="px-5 py-4 text-white"
            style={{ background: "linear-gradient(180deg, #0a2750 0%, #051a38 100%)" }}
          >
            <p className="text-[15px] font-semibold leading-snug tracking-wide">{pass.passengerLine}</p>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-white/15 pt-2">
              <p className="text-sm text-white/90">{p.flightDate}</p>
              <p className="text-sm font-semibold tabular-nums">{pass.flightNumber}</p>
            </div>
          </div>

          {/* White card body */}
          <div className="bg-white px-5 pb-5 pt-4 text-neutral-900">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-2 shadow-sm">
                <QRCodeSVG value={qrValue} size={132} level="M" includeMargin={false} />
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={demoAction}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 shadow-sm active:opacity-70"
                  aria-label={t("boardingDownload")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4.3-4.3" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-neutral-500">
              {t("boardingSecNo")}{" "}
              <span className="font-mono text-sm font-semibold text-neutral-800">{pass.secNo}</span>
            </p>

            {/* Route */}
            <div className="mt-5 flex items-end justify-between gap-2 text-[#0064de]">
              <div>
                <p className="text-2xl font-bold tracking-tight">{pass.originCode}</p>
                <p className="text-xs font-medium leading-tight">{p.originCity}</p>
              </div>
              <div className="mb-2 flex flex-1 items-center px-1">
                <div className="h-px flex-1 border-t border-dashed border-[#0064de]/50" />
                <span className="mx-1 text-lg" aria-hidden>
                  ✈
                </span>
                <div className="h-px flex-1 border-t border-dashed border-[#0064de]/50" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tracking-tight">{pass.destCode}</p>
                <p className="text-xs font-medium leading-tight">{p.destCity}</p>
              </div>
            </div>

            {/* Grid */}
            <div className="mt-6 grid grid-cols-3 gap-y-4 text-center">
              <Cell label={t("boardingBoardingTime")} value={pass.boardingTime} />
              <Cell label={t("boardingDepartureTime")} value={pass.departureTime} />
              <Cell label={t("boardingGate")} value={pass.gate} />
              <Cell label={t("boardingSeat")} value={pass.seat} />
              <Cell label={t("boardingClass")} value={p.cabin} />
              <Cell label={t("boardingTerminal")} value={pass.terminal} />
            </div>

            <div className="mt-5 rounded-xl bg-neutral-50 px-3 py-3 text-center">
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                {t("boardingArrivalTime")}
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">{p.arrival}</p>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-end">
                <span className="text-neutral-500">{t("boardingSequence")}</span>
                <span className="ml-2 font-bold text-neutral-900">{pass.zone}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500">{t("boardingBaggageCarousel")}</span>
                <span className="font-semibold tabular-nums text-neutral-900">{pass.baggageCarousel}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={demoAction}
                className="flex-1 rounded-xl border border-neutral-300 bg-white py-3 text-sm font-semibold text-neutral-800 shadow-sm active:opacity-80"
              >
                {t("boardingAddWallet")}
              </button>
              <button
                type="button"
                onClick={demoAction}
                className="flex-1 rounded-xl border border-neutral-300 bg-white py-3 text-sm font-semibold text-neutral-800 shadow-sm active:opacity-80"
              >
                {t("boardingDownload")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(10,14,26,0.92) 35%, var(--bg) 55%)",
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        }}
      >
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={demoAction}
            className="w-full rounded-2xl py-4 text-[15px] font-semibold text-white shadow-lg active:opacity-95"
            style={{ background: "linear-gradient(180deg, #0a4ea8 0%, #062d66 100%)" }}
          >
            {t("boardingReceive")}
          </button>
        </div>
      </div>
    </div>
  );
}

function BoardingHeader({ title }: { title: string }) {
  const { t } = useI18n();
  return (
    <header
      className="sticky top-0 z-40 flex shrink-0 items-center justify-between px-2 py-2"
      style={{
        background: "rgba(10,14,26,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        paddingTop: "max(8px, env(safe-area-inset-top))",
      }}
    >
      <Link
        href="/"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text)] transition-opacity active:opacity-70"
        aria-label={t("boardingBackAria")}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <h1 className="text-[17px] font-semibold text-[var(--text)]">{title}</h1>
      <Link
        href="/"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text)] transition-opacity active:opacity-70"
        aria-label={t("boardingCloseAria")}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </Link>
    </header>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-neutral-900">{value}</p>
    </div>
  );
}
