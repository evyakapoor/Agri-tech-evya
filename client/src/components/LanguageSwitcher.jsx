import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { user, updateUser } = useAuth();

  const handleLanguageChange = async (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('agritech_lang', lang);

    if (user) {
      try {
        await api.put('/auth/profile', { preferredLanguage: lang });
        updateUser({ preferredLanguage: lang });
      } catch (err) {
        // Fallback silently if offline or token expired
      }
    }
  };

  const currentLang = i18n.language || 'en';

  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Language Selector">
      <button
        type="button"
        className={`btn ${currentLang === 'en' ? 'btn-forest' : 'btn-outline-secondary'}`}
        onClick={() => handleLanguageChange('en')}
      >
        🇬🇧 EN
      </button>
      <button
        type="button"
        className={`btn ${currentLang === 'hi' ? 'btn-forest' : 'btn-outline-secondary'}`}
        onClick={() => handleLanguageChange('hi')}
      >
        🇮🇳 हिन्दी
      </button>
    </div>
  );
};
