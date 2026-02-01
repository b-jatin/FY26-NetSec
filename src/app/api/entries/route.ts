import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { analyzeSentiment } from '@/lib/sentiment';
import { extractThemes } from '@/lib/theme-extraction';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserPrivacySettings } from '@/lib/privacy-utils';
import {
  generateContextAwarePrompt,
  getTodayEntryCount,
  getRecentEntries,
  getHistoricalEntries,
} from '@/lib/prompt-generation';

const createEntrySchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
        },
      });
    }

    const entries = await prisma.entry.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        wordCount: true,
        sentimentScore: true,
        sentimentLabel: true,
        themes: true,
        allowAI: true,
        allowAnalytics: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication error', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('No user found in session');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Please sign in to create entries' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createEntrySchema.parse(body);

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      try {
        dbUser = await prisma.user.create({
          data: {
            email: user.email!,
            emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
          },
        });
      } catch (dbError) {
        console.error('Error creating user:', dbError);
        throw new Error(`Failed to create user: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }
    }

    // Get user's current privacy settings
    const privacySettings = await getUserPrivacySettings(dbUser.id);
    const allowAI = privacySettings.allowAI !== false;
    const allowAnalytics = privacySettings.allowAnalytics !== false;

    const wordCount = validated.content.split(/\s+/).filter(Boolean).length;

    // Only analyze sentiment and themes if analytics is enabled
    let sentimentScore: number | null = null;
    let sentimentLabel: string | null = null;
    let themes: string[] = [];
    let analyzed = false;

    if (allowAnalytics) {
      const sentimentResult = analyzeSentiment(validated.content);
      const themeResult = extractThemes(validated.content);
      sentimentScore = sentimentResult.score;
      sentimentLabel = sentimentResult.label;
      themes = themeResult.themes.slice(0, 5); // Top 5 themes
      analyzed = true;
    }

    let entry;
    try {
      entry = await prisma.entry.create({
        data: {
          userId: dbUser.id,
          content: validated.content,
          wordCount,
          sentimentScore,
          sentimentLabel,
          themes,
          analyzed,
          allowAI, // Store privacy setting
          allowAnalytics, // Store privacy setting
        },
      });
    } catch (dbError) {
      console.error('Error creating entry:', dbError);
      if (dbError instanceof Error) {
        console.error('Error message:', dbError.message);
        console.error('Error stack:', dbError.stack);
      }
      throw dbError;
    }

    // Only generate new prompt if AI is allowed
    if (allowAI) {
      // Generate prompt asynchronously (don't block response)
      Promise.resolve().then(async () => {
        try {
          const entryCount = await getTodayEntryCount(dbUser.id, allowAI);
          const recentEntries = await getRecentEntries(dbUser.id, 5, allowAI);
          const lastEntry = recentEntries[0] || null;
          
          // Fetch historical entries for pattern analysis
          const { patterns: historicalPatterns } = await getHistoricalEntries(dbUser.id, 14, allowAI);

          const prompt = await generateContextAwarePrompt({
            entryCount,
            lastEntry,
            recentEntries,
            userId: dbUser.id,
            historicalPatterns,
          });

          // Save prompt to database
          await prisma.aIPrompt.create({
            data: {
              userId: dbUser.id,
              promptText: prompt.promptText,
              context: prompt.context as any, // Prisma JSON type
              entryCount: prompt.entryCount,
              relatedEntryId: prompt.relatedEntryId,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
          });
        } catch (error) {
          console.error('Error generating prompt:', error);
          // Don't throw - prompt generation is non-critical
        }
      });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create entry', details: errorMessage },
      { status: 500 }
    );
  }
}
