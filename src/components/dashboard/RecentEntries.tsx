'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntryCard } from '@/components/journal/EntryCard';

interface Entry {
  id: string;
  content: string;
  wordCount: number;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  themes: string[];
  createdAt: Date | string;
}

interface RecentEntriesProps {
  entries: Entry[];
}

export function RecentEntries({ entries }: RecentEntriesProps): JSX.Element {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Entries</CardTitle>
        <Link href="/entries" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
