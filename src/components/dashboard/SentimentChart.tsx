'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isSameDay } from 'date-fns';

interface Entry {
  id: string;
  sentimentScore: number | null;
  allowAnalytics?: boolean;
  createdAt: Date | string;
}

interface SentimentChartProps {
  entries: Entry[];
}

export function SentimentChart({ entries }: SentimentChartProps): JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Only include entries where analytics were enabled
  // Entries come in DESC order (newest first), so we reverse to show chronological order (oldest to newest)
  const filteredEntries = entries
    .filter((e) => e.allowAnalytics !== false && e.sentimentScore !== null)
    .slice(-30) // Last 30 entries (oldest 30 when reversed)
    .reverse(); // Reverse to show oldest to newest (chronological order)

  // Prepare data with date, time, and full timestamp
  // Clamp sentiment scores to -5 to 5 range (in case old entries have out-of-range values)
  const data = filteredEntries.map((entry, index) => {
    const date = new Date(entry.createdAt);
    const prevDate = index > 0 ? new Date(filteredEntries[index - 1].createdAt) : null;
    // Show date when it's the first entry or when the date changes from previous entry
    const showDate = !prevDate || !isSameDay(date, prevDate);
    
    // Clamp sentiment score to ensure it's within -5 to 5 range
    const rawSentiment = entry.sentimentScore || 0;
    const clampedSentiment = Math.max(-5, Math.min(5, rawSentiment));
    
    return {
      timestamp: date.getTime(),
      date: format(date, 'MMM dd'),
      time: format(date, 'HH:mm'),
      sentiment: clampedSentiment,
      showDate, // Flag to show date label
      fullLabel: showDate ? `${format(date, 'MMM dd')} ${format(date, 'HH:mm')}` : format(date, 'HH:mm'),
      dateString: format(date, 'yyyy-MM-dd'), // For easier comparison
    };
  });

  // Create a map for quick lookup by timestamp
  const dataMap = new Map(data.map((d) => [d.timestamp, d]));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No sentiment data yet</p>
        </CardContent>
      </Card>
    );
  }

  const textColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  // Custom tick formatter to show time, and date only when it changes
  const formatXAxisTick = (value: number) => {
    const dataPoint = dataMap.get(value);
    if (!dataPoint) return '';
    
    // Show date + time for first entry of each day, otherwise just time
    return dataPoint.showDate ? dataPoint.fullLabel : dataPoint.time;
  };

  // Custom tooltip formatter
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      if (!dataPoint) return null;
      
      return (
        <div
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '4px',
            padding: '8px 12px',
          }}
        >
          <p style={{ margin: 0, color: textColor, fontWeight: 500 }}>
            {format(new Date(dataPoint.timestamp), 'MMM dd, yyyy HH:mm')}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#14b8a6', fontWeight: 600 }}>
            Sentiment Score: {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Score Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="timestamp"
              stroke={textColor}
              tickFormatter={formatXAxisTick}
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[-5, 5]} 
              allowDataOverflow={false}
              stroke={textColor}
              label={{ 
                value: 'Sentiment Score', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: textColor }
              }}
            />
            <Tooltip content={customTooltip} />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
