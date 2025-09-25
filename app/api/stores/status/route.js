import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    let userId = null;
    
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      // User is not authenticated - return no store found
      return NextResponse.json({
        success: true,
        hasStore: false,
        data: null
      })
    }
    
    if (!userId) {
      return NextResponse.json({
        success: true,
        hasStore: false,
        data: null
      })
    }

    // Check if user has a store
    const store = await prisma.store.findFirst({
      where: {
        userId: userId
      },
      include: {
        user: true
      }
    })

    if (!store) {
      return NextResponse.json({
        success: true,
        hasStore: false,
        data: null
      })
    }

    return NextResponse.json({
      success: true,
      hasStore: true,
      data: store
    })

  } catch (error) {
    console.error('Error fetching store status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store status' },
      { status: 500 }
    )
  }
}
