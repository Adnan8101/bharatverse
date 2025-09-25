import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gte: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: coupons,
      count: coupons.length
    })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST - Validate coupon
export async function POST(request) {
    try {
        const { code, subtotal } = await request.json()

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Coupon code is required' },
                { status: 400 }
            )
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code }
        })

        if (!coupon) {
            return NextResponse.json(
                { success: false, error: 'Invalid coupon code' },
                { status: 404 }
            )
        }

        if (coupon.expiresAt < new Date()) {
            return NextResponse.json(
                { success: false, error: 'Coupon has expired' },
                { status: 400 }
            )
        }

        if (subtotal < coupon.minOrderAmount) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: `Minimum order value of ₹${coupon.minOrderAmount} required` 
                },
                { status: 400 }
            )
        }

        // Calculate discount
        let discount = 0
        if (coupon.discountType === 'percentage') {
            discount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscountAmount || Infinity)
        } else {
            discount = coupon.discountValue
        }

        return NextResponse.json({ 
            success: true, 
            data: {
                coupon,
                discount: Math.round(discount)
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

// PUT - Create or Update coupon (Admin only)
export async function PUT(request) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { 
            code, 
            description, 
            discountType, 
            discountValue, 
            maxDiscountAmount,
            minOrderAmount,
            forNewUser,
            forMember,
            isPublic,
            isActive,
            usageLimit,
            expiresAt 
        } = body

        // Validation
        if (!code || !description || !discountType || !discountValue || !expiresAt) {
            return NextResponse.json(
                { success: false, error: 'Required fields missing' },
                { status: 400 }
            )
        }

        if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
            return NextResponse.json(
                { success: false, error: 'Percentage discount must be between 0 and 100' },
                { status: 400 }
            )
        }

        const couponData = {
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue: parseFloat(discountValue),
            maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
            minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
            forNewUser: Boolean(forNewUser),
            forMember: Boolean(forMember),
            isPublic: Boolean(isPublic),
            isActive: Boolean(isActive),
            usageLimit: usageLimit ? parseInt(usageLimit) : null,
            expiresAt: new Date(expiresAt)
        }

        const coupon = await prisma.coupon.upsert({
            where: { code: couponData.code },
            update: couponData,
            create: couponData
        })

        return NextResponse.json({
            success: true,
            data: coupon,
            message: 'Coupon saved successfully'
        })

    } catch (error) {
        console.error('Error creating/updating coupon:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to save coupon' },
            { status: 500 }
        )
    }
}

// DELETE - Delete coupon (Admin only)
export async function DELETE(request) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Coupon code is required' },
                { status: 400 }
            )
        }

        await prisma.coupon.delete({
            where: { code }
        })

        return NextResponse.json({
            success: true,
            message: 'Coupon deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting coupon:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete coupon' },
            { status: 500 }
        )
    }
}
