import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET - Fetch all products for admin with filtering options
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No admin token found' },
        { status: 401 }
      );
    }
    
    // Verify admin JWT token
    jwt.verify(token.value, process.env.JWT_SECRET || 'admin-secret-key');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, approved, rejected, or all
    const storeId = searchParams.get('storeId');
    
    // Build where clause based on filters
    const whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (storeId) {
      whereClause.storeId = storeId;
    }
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            contact: true,
            status: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // pending first
        { createdAt: 'desc' }
      ]
    });
    
    // Get summary statistics
    const stats = await prisma.product.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    const summary = {
      total: products.length,
      pending: stats.find(s => s.status === 'pending')?._count.status || 0,
      approved: stats.find(s => s.status === 'approved')?._count.status || 0,
      rejected: stats.find(s => s.status === 'rejected')?._count.status || 0
    };
    
    return NextResponse.json({
      success: true,
      products,
      summary
    });
    
  } catch (error) {
    console.error('Admin products API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
