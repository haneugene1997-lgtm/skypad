"use client";

import { useMemo } from "react";
import { useLocaleStore } from "@/lib/locale-store";
import { getT } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n";

export function useI18n() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = useMemo(() => getT(locale), [locale]);
  return {
    locale,
    setLocale,
    t: (key: MessageKey, vars?: Record<string, string | number>) => t(key, vars),
  };
}
