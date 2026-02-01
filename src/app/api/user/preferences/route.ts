import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const updatePreferencesSchema = z.object({
  privacySettings: z.object({
    allowAI: z.boolean().optional(),
    allowAnalytics: z.boolean().optional(),
  }).optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: {
        privacySettings: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const privacySettings = (dbUser.privacySettings as Record<string, any>) || {
      allowAI: true,
      allowAnalytics: true,
    };

    return NextResponse.json({ privacySettings });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isPrismaError = errorMessage.includes('PrismaClientInitializationError') || errorMessage.includes('Can\'t reach data');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch preferences',
        details: isPrismaError 
          ? 'Database connection error. Please check DATABASE_URL in Vercel settings. Use connection pooling URL (port 6543) for Supabase.'
          : errorMessage
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = updatePreferencesSchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Merge existing privacy settings with new ones
    const currentSettings = (dbUser.privacySettings as Record<string, any>) || {};
    const newSettings = validated.privacySettings || {};
    const mergedSettings = {
      ...currentSettings,
      ...newSettings,
    };

    const updated = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        privacySettings: mergedSettings,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
