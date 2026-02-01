import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { EntryEditor } from '@/components/journal/EntryEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SentimentIndicator } from '@/components/journal/SentimentIndicator';
import { analyzeSentiment } from '@/lib/sentiment';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DeleteEntryButton } from '@/components/journal/DeleteEntryButton';
import { EntryDetailClient } from '@/components/journal/EntryDetailClient';

interface EntryDetailPageProps {
  params: { id: string };
}

export default async function EntryDetailPage({ params }: EntryDetailPageProps): Promise<JSX.Element> {
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

  const entry = await prisma.entry.findFirst({
    where: {
      id: params.id,
      userId: dbUser.id,
    },
  });

  if (!entry) {
    notFound();
  }

  const sentiment = entry.sentimentScore !== null && entry.sentimentLabel
    ? {
        score: entry.sentimentScore,
        label: entry.sentimentLabel as 'very happy' | 'happy' | 'neutral' | 'sad' | 'depressed',
        positiveWords: [],
        negativeWords: [],
        comparative: entry.sentimentScore / 5,
      }
    : null;

  return (
    <EntryDetailClient
      entry={entry}
      entryId={params.id}
      sentiment={sentiment}
      allowAI={entry.allowAI}
    />
  );
}
