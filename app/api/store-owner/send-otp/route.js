import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/lib/emailService';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, purpose = 'password_change' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if store exists
    const store = await prisma.store.findFirst({
      where: { email }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await prisma.oTPVerification.upsert({
      where: { 
        email_purpose: {
          email,
          purpose
        }
      },
      update: {
        otp,
        expiresAt: otpExpiry,
        isUsed: false,
        createdAt: new Date()
      },
      create: {
        email,
        otp,
        purpose,
        expiresAt: otpExpiry,
        isUsed: false
      }
    });

    // Send OTP via email
    const emailContent = `
      <h2>Password Change Verification</h2>
            <p>Dear ${store.username},</p>
      <p>You have requested to change your password. Please use the following OTP to verify your identity:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #333; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p><strong>This OTP will expire in 10 minutes.</strong></p>
      <p>If you didn't request this password change, please ignore this email or contact support.</p>
      <br>
      <p>Best regards,<br>BharatVerse Team</p>
    `;

    await sendEmail(email, 'Password Change Verification - OTP', emailContent);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
