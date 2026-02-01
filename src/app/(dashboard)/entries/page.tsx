import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { EntriesPageClient } from '@/components/journal/EntriesPageClient';

export default async function EntriesPage(): Promise<JSX.Element> {
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

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser) {
    return <div>User not found</div>;
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
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Entries</h1>
      <EntriesPageClient entries={entries} />
    </div>
  );
}
