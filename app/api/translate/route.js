import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
    try {
        const { content, targetLanguage, sourceLanguage = 'en' } = await request.json()

        if (!content || !targetLanguage) {
            return NextResponse.json(
                { success: false, error: 'Content and target language are required' },
                { status: 400 }
            )
        }

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        // Create a comprehensive prompt for translation
        const prompt = `
You are a professional translator for an e-commerce website called "BharatVerse". 
Please translate the following content from ${sourceLanguage} to ${targetLanguage}.

IMPORTANT GUIDELINES:
1. Maintain the HTML structure exactly as provided
2. Only translate the text content, not HTML tags, attributes, or CSS classes
3. Preserve all formatting, spacing, and special characters
4. Keep all URLs, email addresses, and technical terms unchanged
5. Maintain cultural appropriateness for the target language
6. Use natural, fluent language that sounds native
7. For e-commerce terms, use commonly accepted translations in ${targetLanguage}
8. Keep brand names like "BharatVerse" unchanged
9. Preserve all placeholder variables like {{variable}} unchanged
10. If you encounter technical terms or proper nouns, keep them in English

Content to translate:
${content}

Please provide only the translated content without any additional explanations or comments.
`

        const result = await model.generateContent(prompt)
        const translatedContent = result.response.text()

        return NextResponse.json({
            success: true,
            translatedContent: translatedContent.trim(),
            sourceLanguage,
            targetLanguage
        })

    } catch (error) {
        console.error('Gemini Translation Error:', error)
        return NextResponse.json(
            { success: false, error: 'Translation failed', details: error.message },
            { status: 500 }
        )
    }
}
