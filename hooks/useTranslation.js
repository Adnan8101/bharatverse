'use client'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Enhanced translation hook with additional features
 */
export const useTranslation = () => {
    const { t, currentLanguage, currentLanguageInfo, changeLanguage, isLoading } = useLanguage()

    /**
     * Translation function with interpolation support
     * @param {string} key - Translation key
     * @param {string} defaultValue - Fallback value
     * @param {object} values - Values for interpolation
     */
    const translate = (key, defaultValue, values = {}) => {
        let text = t(key, defaultValue)
        
        // Simple interpolation - replace {{variable}} with values
        if (values && typeof text === 'string') {
            Object.keys(values).forEach(variable => {
                const regex = new RegExp(`{{${variable}}}`, 'g')
                text = text.replace(regex, values[variable])
            })
        }
        
        return text
    }

    /**
     * Format numbers according to current language
     */
    const formatNumber = (number, options = {}) => {
        try {
            return new Intl.NumberFormat(currentLanguage, options).format(number)
        } catch {
            return number.toLocaleString()
        }
    }

    /**
     * Format currency according to current language
     */
    const formatCurrency = (amount, currency = 'INR') => {
        try {
            return new Intl.NumberFormat(currentLanguage, {
                style: 'currency',
                currency: currency
            }).format(amount)
        } catch {
            // Fallback to simple format
            const symbol = currency === 'INR' ? '₹' : '$'
            return `${symbol}${amount.toLocaleString()}`
        }
    }

    /**
     * Format dates according to current language
     */
    const formatDate = (date, options = {}) => {
        try {
            return new Intl.DateTimeFormat(currentLanguage, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                ...options
            }).format(new Date(date))
        } catch {
            return new Date(date).toLocaleDateString()
        }
    }

    /**
     * Check if current language is RTL
     */
    const isRTL = () => {
        return currentLanguageInfo?.direction === 'rtl'
    }

    return {
        t: translate,
        currentLanguage,
        currentLanguageInfo,
        changeLanguage,
        isLoading,
        formatNumber,
        formatCurrency,
        formatDate,
        isRTL
    }
}

export default useTranslation
