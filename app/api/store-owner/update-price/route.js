import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function PUT(request) {
    try {
        // Verify store owner authentication
        const cookieStore = await cookies()
        const token = cookieStore.get('store-owner-token')
        
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'store-owner-secret-key')
        const storeId = decoded.storeId // Updated auth fix

        const { productId, price } = await request.json()

        if (!productId || !price || price <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid product ID or price' },
                { status: 400 }
            )
        }

        // Verify the product belongs to the store owner
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                storeId: storeId
            }
        })

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found or unauthorized' },
                { status: 404 }
            )
        }

        // Update the product price
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { 
                price: parseFloat(price),
                updatedAt: new Date()
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Price updated successfully',
            product: updatedProduct
        })

    } catch (error) {
        console.error('Update price error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update price' },
            { status: 500 }
        )
    }
}
