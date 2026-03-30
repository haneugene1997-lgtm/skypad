"use client";

import clsx from "clsx";
import { useLocaleStore, type Locale } from "@/lib/locale-store";

const OPTIONS: { locale: Locale; flag: string; label: string }[] = [
  { locale: "ko", flag: "🇰🇷", label: "한국어" },
  { locale: "en", flag: "🇺🇸", label: "English" },
];

export function LanguageSwitch() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div
      className="flex items-center gap-0.5 p-0.5 rounded-full"
      style={{
        background: "rgba(10,14,26,0.75)",
        border: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
      role="group"
      aria-label="Language · 언어"
    >
      {OPTIONS.map(({ locale: loc, flag, label }) => {
        const active = locale === loc;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={clsx(
              "w-8 h-8 rounded-full text-[15px] leading-none flex items-center justify-center transition-all active:scale-95",
              active
                ? "bg-[var(--surface)] shadow-sm ring-1 ring-[var(--blue)]/40"
                : "opacity-55 hover:opacity-90"
            )}
          >
            <span className="pointer-events-none select-none">{flag}</span>
          </button>
        );
      })}
    </div>
  );
}
