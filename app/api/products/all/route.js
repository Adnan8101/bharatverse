import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                rating: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Group products by category
        const productsByCategory = products.reduce((acc, product) => {
            const category = product.category?.toLowerCase() || 'uncategorized'
            if (!acc[category]) {
                acc[category] = []
            }
            acc[category].push(product)
            return acc
        }, {})

        return NextResponse.json({
            success: true,
            total: products.length,
            products: products,
            productsByCategory: productsByCategory,
            categories: Object.keys(productsByCategory).sort()
        })

    } catch (error) {
        console.error('Error fetching all products:', error)
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to fetch products',
                total: 0,
                products: [],
                productsByCategory: {},
                categories: []
            },
            { status: 500 }
        )
    }
}
