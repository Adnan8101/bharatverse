import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// PATCH - Approve or reject product
export async function PATCH(request) {
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
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'admin-secret-key');
    const adminId = decoded.adminId || 'admin'; // Fallback for admin identification
    
    const { productId, status, adminNote } = await request.json();
    
    if (!productId || !status) {
      return NextResponse.json(
        { success: false, message: 'Product ID and status are required' },
        { status: 400 }
      );
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status must be "approved" or "rejected"' },
        { status: 400 }
      );
    }
    
    // Check if product exists and is pending
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    if (product.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Product is not pending approval' },
        { status: 400 }
      );
    }
    
    // Update product status and ensure proper stock status
    const updateData = {
      status,
      adminNote: adminNote || null,
      reviewedBy: adminId,
      reviewedAt: new Date()
    };

    // If approving, ensure the product has proper stock status
    if (status === 'approved') {
      // If product has 0 stock, set a default stock quantity
      if (product.stockQuantity === 0) {
        updateData.stockQuantity = 50; // Default stock quantity for approved products
        updateData.inStock = true;
      } else {
        updateData.inStock = product.stockQuantity > 0;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    // Log the approval/rejection
    console.log(`Product ${status} by admin: ${product.name} (Store: ${product.store.name})`);
    
    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: `Product ${status} successfully${adminNote ? ' with feedback' : ''}`
    });
    
  } catch (error) {
    console.error('Product approval API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
