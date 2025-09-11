
import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'vi', label: 'VI', flag: '🇻🇳' },
  ];

  return (
    <div className="flex items-center space-x-1 bg-neutral-800 p-1 rounded-lg">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code as 'en' | 'vi')}
          className={`px-3 py-1 text-sm font-medium rounded-md flex items-center space-x-2 transition-colors duration-200 ${
            language === lang.code
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:bg-white/[0.12]'
          }`}
          aria-pressed={language === lang.code}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
};
