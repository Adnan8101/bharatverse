import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')

        // Define traditional art categories
        const traditionalCategories = ['painting', 'sculpture', 'pottery', 'textile', 'jewelry']

        let whereClause = {}

        if (category && category !== 'all') {
            // Specific category filter
            whereClause.category = {
                equals: category,
                mode: 'insensitive'
            }
        } else {
            // Show all traditional art products
            whereClause.category = {
                in: traditionalCategories,
                mode: 'insensitive'
            }
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                rating: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({
            success: true,
            products: products,
            total: products.length
        })

    } catch (error) {
        console.error('Error fetching traditional art products:', error)
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to fetch traditional art products',
                products: [],
                total: 0
            },
            { status: 500 }
        )
    }
}
