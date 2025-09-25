import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request, { params }) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const addressId = params.id

        // Check if address exists and belongs to user
        const address = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId: userId
            }
        })

        if (!address) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            )
        }

        // First, make all user's addresses non-default
        await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false }
        })

        // Then, set the specified address as default
        await prisma.address.update({
            where: { id: addressId },
            data: { isDefault: true }
        })

        return NextResponse.json({
            success: true,
            message: 'Default address updated successfully'
        })
    } catch (error) {
        console.error('Error updating default address:', error)
        return NextResponse.json(
            { error: 'Failed to update default address' },
            { status: 500 }
        )
    }
}
