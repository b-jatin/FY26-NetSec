'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklySummaryCardProps {
  userId: string;
}

export function WeeklySummaryCard({ userId }: WeeklySummaryCardProps): JSX.Element {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSummary();
  }, [userId]);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/summary/weekly');
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/summary/weekly', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        toast({
          title: 'Success',
          description: 'Weekly summary regenerated',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate summary',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No summary available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Weekly Summary</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{summary.summary}</p>
        {summary.topThemes && summary.topThemes.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2">Top Themes:</p>
            <div className="flex flex-wrap gap-2">
              {summary.topThemes.slice(0, 5).map((theme: string) => (
                <span
                  key={theme}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
