import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { callClaude } from '@/lib/anthropic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing prompt today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingPrompt = await prisma.aIPrompt.findFirst({
      where: {
        userId: dbUser.id,
        generatedAt: {
          gte: today,
          lt: tomorrow,
        },
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    if (existingPrompt) {
      return NextResponse.json({ prompt: existingPrompt.promptText });
    }

    // Get recent entries for context
    const recentEntries = await prisma.entry.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        themes: true,
        sentimentLabel: true,
      },
    });

    const context = recentEntries.length > 0
      ? `The user has been writing about: ${recentEntries.flatMap(e => e.themes).slice(0, 5).join(', ')}. Recent sentiment: ${recentEntries[0]?.sentimentLabel || 'neutral'}.`
      : 'This is a new user starting their journaling journey.';

    const promptText = await callClaude(
      [
        {
          role: 'user',
          content: `Generate a thoughtful, encouraging journaling prompt for today. ${context} Make it specific and engaging (max 20 words).`,
        },
      ],
      {
        maxTokens: 150,
        temperature: 0.8,
        system: 'You are a creative journaling coach that generates inspiring, thought-provoking prompts.',
      }
    );

    // Save prompt
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await prisma.aIPrompt.create({
      data: {
        userId: dbUser.id,
        promptText,
        context: { recentEntries: recentEntries.length },
        expiresAt,
      },
    });

    return NextResponse.json({ prompt: promptText });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
