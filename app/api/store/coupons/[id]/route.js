import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function PUT(request, { params }) {
    try {
        // Get store owner auth
        const cookieStore = cookies();
        const token = cookieStore.get('store-owner-token');
        
        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const storeId = decoded.storeId;
        const { id } = params;

        const data = await request.json();

        // Check if coupon exists and belongs to this store
        const existingCoupon = await prisma.storeCoupon.findFirst({
            where: { 
                id,
                storeId 
            }
        });

        if (!existingCoupon) {
            return NextResponse.json({
                success: false,
                error: 'Coupon not found'
            }, { status: 404 });
        }

        // Only allow editing if coupon is pending or rejected
        if (existingCoupon.status === 'approved') {
            return NextResponse.json({
                success: false,
                error: 'Cannot edit approved coupon'
            }, { status: 400 });
        }

        // Update coupon
        const updatedCoupon = await prisma.storeCoupon.update({
            where: { id },
            data: {
                code: data.code?.toUpperCase() || existingCoupon.code,
                description: data.description || existingCoupon.description,
                discountType: data.discountType || existingCoupon.discountType,
                discountValue: data.discountValue ? parseFloat(data.discountValue) : existingCoupon.discountValue,
                maxDiscountAmount: data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : existingCoupon.maxDiscountAmount,
                minOrderAmount: data.minOrderAmount !== undefined ? parseFloat(data.minOrderAmount) : existingCoupon.minOrderAmount,
                forNewUser: data.forNewUser !== undefined ? data.forNewUser : existingCoupon.forNewUser,
                forMember: data.forMember !== undefined ? data.forMember : existingCoupon.forMember,
                usageLimit: data.usageLimit ? parseInt(data.usageLimit) : existingCoupon.usageLimit,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : existingCoupon.expiresAt,
                status: 'pending', // Reset to pending on edit
                adminNote: null, // Clear admin note
                reviewedBy: null,
                reviewedAt: null
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Coupon updated and resubmitted for approval',
            data: updatedCoupon
        });

    } catch (error) {
        console.error('Error updating store coupon:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update coupon'
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        // Get store owner auth
        const cookieStore = cookies();
        const token = cookieStore.get('store-owner-token');
        
        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const storeId = decoded.storeId;
        const { id } = params;

        // Check if coupon exists and belongs to this store
        const existingCoupon = await prisma.storeCoupon.findFirst({
            where: { 
                id,
                storeId 
            }
        });

        if (!existingCoupon) {
            return NextResponse.json({
                success: false,
                error: 'Coupon not found'
            }, { status: 404 });
        }

        // Delete coupon
        await prisma.storeCoupon.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Coupon deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting store coupon:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete coupon'
        }, { status: 500 });
    }
}
