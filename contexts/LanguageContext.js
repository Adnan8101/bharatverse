'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { defaultLanguage, getLanguageByCode } from '@/lib/languages'

const LanguageContext = createContext()

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}

export const LanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage)
    const [translations, setTranslations] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    // Load saved language from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('bharatverse-language')
        if (savedLanguage) {
            setCurrentLanguage(savedLanguage)
            loadTranslations(savedLanguage)
        } else {
            loadTranslations(defaultLanguage)
        }
    }, [])

    const loadTranslations = async (languageCode) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/translations/${languageCode}`)
            if (response.ok) {
                const data = await response.json()
                setTranslations(data.translations || {})
            } else {
                // Fallback to default language if translation fails
                if (languageCode !== defaultLanguage) {
                    const fallbackResponse = await fetch(`/api/translations/${defaultLanguage}`)
                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json()
                        setTranslations(fallbackData.translations || {})
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load translations:', error)
            // Load default English translations as fallback
            setTranslations({})
        } finally {
            setIsLoading(false)
        }
    }

    const changeLanguage = async (languageCode) => {
        setCurrentLanguage(languageCode)
        localStorage.setItem('bharatverse-language', languageCode)
        await loadTranslations(languageCode)
        
        // Update document language and direction
        const language = getLanguageByCode(languageCode)
        document.documentElement.lang = languageCode
        document.documentElement.dir = language.direction
    }

    const t = (key, defaultValue = key) => {
        if (!key) return defaultValue
        
        const keys = key.split('.')
        let value = translations
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k]
            } else {
                return defaultValue
            }
        }
        
        return typeof value === 'string' ? value : defaultValue
    }

    const value = {
        currentLanguage,
        translations,
        isLoading,
        changeLanguage,
        t,
        currentLanguageInfo: getLanguageByCode(currentLanguage)
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}
