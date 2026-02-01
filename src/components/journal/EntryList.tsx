'use client';

import { EntryCard } from './EntryCard';

interface Entry {
  id: string;
  content: string;
  wordCount: number;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  themes: string[];
  createdAt: Date | string;
}

interface EntryListProps {
  entries: Entry[];
}

export function EntryList({ entries }: EntryListProps): JSX.Element {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No entries found. Try adjusting your search or filters, or start writing your first entry!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
