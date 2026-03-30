/**
 * hooks/useOffline.ts
 * Detects when the browser goes offline / online.
 * Updates the global Zustand store so any component can react.
 */
"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function useOffline() {
  const setOffline = useAppStore((s) => s.setOffline);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);

    // Set initial state
    update();

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [setOffline]);

  return useAppStore((s) => s.isOffline);
}
