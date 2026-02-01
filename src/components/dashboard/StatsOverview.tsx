'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, TrendingUp, Smile, Calendar } from 'lucide-react';

interface Entry {
  id: string;
  wordCount: number;
  sentimentScore: number | null;
  allowAnalytics?: boolean;
  createdAt: Date | string;
}

interface StatsOverviewProps {
  entries: Entry[];
}

export function StatsOverview({ entries }: StatsOverviewProps): JSX.Element {
  // Filter entries with analytics enabled for sentiment calculation
  const analyticsEntries = entries.filter((e) => e.allowAnalytics !== false);

  const totalEntries = entries.length; // Show all entries for count
  const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0); // Show all entries for word count
  const avgSentiment =
    analyticsEntries.length > 0
      ? analyticsEntries.reduce((sum, e) => sum + (e.sentimentScore || 0), 0) / analyticsEntries.length
      : 0;

  // Calculate streak (consecutive days with entries)
  const entryDates = new Set(
    entries.map((e) => {
      const date = new Date(e.createdAt);
      return date.toDateString();
    })
  );

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (entryDates.has(checkDate.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  const stats = [
    {
      title: 'Total Entries',
      value: totalEntries,
      icon: BookOpen,
      description: 'Journal entries',
    },
    {
      title: 'Total Words',
      value: totalWords.toLocaleString(),
      icon: TrendingUp,
      description: 'Words written',
    },
    {
      title: 'Avg Sentiment',
      value: avgSentiment.toFixed(1),
      icon: Smile,
      description: 'Emotional tone',
    },
    {
      title: 'Day Streak',
      value: streak,
      icon: Calendar,
      description: 'Consecutive days',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
