import { NextResponse } from 'next/server'
import { translations } from '@/lib/translations'

export async function GET(request, { params }) {
    try {
        const { language } = await params
        
        // Get translations for the requested language
        const languageTranslations = translations[language]
        
        if (!languageTranslations) {
            // Return English as fallback
            return NextResponse.json({
                success: true,
                language: 'en',
                translations: translations.en || {}
            })
        }

        return NextResponse.json({
            success: true,
            language,
            translations: languageTranslations
        })
    } catch (error) {
        console.error('Translation API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch translations' },
            { status: 500 }
        )
    }
}
