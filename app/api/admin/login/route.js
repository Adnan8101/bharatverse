import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    // Simple admin credentials check
    if (username === 'admin' && password === 'admin') {
      // Create JWT token for admin session
      const token = jwt.sign(
        { role: 'admin', username },
        process.env.JWT_SECRET || 'admin-secret-key',
        { expiresIn: '24h' }
      );
      
      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful'
      });
      
      // Set HTTP-only cookie
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 // 24 hours
      });
      
      return response;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
