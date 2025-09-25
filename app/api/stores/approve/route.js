import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendStoreApprovalEmail, sendStoreRejectionEmail } from '@/lib/emailService'

export async function PATCH(request) {
  try {
    const { storeId, status, rejectionReason } = await request.json()
    
    if (!storeId || !status) {
      return NextResponse.json(
        { success: false, error: 'Store ID and status are required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update store status and activation
    const updateData = {
      status: status,
      updatedAt: new Date()
    };
    
    // When approving a store, also activate it
    if (status === 'approved') {
      updateData.isActive = true;
    } else if (status === 'rejected') {
      updateData.isActive = false;
    }
    
    const updatedStore = await prisma.store.update({
      where: {
        id: storeId
      },
      data: updateData,
      include: {
        user: true
      }
    })

    // Send email notifications based on status
    if (status === 'approved') {
      sendStoreApprovalEmail(updatedStore).catch(error => {
        console.error('Failed to send store approval email:', error);
      });
    } else if (status === 'rejected') {
      sendStoreRejectionEmail(updatedStore, rejectionReason).catch(error => {
        console.error('Failed to send store rejection email:', error);
      });
    }

    return NextResponse.json({
      success: true,
      message: `Store ${status} successfully`,
      data: updatedStore
    })

  } catch (error) {
    console.error('Error updating store status:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update store status' },
      { status: 500 }
    )
  }
}
