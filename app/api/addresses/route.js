import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Ensure user exists in our database
async function ensureUser(userId, userEmail, userName) {
    try {
        let user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            try {
                user = await prisma.user.create({
                    data: {
                        id: userId,
                        email: userEmail || '',
                        name: userName || 'User',
                        image: '', // You can add user image later
                        cart: {}
                    }
                })
            } catch (createError) {
                // If user already exists (race condition), fetch it
                if (createError.code === 'P2002') {
                    user = await prisma.user.findUnique({
                        where: { id: userId }
                    })
                } else {
                    throw createError
                }
            }
        }

        return user
    } catch (error) {
        console.error('Error ensuring user exists:', error)
        return null
    }
}

// GET - Fetch user addresses
export async function GET() {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Ensure user exists in our database
        await ensureUser(userId)

        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ success: true, addresses })
    } catch (error) {
        console.error('Error fetching addresses:', error)
        return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
    }
}

// POST - Create new address
export async function POST(request) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, phone, street, city, state, pincode, isDefault = false } = body

        // Validate required fields
        if (!name || !phone || !street || !city || !state || !pincode) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        // Ensure user exists in our database
        await ensureUser(userId)

        // If this is set as default, make all other addresses non-default
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            })
        }

        const address = await prisma.address.create({
            data: {
                userId,
                name,
                phone,
                street,
                city,
                state,
                pincode,
                isDefault
            }
        })

        return NextResponse.json({ success: true, address })
    } catch (error) {
        console.error('Error creating address:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create address' },
            { status: 500 }
        )
    }
}
