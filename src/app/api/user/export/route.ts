import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

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

    const entries = await prisma.entry.findMany({
      where: { userId: dbUser.id },
      include: {
        analysis: true,
        suggestions: true,
      },
    });

    const summaries = await prisma.weeklySummary.findMany({
      where: { userId: dbUser.id },
    });

    const exportData = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        createdAt: dbUser.createdAt,
      },
      entries,
      summaries,
      exportedAt: new Date().toISOString(),
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
