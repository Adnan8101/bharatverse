import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

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
    
    // Get store information
    const store = await prisma.store.findUnique({
      where: {
        id: decoded.storeId
      }
    });
    
    if (!store) {
      return NextResponse.json(
        { success: false, message: 'Store not found' },
        { status: 404 }
      );
    }

    // If store is not approved, return limited data for suspended/rejected stores
    if (store.status !== 'approved') {
      return NextResponse.json({
        success: true,
        data: {
          storeInfo: {
            name: store.name,
            status: store.status,
            email: store.email
          },
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          averageRating: 0,
          recentOrders: [],
          chartData: [],
          message: `Store is currently ${store.status}. Limited dashboard access.`
        }
      });
    }
    
    // Get dashboard data
    const [totalProducts, orders, ratings] = await Promise.all([
      // Total products for this store
      prisma.product.count({
        where: {
          storeId: decoded.storeId
        }
      }),
      
      // Total orders for this store's products
      prisma.order.findMany({
        where: {
          orderItems: {
            some: {
              product: {
                storeId: decoded.storeId
              }
            }
          }
        },
        include: {
          orderItems: {
            where: {
              product: {
                storeId: decoded.storeId
              }
            },
            include: {
              product: true
            }
          }
        }
      }),
      
      // Ratings for this store's products
      prisma.rating.findMany({
        where: {
          product: {
            storeId: decoded.storeId
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              category: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10 // Limit to last 10 ratings
      })
    ]);
    
    // Calculate total earnings from orders
    let totalEarnings = 0;
    orders.forEach(order => {
      order.orderItems.forEach(orderItem => {
        totalEarnings += orderItem.price * orderItem.quantity;
      });
    });
    
    const dashboardData = {
      totalProducts: totalProducts,
      totalEarnings: totalEarnings,
      totalOrders: orders.length,
      ratings: ratings
    };
    
    return NextResponse.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}