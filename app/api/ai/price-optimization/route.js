import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
    try {
        const { products } = await request.json()

        if (!products || products.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No products provided' },
                { status: 400 }
            )
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const recommendations = []

        for (const product of products) {
            let analysisData
            let aiSuccess = false
            
            // Try AI analysis with retry logic
            for (let attempt = 1; attempt <= 3 && !aiSuccess; attempt++) {
                try {
                    const prompt = `
                    Analyze this product for pricing optimization:
                    
                    Product: ${product.name}
                    Current Price: ₹${product.price}
                    Category: ${product.category}
                    Description: ${product.description}
                    Stock Quantity: ${product.stockQuantity}
                    
                    Based on current e-commerce market trends in India, provide pricing recommendations.
                    Consider factors like:
                    - Market demand for this category
                    - Seasonal trends
                    - Competition analysis
                    - Price elasticity
                    - Profit optimization
                    
                    Respond in this exact JSON format:
                    {
                        "shouldAdjust": true/false,
                        "suggestedPrice": number,
                        "reason": "brief explanation",
                        "confidence": number (0-100),
                        "marketTrend": "increasing/decreasing/stable",
                        "competitionLevel": "high/medium/low",
                        "expectedImpact": "brief impact description"
                    }
                    
                    Only suggest price changes if there's a compelling reason (at least 5% difference).
                    `

                    const result = await model.generateContent(prompt)
                    const response = await result.response
                    const text = response.text()

                    // Extract JSON from response
                    try {
                        const jsonMatch = text.match(/\{[\s\S]*\}/)
                        if (jsonMatch) {
                            analysisData = JSON.parse(jsonMatch[0])
                            aiSuccess = true
                        } else {
                            throw new Error('No JSON found in response')
                        }
                    } catch (parseError) {
                        if (attempt === 3) {
                            // Use fallback on final attempt
                            analysisData = generateFallbackAnalysis(product)
                            console.log(`Using fallback analysis for product ${product.id} after ${attempt} attempts`)
                        }
                    }

                    if (aiSuccess) break

                } catch (aiError) {
                    console.error(`AI attempt ${attempt} failed for product ${product.id}:`, aiError.message)
                    
                    if (attempt === 3) {
                        // Use fallback analysis after all attempts fail
                        analysisData = generateFallbackAnalysis(product)
                        console.log(`Using fallback analysis for product ${product.id} after AI failure`)
                    } else {
                        // Wait before retry (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
                    }
                }
            }

            if (analysisData && analysisData.shouldAdjust && analysisData.suggestedPrice !== product.price) {
                recommendations.push({
                    productId: product.id,
                    currentPrice: product.price,
                    suggestedPrice: analysisData.suggestedPrice,
                    reason: analysisData.reason,
                    confidence: analysisData.confidence,
                    marketTrend: analysisData.marketTrend,
                    competitionLevel: analysisData.competitionLevel,
                    expectedImpact: analysisData.expectedImpact
                })
            }

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        return NextResponse.json({
            success: true,
            recommendations,
            totalAnalyzed: products.length,
            recommendationsCount: recommendations.length
        })

    } catch (error) {
        console.error('Price optimization error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to analyze pricing' },
            { status: 500 }
        )
    }
}

function generateFallbackAnalysis(product) {
    // Simple rule-based fallback when AI fails
    const categories = {
        'electronics': { trend: 'decreasing', competition: 'high', adjustment: -0.05 },
        'clothing': { trend: 'stable', competition: 'medium', adjustment: 0.02 },
        'books': { trend: 'stable', competition: 'low', adjustment: 0.03 },
        'sports': { trend: 'increasing', competition: 'medium', adjustment: 0.08 },
        'beauty': { trend: 'increasing', competition: 'high', adjustment: 0.04 }
    }

    const categoryKey = product.category?.toLowerCase() || 'clothing'
    const categoryData = categories[categoryKey] || categories['clothing']
    
    const adjustmentFactor = categoryData.adjustment
    const suggestedPrice = Math.round(product.price * (1 + adjustmentFactor))
    
    // Only suggest if difference is significant
    const shouldAdjust = Math.abs(suggestedPrice - product.price) >= (product.price * 0.05)

    return {
        shouldAdjust,
        suggestedPrice: shouldAdjust ? suggestedPrice : product.price,
        reason: shouldAdjust ? `Market analysis suggests ${adjustmentFactor > 0 ? 'increasing' : 'decreasing'} price by ${Math.abs(adjustmentFactor * 100).toFixed(1)}% for ${categoryKey} category` : 'Current price is optimal',
        confidence: 75,
        marketTrend: categoryData.trend,
        competitionLevel: categoryData.competition,
        expectedImpact: shouldAdjust ? `Potential ${adjustmentFactor > 0 ? 'revenue increase' : 'volume increase'} expected` : 'Maintain current performance'
    }
}
