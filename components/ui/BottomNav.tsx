"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useI18n } from "@/hooks/useI18n";

const tabDefs = [
  {
    href: "/",
    labelKey: "navHome" as const,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          fill={active ? "currentColor" : "none"} />
        <path d="M9 22V12h6v10" stroke={active ? "#0a0e1a" : "currentColor"} />
      </svg>
    ),
  },
  {
    href: "/read",
    labelKey: "navRead" as const,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M4 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
          fill={active ? "rgba(124,92,252,0.2)" : "none"} />
        <path d="M16 5V3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="M6 11h8M6 15h6" />
      </svg>
    ),
  },
  {
    href: "/learn",
    labelKey: "navLearn" as const,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <rect x="2" y="6" width="14" height="10" rx="2"
          fill={active ? "rgba(62,207,178,0.2)" : "none"} />
        <rect x="4" y="4" width="14" height="10" rx="2"
          fill={active ? "rgba(62,207,178,0.1)" : "none"} />
        <path d="M6 11h6M6 14h4" />
      </svg>
    ),
  },
  {
    href: "/journal",
    labelKey: "navJournal" as const,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
          fill={active ? "rgba(244,185,66,0.2)" : "none"} />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav
      className="flex justify-around items-start pt-2 pb-safe border-t"
      style={{
        background: "rgba(10,14,26,0.92)",
        backdropFilter: "blur(20px)",
        borderColor: "var(--border)",
        paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
      }}
    >
      {tabDefs.map((tab) => {
        const isActive =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors",
              isActive ? "text-[var(--blue)]" : "text-[var(--muted)]"
            )}
          >
            {tab.icon(isActive)}
            <span className="text-[10px] font-medium">{t(tab.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
