// Language configuration for the application
export const languages = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr'
    },
    {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        flag: '🇮🇳',
        direction: 'ltr'
    },
    {
        code: 'mr',
        name: 'Marathi',
        nativeName: 'मराठी',
        flag: '🇮🇳',
        direction: 'ltr'
    },
    {
        code: 'gu',
        name: 'Gujarati',
        nativeName: 'ગુજરાતી',
        flag: '🇮🇳',
        direction: 'ltr'
    },
    {
        code: 'bn',
        name: 'Bengali',
        nativeName: 'বাংলা',
        flag: '🇮🇳',
        direction: 'ltr'
    },
    {
        code: 'ta',
        name: 'Tamil',
        nativeName: 'தமிழ்',
        flag: '🇮🇳',
        direction: 'ltr'
    },
    {
        code: 'te',
        name: 'Telugu',
        nativeName: 'తెలుగు',
        flag: '🇮🇳',
        direction: 'ltr'
    },
    {
        code: 'kn',
        name: 'Kannada',
        nativeName: 'ಕನ್ನಡ',
        flag: '🇮🇳',
        direction: 'ltr'
    },
    {
        code: 'ml',
        name: 'Malayalam',
        nativeName: 'മലയാളം',
        flag: '🇮🇳',
        direction: 'ltr'
    },
    {
        code: 'pa',
        name: 'Punjabi',
        nativeName: 'ਪੰਜਾਬੀ',
        flag: '🇮🇳',
        direction: 'ltr'
    },
    {
        code: 'od',
        name: 'Odia',
        nativeName: 'ଓଡ଼ିଆ',
        flag: '🇮🇳',
        direction: 'ltr'
    },
    {
        code: 'as',
        name: 'Assamese',
        nativeName: 'অসমীয়া',
        flag: '🇮🇳',
        direction: 'ltr'
    }
]

export const defaultLanguage = 'en'

export const getLanguageByCode = (code) => {
    return languages.find(lang => lang.code === code) || languages.find(lang => lang.code === defaultLanguage)
}
