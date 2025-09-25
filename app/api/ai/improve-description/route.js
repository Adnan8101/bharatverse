import { NextResponse } from 'next/server';
import { improveProductDescription } from '@/lib/geminiService';

export async function POST(request) {
  try {
    const { title, description, category } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const result = await improveProductDescription(title, description, category);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error improving product description:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to improve description'
    }, { status: 500 });
  }
}
