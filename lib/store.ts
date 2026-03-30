/**
 * lib/store.ts
 * Global Zustand store — lightweight state shared across pages.
 * All persistent data lives in IndexedDB (lib/db.ts).
 */
import { create } from "zustand";

interface FlightInfo {
  origin: string;
  destination: string;
  flightNumber: string;
  remainingMin: number;
}

interface AppState {
  // Flight info (set manually or from a pre-flight sync)
  flight: FlightInfo;
  setFlight: (f: FlightInfo) => void;

  // Offline status
  isOffline: boolean;
  setOffline: (v: boolean) => void;

  // Active journal entry id being edited
  activeJournalId: string | null;
  setActiveJournalId: (id: string | null) => void;

  // Active deck/article ids
  activeDeckId: string | null;
  setActiveDeckId: (id: string | null) => void;

  activeArticleId: string | null;
  setActiveArticleId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  flight: {
    origin: "ICN",
    destination: "SFO",
    flightNumber: "KE 023",
    remainingMin: 650,
  },
  setFlight: (f) => set({ flight: f }),

  isOffline: false,
  setOffline: (v) => set({ isOffline: v }),

  activeJournalId: null,
  setActiveJournalId: (id) => set({ activeJournalId: id }),

  activeDeckId: null,
  setActiveDeckId: (id) => set({ activeDeckId: id }),

  activeArticleId: null,
  setActiveArticleId: (id) => set({ activeArticleId: id }),
}));
