'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import useSWR from 'swr';

interface PromptResponse {
  prompt: string;
  entryCount?: number;
}

interface AIPromptCardProps {
  refreshTrigger?: number | string; // Timestamp or entry ID to trigger refresh
  allowAI?: boolean; // Whether AI features are enabled
}

const fetcher = async (url: string): Promise<PromptResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch prompt');
  }
  return res.json();
};

export function AIPromptCard({ refreshTrigger, allowAI = true }: AIPromptCardProps): JSX.Element | null {
  // Don't fetch or show if AI features are disabled
  const { data, error, isLoading, mutate } = useSWR<PromptResponse>(
    allowAI ? '/api/ai/prompt' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  // Refresh when trigger changes (e.g., after entry save)
  useEffect(() => {
    if (allowAI && refreshTrigger !== undefined) {
      mutate();
    }
  }, [refreshTrigger, mutate, allowAI]);

  if (!allowAI) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            Writing Inspiration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.prompt) {
    return null;
  }

  const entryCount = data.entryCount ?? 1;
  const entryCountText =
    entryCount === 1
      ? 'First entry'
      : entryCount === 2
        ? 'Second entry'
        : `${entryCount}th entry`;

  return (
    <Card className="transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Writing Inspiration
          </span>
          {entryCount > 1 && (
            <span className="text-xs text-muted-foreground font-normal">
              {entryCountText}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{data.prompt}</p>
      </CardContent>
    </Card>
  );
}
