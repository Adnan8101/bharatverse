import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailService';

export async function POST(request) {
  try {
    const { to, templateName, templateData } = await request.json();

    if (!to || !templateName) {
      return NextResponse.json(
        { success: false, message: 'Email address and template name are required' },
        { status: 400 }
      );
    }

    // Test data for different templates
    const testData = {
      orderCreated: {
        order: {
          id: 'test_order_123',
          total: 2999,
          paymentMethod: 'COD',
          status: 'ORDER_PLACED',
          createdAt: new Date(),
          orderItems: [
            {
              quantity: 2,
              price: 1499,
              product: { name: 'Test Product' }
            }
          ]
        },
        user: {
          name: 'Test Customer',
          email: to
        },
        store: {
          name: 'Test Store',
          email: 'store@test.com'
        }
      },
      forgotPasswordOTP: {
        storeName: 'Test Store',
        otp: '123456',
        email: to
      },
      storeApplicationApproved: {
        name: 'Test Store',
        username: 'teststore',
        email: to
      }
    };

    const data = templateData || testData[templateName] || {};
    const result = await sendEmail(to, templateName, data);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
