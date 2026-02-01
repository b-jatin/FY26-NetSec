import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { SentimentChart } from '@/components/dashboard/SentimentChart';
import { WeeklySummaryCard } from '@/components/dashboard/WeeklySummaryCard';
import { RecentEntries } from '@/components/dashboard/RecentEntries';
import { ThemeCloud } from '@/components/dashboard/ThemeCloud';

export default async function DashboardPage(): Promise<JSX.Element> {
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
    return <div>Unauthorized</div>;
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
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <StatsOverview entries={entries} />
      <div className="grid gap-6 lg:grid-cols-2">
        <SentimentChart entries={entries} />
        <ThemeCloud entries={entries} />
      </div>
      <WeeklySummaryCard userId={dbUser.id} />
      <RecentEntries entries={entries.slice(0, 5)} />
    </div>
  );
}
