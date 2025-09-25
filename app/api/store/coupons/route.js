import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
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

        // Fetch store coupons
        const coupons = await prisma.storeCoupon.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
            include: {
                store: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: coupons
        });

    } catch (error) {
        console.error('Error fetching store coupons:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch coupons'
        }, { status: 500 });
    }
}

export async function POST(request) {
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

        const data = await request.json();

        // Validate required fields
        if (!data.code || !data.description || !data.discountValue || !data.expiresAt) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Check if coupon code already exists (in global coupons or store coupons)
        const existingCoupon = await prisma.coupon.findUnique({
            where: { code: data.code }
        });

        const existingStoreCoupon = await prisma.storeCoupon.findUnique({
            where: { code: data.code }
        });

        if (existingCoupon || existingStoreCoupon) {
            return NextResponse.json({
                success: false,
                error: 'Coupon code already exists'
            }, { status: 400 });
        }

        // Create store coupon
        const coupon = await prisma.storeCoupon.create({
            data: {
                code: data.code.toUpperCase(),
                description: data.description,
                discountType: data.discountType || 'percentage',
                discountValue: parseFloat(data.discountValue),
                maxDiscountAmount: data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : null,
                minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : 0,
                forNewUser: data.forNewUser || false,
                forMember: data.forMember || false,
                usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
                expiresAt: new Date(data.expiresAt),
                storeId,
                status: 'pending'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Coupon submitted for admin approval',
            data: coupon
        });

    } catch (error) {
        console.error('Error creating store coupon:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create coupon'
        }, { status: 500 });
    }
}
