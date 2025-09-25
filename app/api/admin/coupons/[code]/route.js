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

// GET - Get specific coupon
export async function GET(request, { params }) {
    try {
        verifyAdminAuth(request);

        const { code } = params

        const coupon = await prisma.coupon.findUnique({
            where: { code }
        })

        if (!coupon) {
            return NextResponse.json(
                { success: false, error: 'Coupon not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: coupon
        })

    } catch (error) {
        console.error('Error fetching coupon:', error)
        
        if (error.message.includes('token') || error.message.includes('admin')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        return NextResponse.json(
            { success: false, error: 'Failed to fetch coupon' },
            { status: 500 }
        )
    }
}

// PUT - Update specific coupon
export async function PUT(request, { params }) {
    try {
        verifyAdminAuth(request);

        const { code } = params
        const body = await request.json()
        const { 
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
        if (!description || !discountType || !discountValue || !expiresAt) {
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

        const updateData = {
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

        const coupon = await prisma.coupon.update({
            where: { code },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            data: coupon,
            message: 'Coupon updated successfully'
        })

    } catch (error) {
        console.error('Error updating coupon:', error)
        
        if (error.message.includes('token') || error.message.includes('admin')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        return NextResponse.json(
            { success: false, error: 'Failed to update coupon' },
            { status: 500 }
        )
    }
}

// DELETE - Delete specific coupon
export async function DELETE(request, { params }) {
    try {
        verifyAdminAuth(request);

        const { code } = params

        await prisma.coupon.delete({
            where: { code }
        })

        return NextResponse.json({
            success: true,
            message: 'Coupon deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting coupon:', error)
        
        if (error.message.includes('token') || error.message.includes('admin')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        return NextResponse.json(
            { success: false, error: 'Failed to delete coupon' },
            { status: 500 }
        )
    }
}
