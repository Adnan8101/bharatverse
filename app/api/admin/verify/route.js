import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: 'No admin token found' },
        { status: 401 }
      );
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
      
      if (decoded.role === 'admin') {
        return NextResponse.json({
          authenticated: true,
          username: decoded.username
        });
      } else {
        return NextResponse.json(
          { authenticated: false, message: 'Invalid admin role' },
          { status: 401 }
        );
      }
    } catch (jwtError) {
      return NextResponse.json(
        { authenticated: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
