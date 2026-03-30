"use client";

import { useOffline } from "@/hooks/useOffline";
import { useI18n } from "@/hooks/useI18n";

export function OfflineBanner() {
  const isOffline = useOffline();
  const { t } = useI18n();

  if (!isOffline) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: "rgba(244,185,66,0.12)",
        border: "1px solid rgba(244,185,66,0.3)",
        color: "var(--amber)",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] animate-blink" />
      {t("offlineModeActive")}
    </div>
  );
}
