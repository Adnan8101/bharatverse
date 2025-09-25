import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
    try {
        const { code, cartItems } = await request.json()

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Coupon code is required' },
                { status: 400 }
            )
        }

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Cart items are required' },
                { status: 400 }
            )
        }

        // First check global coupons
        let coupon = await prisma.coupon.findUnique({
            where: { code }
        })

        let isStoreCoupon = false
        let applicableItems = []
        let totalApplicableAmount = 0

        if (coupon) {
            // Global coupon - applies to all items
            applicableItems = cartItems
            totalApplicableAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        } else {
            // Check store coupons
            const storeCoupon = await prisma.storeCoupon.findUnique({
                where: { 
                    code,
                    status: 'approved',
                    isActive: true,
                    expiresAt: {
                        gte: new Date()
                    }
                },
                include: {
                    store: true
                }
            })

            if (!storeCoupon) {
                return NextResponse.json(
                    { success: false, error: 'Invalid coupon code' },
                    { status: 404 }
                )
            }

            coupon = storeCoupon
            isStoreCoupon = true

            // For store coupons, only apply to items from that store
            const storeId = storeCoupon.storeId
            applicableItems = cartItems.filter(item => item.storeId === storeId)
            
            if (applicableItems.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'This coupon is only valid for products from ' + storeCoupon.store.name },
                    { status: 400 }
                )
            }

            totalApplicableAmount = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }

        // Check if coupon is expired
        if (coupon.expiresAt < new Date()) {
            return NextResponse.json(
                { success: false, error: 'Coupon has expired' },
                { status: 400 }
            )
        }

        // Check if coupon is active
        if (!coupon.isActive) {
            return NextResponse.json(
                { success: false, error: 'Coupon is not active' },
                { status: 400 }
            )
        }

        // Check minimum order amount
        if (totalApplicableAmount < coupon.minOrderAmount) {
            const storeName = isStoreCoupon ? ` for ${coupon.store.name} products` : ''
            return NextResponse.json(
                { 
                    success: false, 
                    error: `Minimum order value of ₹${coupon.minOrderAmount} required${storeName}` 
                },
                { status: 400 }
            )
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json(
                { success: false, error: 'Coupon usage limit exceeded' },
                { status: 400 }
            )
        }

        // Calculate discount
        let discount = 0
        if (coupon.discountType === 'percentage') {
            discount = Math.min(
                (totalApplicableAmount * coupon.discountValue) / 100, 
                coupon.maxDiscountAmount || Infinity
            )
        } else {
            discount = Math.min(coupon.discountValue, totalApplicableAmount)
        }

        return NextResponse.json({ 
            success: true, 
            data: {
                coupon: {
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                    maxDiscountAmount: coupon.maxDiscountAmount,
                    minOrderAmount: coupon.minOrderAmount,
                    isStoreCoupon,
                    storeName: isStoreCoupon ? coupon.store.name : null,
                    storeId: isStoreCoupon ? coupon.storeId : null
                },
                discount: Math.round(discount),
                applicableItems: applicableItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                })),
                applicableAmount: totalApplicableAmount
            }
        })
    } catch (error) {
        console.error('Error validating coupon:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to validate coupon' },
            { status: 500 }
        )
    }
}
