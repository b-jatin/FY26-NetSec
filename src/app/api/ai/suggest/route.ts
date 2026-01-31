import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callClaude } from '@/lib/anthropic';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const suggestSchema = z.object({
  text: z.string().min(100, 'Text must be at least 100 characters'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in suggest:', authError);
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Please sign in to get AI suggestions' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = suggestSchema.parse(body);

    // Check if ANTHROPIC_API_KEY is set
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service not configured', details: 'Anthropic API key is missing' },
        { status: 500 }
      );
    }

    const suggestion = await callClaude(
      [
        {
          role: 'user',
          content: `You are an empathetic journaling coach. The user wrote: "${validated.text}". Generate ONE gentle follow-up question (max 15 words) to encourage deeper reflection. Be supportive and non-judgmental.`,
        },
      ],
      {
        maxTokens: 200,
        temperature: 0.7,
        system: 'You are a helpful, empathetic journaling companion that encourages self-reflection through gentle questions.',
      }
    );

    if (!suggestion || suggestion.trim().length === 0) {
      console.error('Empty suggestion received from Claude');
      return NextResponse.json(
        { error: 'Empty response from AI', details: 'Please try again' },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestion: suggestion.trim() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error generating suggestion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate suggestion', details: errorMessage },
      { status: 500 }
    );
  }
}
