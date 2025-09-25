import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET - Fetch rejected products for store owner to fix
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('store-owner-token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token found' },
        { status: 401 }
      );
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'store-owner-secret-key');
    
    // Get rejected products for this store
    const rejectedProducts = await prisma.product.findMany({
      where: {
        storeId: decoded.storeId,
        status: 'rejected'
      },
      orderBy: {
        reviewedAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      products: rejectedProducts,
      count: rejectedProducts.length
    });
    
  } catch (error) {
    console.error('Rejected products API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
