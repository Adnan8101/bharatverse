import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
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

        try {
            jwt.verify(token.value, process.env.JWT_SECRET);
        } catch (error) {
            return NextResponse.json({
                success: false,
                error: 'Invalid token'
            }, { status: 401 });
        }

        // Fetch all store coupons with store info
        const coupons = await prisma.storeCoupon.findMany({
            orderBy: [
                { status: 'asc' }, // pending first
                { createdAt: 'desc' }
            ],
            include: {
                store: {
                    select: {
                        name: true,
                        username: true,
                        email: true
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
            error: 'Failed to fetch store coupons'
        }, { status: 500 });
    }
}
