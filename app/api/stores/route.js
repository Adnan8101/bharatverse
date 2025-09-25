import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import bcrypt from 'bcryptjs'
import { uploadSingleImage } from '@/lib/imageUpload'

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        user: true,
        Product: {
          include: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: stores,
      count: stores.length
    })
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    let userId = null;
    
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      // User is not authenticated - allow anonymous store creation
      console.log('Anonymous store creation');
    }
    
    const formData = await request.formData()
    
    const imageFile = formData.get('image')
    const password = formData.get('password')
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Upload image if provided
    let logoPath = null;
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      logoPath = await uploadSingleImage(imageFile, 'stores');
    }
    
    const storeData = {
      name: formData.get('name'),
      username: formData.get('username'),
      description: formData.get('description'),
      email: formData.get('email'),
      contact: formData.get('contact'),
      address: formData.get('address'),
      password: hashedPassword,
      userId: userId, // Can be null for anonymous stores
      status: 'pending', // Default status for new stores
      logo: logoPath // Store the uploaded image path
    }

    // Validate required fields
    if (!storeData.name || !storeData.username || !storeData.email || !storeData.contact || !password) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Check if username is already taken
    const existingStoreWithUsername = await prisma.store.findFirst({
      where: {
        username: storeData.username
      }
    })

    if (existingStoreWithUsername) {
      return NextResponse.json({
        success: false,
        error: 'Store username already taken'
      }, { status: 400 })
    }

    // If user is authenticated, check if they already have a store
    if (userId) {
      const existingStore = await prisma.store.findFirst({
        where: {
          userId: userId
        }
      })

      if (existingStore) {
        return NextResponse.json({
          success: false,
          error: 'You already have a store request',
          status: existingStore.status
        }, { status: 400 })
      }
    }

    // Create new store request
    const newStore = await prisma.store.create({
      data: storeData,
      include: {
        user: userId ? true : false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Store request submitted successfully',
      data: newStore
    })

  } catch (error) {
    console.error('Error creating store:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create store request' },
      { status: 500 }
    )
  }
}
