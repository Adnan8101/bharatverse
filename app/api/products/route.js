import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        store: {
          isActive: true,  // Only show products from active stores
          status: 'approved'  // Only show products from approved stores
        },
        status: 'approved',  // Only show products that are approved by admin
        stockQuantity: {
          gt: 0  // Only show products that have stock
        }
      },
      include: {
        store: {
          include: {
            user: true
          }
        },
        rating: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
