import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getStaticTranslation } from '@shared/locales/translations';

const LanguageContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Detect browser language
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  // Extract language code (e.g., 'es-ES' -> 'es', 'en-US' -> 'en')
  const langCode = browserLang.split('-')[0];
  // Support only 'es' and 'en', default to 'es'
  return ['es', 'en'].includes(langCode) ? langCode : 'es';
};

export const LanguageProvider = ({ children }) => {
  // Check localStorage for saved language, or detect from browser
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('language');
    return savedLang || getBrowserLanguage();
  });

  // Save to localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (newLang) => {
    if (['es', 'en'].includes(newLang)) {
      setLanguage(newLang);
    }
  };

  // Helper function to get translation from translations object
  const getTranslation = (translations, field) => {
    if (!translations) return '';

    // Try current language first
    if (translations[language]?.[field]) {
      return translations[language][field];
    }

    // Fallback to other language
    const fallbackLang = language === 'es' ? 'en' : 'es';
    if (translations[fallbackLang]?.[field]) {
      return translations[fallbackLang][field];
    }

    return '';
  };

  // Helper function to get static UI translations
  const t = (keyPath) => {
    return getStaticTranslation(language, keyPath);
  };

  const value = {
    language,
    changeLanguage,
    getTranslation,
    t, // Static translations
    isSpanish: language === 'es',
    isEnglish: language === 'en',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
