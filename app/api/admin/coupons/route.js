import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// Helper function to verify admin authentication
function verifyAdminAuth(request) {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
        throw new Error('No admin token found');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
    
    if (decoded.role !== 'admin') {
        throw new Error('Invalid admin role');
    }
    
    return decoded;
}

// GET - Get all coupons for admin (including inactive)
export async function GET(request) {
    try {
        verifyAdminAuth(request);

        const coupons = await prisma.coupon.findMany({
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
        console.error('Error fetching admin coupons:', error)
        
        if (error.message.includes('token') || error.message.includes('admin')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        return NextResponse.json(
            { success: false, error: 'Failed to fetch coupons' },
            { status: 500 }
        )
    }
}

// POST - Create new coupon (Admin only)
export async function POST(request) {
    try {
        verifyAdminAuth(request);

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

        // Check if coupon already exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        })

        if (existingCoupon) {
            return NextResponse.json(
                { success: false, error: 'Coupon code already exists' },
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

        const coupon = await prisma.coupon.create({
            data: couponData
        })

        return NextResponse.json({
            success: true,
            data: coupon,
            message: 'Coupon created successfully'
        })

    } catch (error) {
        console.error('Error creating coupon:', error)
        
        if (error.message.includes('token') || error.message.includes('admin')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        return NextResponse.json(
            { success: false, error: 'Failed to create coupon' },
            { status: 500 }
        )
    }
}
