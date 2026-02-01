import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import {
  generateContextAwarePrompt,
  getTodayEntryCount,
  getLastEntry,
  getRecentEntries,
  getHistoricalEntries,
} from '@/lib/prompt-generation';

/**
 * GET /api/ai/prompt
 * Get the current prompt for today, or generate one if none exists
 */
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

    // Check user's privacy settings
    const privacySettings = (dbUser.privacySettings as Record<string, any>) || {};
    const allowAI = privacySettings.allowAI !== false;

    // If AI features are disabled, return a generic prompt without using entry context
    if (!allowAI) {
      return NextResponse.json({
        prompt: 'What would you like to write about today?',
        entryCount: 1,
      });
    }

    // Check for existing prompt today (most recent)
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
      return NextResponse.json({
        prompt: existingPrompt.promptText,
        entryCount: existingPrompt.entryCount ?? 1,
      });
    }

    // No existing prompt - generate first one of the day
    // Only use entries where allowAI was true
    const entryCount = await getTodayEntryCount(dbUser.id, true);
    const lastEntry = await getLastEntry(dbUser.id, true);
    const recentEntries = await getRecentEntries(dbUser.id, 5, true);
    
    // Fetch historical entries for pattern analysis
    const { patterns: historicalPatterns } = await getHistoricalEntries(dbUser.id, 14, true);

    // Generate new prompt
    const generated = await generateContextAwarePrompt({
      entryCount: entryCount + 1, // Next entry count
      lastEntry,
      recentEntries,
      userId: dbUser.id,
      historicalPatterns,
    });

    // Save prompt
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await prisma.aIPrompt.create({
      data: {
        userId: dbUser.id,
        promptText: generated.promptText,
        entryCount: generated.entryCount,
        relatedEntryId: generated.relatedEntryId,
        context: generated.context as any, // Prisma JSON type
        expiresAt,
      },
    });

    return NextResponse.json({
      prompt: generated.promptText,
      entryCount: generated.entryCount,
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
