"use client";

import { useEffect } from "react";
import { useOffline } from "@/hooks/useOffline";

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Boot offline listener
  useOffline();

  // Register service worker (next-pwa does this automatically in prod,
  // but we also do it manually here as a fallback)
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    }
  }, []);

  return <>{children}</>;
}
