'use client'
import { useEffect } from 'react'
import { useDynamicLanguage } from '@/contexts/DynamicLanguageContext'

export const useDynamicTranslation = () => {
    const { currentLanguage, isTranslating } = useDynamicLanguage()

    // Don't auto-translate to prevent rate limiting
    // Users will need to manually trigger translation

    return {
        currentLanguage,
        isTranslating
    }
}
