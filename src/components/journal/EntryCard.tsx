'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { SentimentIndicator } from './SentimentIndicator';
import { analyzeSentiment } from '@/lib/sentiment';
import { Tag } from 'lucide-react';

interface Entry {
  id: string;
  content: string;
  wordCount: number;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  themes: string[];
  createdAt: Date | string;
}

interface EntryCardProps {
  entry: Entry;
}

export function EntryCard({ entry }: EntryCardProps): JSX.Element {
  const preview = entry.content.length > 150 
    ? entry.content.substring(0, 150) + '...' 
    : entry.content;

  // Map database sentiment labels to SentimentResult format
  const mapSentimentLabel = (label: string | null): 'very happy' | 'happy' | 'neutral' | 'sad' | 'depressed' => {
    if (!label) return 'neutral';
    const lower = label.toLowerCase();
    if (lower === 'very happy' || lower === 'positive') return 'very happy';
    if (lower === 'happy') return 'happy';
    if (lower === 'sad' || lower === 'negative') return 'sad';
    if (lower === 'depressed') return 'depressed';
    return 'neutral';
  };

  const sentiment = entry.sentimentScore !== null && entry.sentimentLabel
    ? {
        score: entry.sentimentScore,
        label: mapSentimentLabel(entry.sentimentLabel),
        positiveWords: [],
        negativeWords: [],
        comparative: entry.sentimentScore / 5,
      }
    : null;

  return (
    <Link href={`/entries/${entry.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <time className="text-sm text-muted-foreground">
              {format(new Date(entry.createdAt), 'MMM dd, yyyy h:mm a')}
            </time>
            <SentimentIndicator sentiment={sentiment} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{preview}</p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {entry.themes.slice(0, 3).map((theme) => (
            <span
              key={theme}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
            >
              <Tag className="h-3 w-3" />
              {theme}
            </span>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            {entry.wordCount} words
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
