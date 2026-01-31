'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface Entry {
  id: string;
  sentimentScore: number | null;
  createdAt: Date | string;
}

interface SentimentChartProps {
  entries: Entry[];
}

export function SentimentChart({ entries }: SentimentChartProps): JSX.Element {
  const data = entries
    .filter((e) => e.sentimentScore !== null)
    .map((entry) => ({
      date: format(new Date(entry.createdAt), 'MMM dd'),
      sentiment: entry.sentimentScore || 0,
    }))
    .slice(-30); // Last 30 entries

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No sentiment data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[-5, 5]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
