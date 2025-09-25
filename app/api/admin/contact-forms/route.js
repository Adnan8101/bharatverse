import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        // Build where clause
        const where = {};
        if (status && status !== 'all') {
            where.status = status;
        }

        // Get contact forms with pagination
        const [contactForms, total] = await Promise.all([
            prisma.contactForm.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.contactForm.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: contactForms,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error('Failed to fetch contact forms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contact forms' },
            { status: 500 }
        );
    }
}
