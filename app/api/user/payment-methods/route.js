import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock data - in production, this would be stored in a database
let paymentMethods = [];

export async function GET() {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Filter payment methods for the current user
        const userPaymentMethods = paymentMethods.filter(pm => pm.userId === userId);

        return NextResponse.json({
            success: true,
            paymentMethods: userPaymentMethods
        });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment methods' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const paymentMethodData = await request.json();

        // Create new payment method
        const newPaymentMethod = {
            id: Date.now().toString(),
            userId,
            ...paymentMethodData,
            createdAt: new Date().toISOString()
        };

        // If this is set as default, make all others non-default
        if (newPaymentMethod.isDefault) {
            paymentMethods = paymentMethods.map(pm => 
                pm.userId === userId ? { ...pm, isDefault: false } : pm
            );
        }

        paymentMethods.push(newPaymentMethod);

        return NextResponse.json({
            success: true,
            paymentMethod: newPaymentMethod,
            message: 'Payment method added successfully'
        });
    } catch (error) {
        console.error('Error adding payment method:', error);
        return NextResponse.json(
            { error: 'Failed to add payment method' },
            { status: 500 }
        );
    }
}
