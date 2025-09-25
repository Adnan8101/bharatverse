import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        user: true,
        product: {
          include: {
            store: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: ratings,
      count: ratings.length
    })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}
