// src/i18n/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from './translations';

// Initialize i18next
i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources: translations,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false, // React already escapes by default
    },
});

export default i18n;
