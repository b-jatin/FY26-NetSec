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

  // Extract only the prompt question (remove any descriptions)
  let promptText = data.prompt.trim();
  
  // Remove descriptions that start with common phrases or bullet points
  const descriptionPatterns = [
    /This prompt is perfect for you/i,
    /This prompt helps you/i,
    /This prompt/i,
    /because it/i,
    /as a new journaler/i,
    /new journaler/i,
    /perfect for you/i,
    /feels completely/i,
    /feels.*safe/i,
    /requires no/i,
    /requires.*deep/i,
    /non-judgmental/i,
    /deep soul-searching/i,
    /^\s*[-–—]\s*/, // Lines starting with dashes (bullets)
  ];
  
  // Split by newlines first
  const lines = promptText.split('\n').map(line => line.trim()).filter(line => line);
  
  // Find the first line that looks like a question
  let questionLine = '';
  for (const line of lines) {
    const trimmed = line.trim();
    // Check if this line looks like a question
    if (trimmed.match(/[?.]$/) || 
        /^(what|how|why|when|where|who|which|can|could|would|should|will|did|do|does|is|are|was|were)/i.test(trimmed)) {
      // Extract only up to the question mark or period
      const match = trimmed.match(/^(.+?)[?.]/);
      if (match) {
        questionLine = match[1] + '?';
      } else {
        questionLine = trimmed;
      }
      break;
    }
  }
  
  // If we found a question line, use it; otherwise try to extract from first line
  if (questionLine) {
    promptText = questionLine;
  } else if (lines.length > 0) {
    const firstLine = lines[0];
    const match = firstLine.match(/^(.+?)[?.]/);
    if (match) {
      promptText = match[1] + '?';
    } else {
      // Remove description patterns from first line
      let cleaned = firstLine;
      for (const pattern of descriptionPatterns) {
        cleaned = cleaned.replace(pattern, '').trim();
      }
      promptText = cleaned;
    }
  }
  
  // Final cleanup: remove any remaining description patterns
  for (const pattern of descriptionPatterns) {
    promptText = promptText.replace(pattern, '').trim();
  }
  
  // Remove anything after question mark that looks like a description
  const questionMarkIndex = promptText.indexOf('?');
  if (questionMarkIndex > 0) {
    const afterQuestion = promptText.substring(questionMarkIndex + 1).trim();
    // If there's text after the question mark, check if it's a description
    if (afterQuestion && (
      /^(feels|requires|because|this|as a|new)/i.test(afterQuestion) ||
      /^[-–—]/.test(afterQuestion)
    )) {
      promptText = promptText.substring(0, questionMarkIndex + 1).trim();
    }
  }
  
  // Final trim
  promptText = promptText.trim();

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
        <p className="text-sm">{promptText}</p>
      </CardContent>
    </Card>
  );
}
