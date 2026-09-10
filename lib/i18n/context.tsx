"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Locale, I18nContextType } from "./types";
import { id, type TranslationSchema } from "./locales/id";
import { en } from "./locales/en";

const dictionaries: Record<Locale, TranslationSchema> = {
  id,
  en,
};

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "id";

  const saved = localStorage.getItem("serbaserbi_locale") as Locale | null;
  if (saved === "id" || saved === "en") return saved;

  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  if (match && (match[1] === "id" || match[1] === "en")) return match[1] as Locale;

  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("id")) {
    return "id";
  }

  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("serbaserbi_locale", newLocale);
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = dictionaries[locale] || id;
      let text = getNestedValue(dict as unknown as Record<string, unknown>, key);

      // Fallback to Indonesian if key is missing or blank in current dictionary
      if (!text && locale !== "id") {
        text = getNestedValue(id as unknown as Record<string, unknown>, key);
      }

      // Final fallback to key itself
      if (!text) {
        text = key;
      }

      // Interpolate parameters {name}, {count}, etc.
      if (params) {
        for (const [pKey, pVal] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
        }
      }

      return text;
    },
    [locale]
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Graceful fallback for non-wrapped components or SSR
    return {
      locale: "id",
      setLocale: () => {},
      t: (key: string, params?: Record<string, string | number>) => {
        let text = getNestedValue(id as unknown as Record<string, unknown>, key) ?? key;
        if (params) {
          for (const [pKey, pVal] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
          }
        }
        return text;
      },
    };
  }
  return context;
}
