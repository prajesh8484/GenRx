import React, { createContext, useState, useContext } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('en');

  // Helper function to get translation
  // If translation missing, fallback to English key, then key itself
  const t = (key) => {
    return translations[currentLang]?.[key] || translations['en']?.[key] || key;
  };

  const changeLanguage = (langCode) => {
    console.log("Changing language to:", langCode);
    if (translations[langCode]) {
      setCurrentLang(langCode);
      console.log("Language updated to:", langCode);
      // Optional: Save to local storage
      localStorage.setItem('genrx-lang', langCode);
    } else {
      console.error("Language code not found in translations:", langCode);
    }
  };

  // Load from local storage on init (could use useEffect, but simple init is fine)
  // const savedLang = localStorage.getItem('genrx-lang');
  // if (savedLang && translations[savedLang] && savedLang !== currentLang) setCurrentLang(savedLang);

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
