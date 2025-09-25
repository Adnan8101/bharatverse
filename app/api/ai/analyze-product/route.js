import { NextResponse } from 'next/server';
import { analyzeProductImage } from '@/lib/geminiService';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Analyze the image with Gemini AI
    const result = await analyzeProductImage(base64Image, image.type);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        data: result.data
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in AI analysis:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze image',
      data: {
        title: 'Product Title',
        description: 'Please add a product description.',
        suggestedPrice: 999,
        category: 'Electronics',
        confidence: 0
      }
    }, { status: 500 });
  }
}
