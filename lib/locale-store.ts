import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Locale = "ko" | "en";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "ko",
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "skypad-locale",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
