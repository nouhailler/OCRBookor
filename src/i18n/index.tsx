/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, Translations } from './types';
import { fr } from './locales/fr';
import { en } from './locales/en';

const STORAGE_KEY = 'ocrbookor_lang';

const locales: Record<Language, Translations> = {
  fr,
  en,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (saved === 'fr' || saved === 'en') {
          return saved;
        }
        // Auto-detect from browser
        if (typeof navigator !== 'undefined' && navigator.language) {
          const browserLang = navigator.language.toLowerCase();
          if (browserLang.startsWith('fr')) return 'fr';
          return 'en';
        }
      } catch (e) {
        // Fallback to fr
      }
    }
    return 'fr';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  }, [language, setLanguage]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // 1. Try current language
      let text = getNestedValue(locales[language], key);

      // 2. Fallback to French if missing or empty
      if (text === undefined || text === '') {
        text = getNestedValue(locales.fr, key);
      }

      // 3. Fallback to key itself if still undefined
      if (text === undefined) {
        return key;
      }

      // 4. Parameter interpolation: replace {paramName} with value
      if (params) {
        Object.entries(params).forEach(([paramKey, val]) => {
          text = text!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }

      return text;
    },
    [language]
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    translations: locales[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export * from './types';
