import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function PUT(request, { params }) {
    try {
        // Check admin auth
        const cookieStore = cookies();
        const token = cookieStore.get('admin-token');
        
        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        let adminEmail;
        try {
            const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
            adminEmail = decoded.email;
        } catch (error) {
            return NextResponse.json({
                success: false,
                error: 'Invalid token'
            }, { status: 401 });
        }

        const { id } = params;
        const { action, note } = await request.json();

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid action'
            }, { status: 400 });
        }

        // Check if coupon exists
        const existingCoupon = await prisma.storeCoupon.findUnique({
            where: { id },
            include: {
                store: true
            }
        });

        if (!existingCoupon) {
            return NextResponse.json({
                success: false,
                error: 'Coupon not found'
            }, { status: 404 });
        }

        if (existingCoupon.status !== 'pending') {
            return NextResponse.json({
                success: false,
                error: 'Coupon has already been reviewed'
            }, { status: 400 });
        }

        // If approving, check if coupon code conflicts with global coupons
        if (action === 'approve') {
            const conflictCoupon = await prisma.coupon.findUnique({
                where: { code: existingCoupon.code }
            });

            if (conflictCoupon) {
                return NextResponse.json({
                    success: false,
                    error: 'Coupon code conflicts with existing global coupon'
                }, { status: 400 });
            }
        }

        // Update coupon status
        const updatedCoupon = await prisma.storeCoupon.update({
            where: { id },
            data: {
                status: action === 'approve' ? 'approved' : 'rejected',
                isActive: action === 'approve',
                adminNote: note || null,
                reviewedBy: adminEmail,
                reviewedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: `Coupon ${action}d successfully`,
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
