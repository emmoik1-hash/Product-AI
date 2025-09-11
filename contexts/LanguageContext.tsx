import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

type Language = 'en' | 'vi';
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
  translations: Translations;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationsMap: Record<Language, Translations> = {
  en,
  vi,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en'); // Default to English
  const [loadedTranslations, setLoadedTranslations] = useState<Translations>(en);

  useEffect(() => {
    // Potentially load language from localStorage in the future
    setLoadedTranslations(translationsMap[language]);
  }, [language]);

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result: any = loadedTranslations;

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key; // Return the key itself if not found
      }
    }
    
    if (typeof result === 'string' && replacements) {
        return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
            return acc.replace(`{${placeholder}}`, String(value));
        }, result);
    }

    return result || key;
  }, [loadedTranslations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: loadedTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};