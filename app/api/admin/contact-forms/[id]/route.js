import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { sendContactReply } from '@/lib/emailService';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const { reply, adminName } = await request.json();

        if (!reply || !adminName) {
            return NextResponse.json(
                { error: 'Reply message and admin name are required' },
                { status: 400 }
            );
        }

        // Get the contact form
        const contactForm = await prisma.contactForm.findUnique({
            where: { id }
        });

        if (!contactForm) {
            return NextResponse.json(
                { error: 'Contact form not found' },
                { status: 404 }
            );
        }

        // Update contact form with reply
        const updatedContactForm = await prisma.contactForm.update({
            where: { id },
            data: {
                adminReply: reply,
                repliedAt: new Date(),
                repliedBy: adminName,
                status: 'replied'
            }
        });

        // Send reply email to user
        try {
            await sendContactReply(
                contactForm.email,
                contactForm.name,
                contactForm.subject,
                reply,
                adminName
            );
        } catch (emailError) {
            console.error('Failed to send reply email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Reply sent successfully!',
            data: updatedContactForm
        });

    } catch (error) {
        console.error('Failed to send reply:', error);
        return NextResponse.json(
            { error: 'Failed to send reply' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const { status } = await request.json();

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        // Update contact form status
        const updatedContactForm = await prisma.contactForm.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({
            success: true,
            message: 'Status updated successfully!',
            data: updatedContactForm
        });

    } catch (error) {
        console.error('Failed to update status:', error);
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        );
    }
}
