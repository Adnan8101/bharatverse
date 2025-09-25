import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentStoreId = searchParams.get('currentStoreId');
    const search = searchParams.get('search') || '';

    // Get all active stores except the current one
    const stores = await prisma.store.findMany({
      where: {
        AND: [
          { isActive: true },
          { status: 'approved' },
          ...(currentStoreId ? [{ id: { not: currentStoreId } }] : []),
          ...(search ? [{
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } }
            ]
          }] : [])
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        logo: true,
        description: true,
        address: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      stores
    });

  } catch (error) {
    console.error('Error fetching stores for chat:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stores'
    }, { status: 500 });
  }
}
