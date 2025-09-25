'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useDynamicLanguage } from '@/contexts/DynamicLanguageContext'

export default function PageTranslationWrapper({ children }) {
    const pathname = usePathname()
    const { currentLanguage } = useDynamicLanguage()

    // Don't auto-translate on navigation to prevent rate limiting
    // Users will need to manually trigger translation through the language dropdown
    
    return <>{children}</>
}
