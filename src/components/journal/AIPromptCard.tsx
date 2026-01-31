'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export function AIPromptCard(): JSX.Element {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/prompt')
      .then((res) => res.json())
      .then((data) => {
        if (data.prompt) {
          setPrompt(data.prompt);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch prompt:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-primary" />
            Today&apos;s Prompt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!prompt) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4 text-primary" />
          Today&apos;s Prompt
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{prompt}</p>
      </CardContent>
    </Card>
  );
}
