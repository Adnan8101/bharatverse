import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, otp, purpose = 'password_reset' } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    if (purpose === 'password_change') {
      // Handle password change OTP verification
      const otpRecord = await prisma.oTPVerification.findUnique({
        where: {
          email_purpose: {
            email: email.toLowerCase().trim(),
            purpose
          }
        }
      });

      if (!otpRecord) {
        return NextResponse.json(
          { success: false, message: 'No OTP found for this email' },
          { status: 404 }
        );
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        return NextResponse.json(
          { success: false, message: 'OTP has expired' },
          { status: 400 }
        );
      }

      // Check if OTP is already used
      if (otpRecord.isUsed) {
        return NextResponse.json(
          { success: false, message: 'OTP has already been used' },
          { status: 400 }
        );
      }

      // Verify OTP
      if (otpRecord.otp !== otp.trim()) {
        return NextResponse.json(
          { success: false, message: 'Invalid OTP' },
          { status: 400 }
        );
      }

      // Mark OTP as used
      await prisma.oTPVerification.update({
        where: {
          email_purpose: {
            email: email.toLowerCase().trim(),
            purpose
          }
        },
        data: {
          isUsed: true
        }
      });

      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully'
      });
    }

    // Original password reset logic
    // Find store by email
    const store = await prisma.store.findFirst({
      where: {
        email: email.toLowerCase().trim()
      }
    });

    if (!store) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 404 }
      );
    }

    // Check if reset token exists and is valid
    if (!store.resetToken || !store.resetTokenExpiry) {
      return NextResponse.json(
        { success: false, message: 'No password reset request found. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > store.resetTokenExpiry) {
      // Clear expired token
      await prisma.store.update({
        where: { id: store.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (store.resetToken !== otp.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code verified successfully',
      storeId: store.id
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
