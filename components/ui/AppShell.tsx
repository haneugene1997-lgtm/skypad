"use client";

import { useEffect } from "react";
import { useOffline } from "@/hooks/useOffline";
import { useLocaleStore } from "@/lib/locale-store";
import { LanguageSwitch } from "@/components/ui/LanguageSwitch";

export default function AppShell({ children }: { children: React.ReactNode }) {
  useOffline();
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale === "ko" ? "ko" : "en";
  }, [locale]);

  // Register service worker (next-pwa does this automatically in prod,
  // but we also do it manually here as a fallback)
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    }
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className="fixed z-[100] flex justify-end pointer-events-none"
        style={{
          top: "max(10px, env(safe-area-inset-top))",
          right: "max(12px, env(safe-area-inset-right))",
        }}
      >
        <div className="pointer-events-auto">
          <LanguageSwitch />
        </div>
      </div>
      {children}
    </div>
  );
}
