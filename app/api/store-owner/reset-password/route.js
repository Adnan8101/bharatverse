import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendPasswordResetSuccess } from '@/lib/emailService';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, newPassword, confirmPassword } = await request.json();

    if (!email || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
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
        { success: false, message: 'Invalid email address' },
        { status: 404 }
      );
    }

    // Check if reset token exists and is valid (should have been verified by verify-otp)
    if (!store.resetToken || !store.resetTokenExpiry) {
      return NextResponse.json(
        { success: false, message: 'Invalid password reset session. Please start over.' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > store.resetTokenExpiry) {
      return NextResponse.json(
        { success: false, message: 'Password reset session has expired. Please start over.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update store with new password and clear reset tokens
    await prisma.store.update({
      where: { id: store.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date()
      }
    });

    // Send success email
    await sendPasswordResetSuccess(store.email, store.name);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
