import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContactFormConfirmation } from '@/lib/emailService';

export async function POST(request) {
    try {
        const { name, email, subject, message, type } = await request.json();

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Create contact form entry in database
        const contactForm = await prisma.contactForm.create({
            data: {
                name,
                email,
                subject,
                message,
                type: type || 'general'
            }
        });

        // Send confirmation email to user
        try {
            await sendContactFormConfirmation(email, name, subject);
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Your message has been sent successfully!',
            id: contactForm.id
        });

    } catch (error) {
        console.error('Contact form submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit contact form' },
            { status: 500 }
        );
    }
}
