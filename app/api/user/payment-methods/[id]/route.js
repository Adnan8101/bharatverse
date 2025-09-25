import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock data - in production, this would be stored in a database
let paymentMethods = [];

export async function DELETE(request, { params }) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const paymentMethodId = params.id;

        // Find and remove the payment method
        const initialLength = paymentMethods.length;
        paymentMethods = paymentMethods.filter(pm => 
            !(pm.id === paymentMethodId && pm.userId === userId)
        );

        if (paymentMethods.length === initialLength) {
            return NextResponse.json(
                { error: 'Payment method not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Payment method deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting payment method:', error);
        return NextResponse.json(
            { error: 'Failed to delete payment method' },
            { status: 500 }
        );
    }
}
