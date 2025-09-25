import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('store-owner-token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify JWT and get store ID
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'store-owner-secret-key');
    const storeId = decoded.storeId;

    // Fetch store data (which contains both store and owner information)
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        contact: true,
        logo: true,
        description: true,
        address: true,
        status: true,
        createdAt: true
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Format the data to match the expected structure
    const storeOwnerData = {
      username: store.username || '',
      storeName: store.name || '',
      email: store.email || '',
      phone: store.contact || '',
      profileImage: store.logo || '', // Use logo as profile image for now
      storeImage: store.logo || '',
      description: store.description || '',
      address: {
        street: store.address || '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      bankDetails: {
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        accountHolderName: ''
      }
    }

    return NextResponse.json({
      success: true,
      storeOwner: storeOwnerData
    })

  } catch (error) {
    console.error('Error fetching store owner data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('store-owner-token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify JWT and get store ID
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'store-owner-secret-key');
    const storeId = decoded.storeId;

    const profileData = await request.json()

    // Update store data (which contains both store and owner information)
    await prisma.store.update({
      where: { id: storeId },
      data: {
        username: profileData.username,
        name: profileData.storeName,
        email: profileData.email,
        contact: profileData.phone,
        logo: profileData.storeImage || profileData.profileImage,
        description: profileData.description,
        address: profileData.address.street
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Store owner profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating store owner profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
