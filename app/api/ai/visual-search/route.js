import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { GoogleGenerativeAI } from '@google/generative-ai'

const prisma = new PrismaClient()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
    try {
        const formData = await request.formData()
        const image = formData.get('image')

        if (!image) {
            return NextResponse.json(
                { success: false, error: 'No image provided' },
                { status: 400 }
            )
        }

        // Convert image to base64 for AI analysis
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64Image = buffer.toString('base64')

        // Get all available products
        const products = await prisma.product.findMany({
            where: {
                store: {
                    isActive: true,
                    status: 'approved'
                },
                inStock: true
            },
            include: {
                store: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (products.length === 0) {
            return NextResponse.json({
                success: true,
                results: [],
                message: 'No products available for comparison'
            })
        }

        // Use Gemini Vision to analyze the uploaded image
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `
        Analyze this uploaded image and identify the main product/object in it.
        Describe the key visual features like:
        - Product type/category
        - Color scheme
        - Shape and design
        - Material appearance
        - Style characteristics
        - Any text or branding visible

        Provide a detailed description in JSON format:
        {
            "category": "product category",
            "mainColors": ["color1", "color2"],
            "style": "style description",
            "material": "material type",
            "features": ["feature1", "feature2"],
            "keywords": ["keyword1", "keyword2", "keyword3"]
        }
        `

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: image.type
            }
        }

        const result = await model.generateContent([prompt, imagePart])
        const response = await result.response
        const analysisText = response.text()

        let imageAnalysis
        try {
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                imageAnalysis = JSON.parse(jsonMatch[0])
            } else {
                throw new Error('No JSON found in AI response')
            }
        } catch (parseError) {
            // Fallback analysis
            imageAnalysis = {
                category: 'general',
                mainColors: ['unknown'],
                style: 'general',
                material: 'unknown',
                features: ['product'],
                keywords: ['item', 'product']
            }
        }

        // Score products based on similarity to the analyzed image
        const scoredProducts = products.map(product => {
            let score = 0

            // Category matching
            if (product.category && imageAnalysis.category) {
                const productCategory = String(product.category).toLowerCase()
                const analysisCategory = String(imageAnalysis.category).toLowerCase()
                if (productCategory.includes(analysisCategory) || analysisCategory.includes(productCategory)) {
                    score += 40
                }
            }

            // Keyword matching in name and description
            const productText = `${product.name} ${product.description}`.toLowerCase()
            if (Array.isArray(imageAnalysis.keywords)) {
                imageAnalysis.keywords.forEach(keyword => {
                    if (keyword && typeof keyword === 'string' && productText.includes(keyword.toLowerCase())) {
                        score += 10
                    }
                })
            }

            // Color matching (basic)
            if (Array.isArray(imageAnalysis.mainColors)) {
                imageAnalysis.mainColors.forEach(color => {
                    if (color && typeof color === 'string' && productText.includes(color.toLowerCase())) {
                        score += 5
                    }
                })
            }

            // Style matching
            if (imageAnalysis.style && typeof imageAnalysis.style === 'string' && productText.includes(imageAnalysis.style.toLowerCase())) {
                score += 15
            }

            // Material matching
            if (imageAnalysis.material && typeof imageAnalysis.material === 'string' && productText.includes(imageAnalysis.material.toLowerCase())) {
                score += 10
            }

            // Feature matching
            if (Array.isArray(imageAnalysis.features)) {
                imageAnalysis.features.forEach(feature => {
                    if (feature && typeof feature === 'string' && productText.includes(feature.toLowerCase())) {
                        score += 8
                    }
                })
            }

            return {
                ...product,
                similarity: Math.min(score, 95) // Cap at 95% to be realistic
            }
        })

        // Filter products with meaningful similarity and sort by score
        const relevantProducts = scoredProducts
            .filter(product => product.similarity >= 20) // Minimum 20% similarity
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 12) // Return top 12 matches

        return NextResponse.json({
            success: true,
            results: relevantProducts,
            imageAnalysis,
            totalProducts: products.length,
            matchedProducts: relevantProducts.length
        })

    } catch (error) {
        console.error('Visual search error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to perform visual search' },
            { status: 500 }
        )
    }
}
