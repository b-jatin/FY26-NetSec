import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { analyzeSentiment } from '@/lib/sentiment';
import { extractThemes } from '@/lib/theme-extraction';

const updateEntrySchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    const entry = await prisma.entry.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id,
      },
      include: {
        analysis: true,
        suggestions: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    const body = await request.json();
    const validated = updateEntrySchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check ownership
    const existingEntry = await prisma.entry.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    let sentimentScore: number | null = existingEntry.sentimentScore;
    let sentimentLabel: string | null = existingEntry.sentimentLabel;
    let themes: string[] = existingEntry.themes;
    let analyzed = existingEntry.analyzed;

    // Re-analyze sentiment and themes only if allowAnalytics was true for this entry
    if (existingEntry.allowAnalytics) {
      const sentimentResult = analyzeSentiment(validated.content);
      sentimentScore = sentimentResult.score;
      sentimentLabel = sentimentResult.label;
      
      // Extract themes with sentiment for compound theme generation
      const themeResult = extractThemes(validated.content, sentimentLabel);
      themes = themeResult.themes.slice(0, 2); // Limit to 1-2 themes
      analyzed = true;
    } else {
      // If analytics were not allowed, ensure these fields are null/empty on update
      sentimentScore = null;
      sentimentLabel = null;
      themes = [];
      analyzed = false;
    }

    const wordCount = validated.content.split(/\s+/).filter(Boolean).length;

    const entry = await prisma.entry.update({
      where: { id: params.id },
      data: {
        content: validated.content,
        wordCount,
        sentimentScore,
        sentimentLabel,
        themes,
        analyzed,
        // allowAI and allowAnalytics are not updated here as they reflect creation time settings
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    // Check ownership
    const existingEntry = await prisma.entry.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    await prisma.entry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
