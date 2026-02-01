'use client';

import { useState } from 'react';
import { EntryEditor } from '@/components/journal/EntryEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SentimentIndicator } from '@/components/journal/SentimentIndicator';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DeleteEntryButton } from '@/components/journal/DeleteEntryButton';
import { AICompanion } from '@/components/journal/AICompanion';
import type { SentimentResult } from '@/lib/sentiment';

interface EntryDetailClientProps {
  entry: {
    id: string;
    content: string;
    createdAt: Date;
  };
  entryId: string;
  sentiment: SentimentResult | null;
  allowAI: boolean;
}

export function EntryDetailClient({ entry, entryId, sentiment, allowAI }: EntryDetailClientProps): JSX.Element {
  const [currentText, setCurrentText] = useState(entry.content);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/entries">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Entries
              </Button>
            </Link>
            <DeleteEntryButton entryId={entryId} />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Entry</CardTitle>
                <div className="flex items-center gap-4">
                  <time className="text-sm text-muted-foreground">
                    {format(new Date(entry.createdAt), 'MMMM dd, yyyy')}
                  </time>
                  {allowAI && <SentimentIndicator sentiment={sentiment} allowAI={allowAI} />}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EntryEditor 
                initialContent={entry.content} 
                entryId={entry.id}
                onContentChange={setCurrentText}
                allowAI={allowAI}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          {allowAI && <AICompanion currentText={currentText} allowAI={allowAI} />}
        </div>
      </div>
    </div>
  );
}
