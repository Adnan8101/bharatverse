import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendForgotPasswordOTP } from '@/lib/emailService';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find store by email
    const store = await prisma.store.findFirst({
      where: {
        email: email.toLowerCase().trim()
      }
    });

    if (!store) {
      return NextResponse.json(
        { success: false, message: 'No store found with this email address' },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (10 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);

    // Update store with reset token
    await prisma.store.update({
      where: { id: store.id },
      data: {
        resetToken: otp,
        resetTokenExpiry: expiryTime
      }
    });

    // Send OTP email
    const emailResult = await sendForgotPasswordOTP(store.email, store.name, otp);

    if (!emailResult.success) {
      // If email fails, clear the reset token
      await prisma.store.update({
        where: { id: store.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return NextResponse.json(
        { success: false, message: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email address'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
