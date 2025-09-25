import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock data - in production, this would be stored in a database
let paymentMethods = [];

export async function PUT(request, { params }) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const paymentMethodId = params.id;

        // First, make all user's payment methods non-default
        paymentMethods = paymentMethods.map(pm => 
            pm.userId === userId ? { ...pm, isDefault: false } : pm
        );

        // Then, set the specified payment method as default
        const updatedPaymentMethod = paymentMethods.find(pm => 
            pm.id === paymentMethodId && pm.userId === userId
        );

        if (!updatedPaymentMethod) {
            return NextResponse.json(
                { error: 'Payment method not found' },
                { status: 404 }
            );
        }

        updatedPaymentMethod.isDefault = true;

        return NextResponse.json({
            success: true,
            message: 'Default payment method updated successfully'
        });
    } catch (error) {
        console.error('Error updating default payment method:', error);
        return NextResponse.json(
            { error: 'Failed to update default payment method' },
            { status: 500 }
        );
    }
}
