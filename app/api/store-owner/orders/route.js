import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
import { sendOrderStatusUpdate } from '@/lib/emailService';

// GET - Fetch all orders for the store owner's products
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
    
    if (!store || store.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'Store not found or not approved' },
        { status: 404 }
      );
    }
    
    // Get all orders that contain products from this store
    const orders = await prisma.order.findMany({
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
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        address: {
          select: {
            id: true,
            name: true,
            phone: true,
            street: true,
            city: true,
            state: true,
            pincode: true
          }
        },
        orderItems: {
          where: {
            product: {
              storeId: decoded.storeId
            }
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                storeId: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Filter to only include orders that have items from this store
    const filteredOrders = orders.filter(order => order.orderItems.length > 0);
    
    return NextResponse.json({
      success: true,
      orders: filteredOrders
    });
    
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update order status
export async function PATCH(request) {
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
    
    const { orderId, status } = await request.json();
    
    // Verify the order contains products from this store
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        orderItems: {
          some: {
            product: {
              storeId: decoded.storeId
            }
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId
      },
      data: {
        status: status
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                store: true
              }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    // Get store details for email notification
    const store = await prisma.store.findUnique({
      where: { id: decoded.storeId },
      select: { id: true, name: true, email: true }
    });

    // Send email notification to customer about status update
    if (updatedOrder.user && store) {
      sendOrderStatusUpdate(updatedOrder, updatedOrder.user, store, status).catch(error => {
        console.error('Failed to send order status update email:', error);
      });
    }
    
    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order status updated successfully'
    });
    
  } catch (error) {
    console.error('Order update API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
