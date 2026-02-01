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

    // Get current week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Check for existing summary
    const existingSummary = await prisma.weeklySummary.findFirst({
      where: {
        userId: dbUser.id,
        weekStart: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    if (existingSummary) {
      return NextResponse.json({ summary: existingSummary });
    }

    // Get entries from past 7 days
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const entries = await prisma.entry.findMany({
      where: {
        userId: dbUser.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
        allowAnalytics: true, // Only include entries with analytics enabled
      },
      select: {
        sentimentScore: true,
        sentimentLabel: true,
        themes: true,
        createdAt: true,
      },
    });

    // Convert createdAt to Date objects
    const entriesWithDates = entries.map(entry => ({
      ...entry,
      createdAt: new Date(entry.createdAt),
    }));

    if (entriesWithDates.length === 0) {
      return NextResponse.json({ error: 'No entries found for this week' }, { status: 404 });
    }

    // Aggregate data (NO full entry text sent to Claude)
    const themeFrequency: Record<string, number> = {};
    entriesWithDates.forEach((entry) => {
      entry.themes.forEach((theme) => {
        themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
      });
    });

    const topThemes = Object.entries(themeFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);

    const avgSentiment =
      entriesWithDates.reduce((sum, e) => sum + (e.sentimentScore || 0), 0) / entriesWithDates.length;

    const sentimentTrend = entriesWithDates
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((e) => e.sentimentScore || 0);

    // Generate summary with aggregated data only
    const summaryText = await callClaude(
      [
        {
          role: 'user',
          content: `Generate a thoughtful weekly summary based on this aggregated journaling data:
- Total entries: ${entriesWithDates.length}
- Average sentiment: ${avgSentiment.toFixed(2)}
- Top themes: ${topThemes.join(', ')}
- Sentiment trend: ${sentimentTrend.map(s => s.toFixed(1)).join(', ')}

Create a narrative summary (3-4 sentences) that helps the user understand their emotional patterns and themes from the week. Be supportive and insightful.`,
        },
      ],
      {
        maxTokens: 300,
        temperature: 0.7,
        system: 'You are an empathetic journaling coach that helps users understand their emotional patterns through thoughtful summaries.',
      }
    );

    // Save summary
    const summary = await prisma.weeklySummary.create({
      data: {
        userId: dbUser.id,
        weekStart,
        weekEnd,
        summary: summaryText,
        topThemes,
        avgSentiment,
        entryCount: entriesWithDates.length,
        sentimentTrend,
      },
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly summary' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/summary/weekly
 * Regenerate the weekly summary (forces regeneration even if one exists)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Get current week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Delete existing summary if it exists (to force regeneration)
    await prisma.weeklySummary.deleteMany({
      where: {
        userId: dbUser.id,
        weekStart: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    // Get entries from past 7 days
    // Only include entries where analytics were enabled
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const entries = await prisma.entry.findMany({
      where: {
        userId: dbUser.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
        allowAnalytics: true, // Only include entries with analytics enabled
      },
      select: {
        sentimentScore: true,
        sentimentLabel: true,
        themes: true,
        createdAt: true,
      },
    });

    // Convert createdAt to Date objects
    const entriesWithDates = entries.map(entry => ({
      ...entry,
      createdAt: new Date(entry.createdAt),
    }));

    if (entriesWithDates.length === 0) {
      return NextResponse.json({ error: 'No entries found for this week' }, { status: 404 });
    }

    // Aggregate data (NO full entry text sent to Claude)
    const themeFrequency: Record<string, number> = {};
    entriesWithDates.forEach((entry) => {
      entry.themes.forEach((theme) => {
        themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
      });
    });

    const topThemes = Object.entries(themeFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);

    const avgSentiment =
      entriesWithDates.reduce((sum, e) => sum + (e.sentimentScore || 0), 0) / entriesWithDates.length;

    const sentimentTrend = entriesWithDates
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((e) => e.sentimentScore || 0);

    // Generate summary with aggregated data only
    const summaryText = await callClaude(
      [
        {
          role: 'user',
          content: `Generate a thoughtful weekly summary based on this aggregated journaling data:
- Total entries: ${entriesWithDates.length}
- Average sentiment: ${avgSentiment.toFixed(2)}
- Top themes: ${topThemes.join(', ')}
- Sentiment trend: ${sentimentTrend.map(s => s.toFixed(1)).join(', ')}

Create a narrative summary (3-4 sentences) that helps the user understand their emotional patterns and themes from the week. Be supportive and insightful.`,
        },
      ],
      {
        maxTokens: 300,
        temperature: 0.7,
        system: 'You are an empathetic journaling coach that helps users understand their emotional patterns through thoughtful summaries.',
      }
    );

    // Save new summary
    const summary = await prisma.weeklySummary.create({
      data: {
        userId: dbUser.id,
        weekStart,
        weekEnd,
        summary: summaryText,
        topThemes,
        avgSentiment,
        entryCount: entriesWithDates.length,
        sentimentTrend,
        regenerated: true, // Mark as regenerated
      },
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error regenerating weekly summary:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate weekly summary' },
      { status: 500 }
    );
  }
}
