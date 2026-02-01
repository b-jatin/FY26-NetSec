'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AICompanionProps {
  currentText: string;
  allowAI?: boolean;
}

export function AICompanion({ currentText, allowAI = true }: AICompanionProps): JSX.Element | null {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedText = useDebounce(currentText, 2000);

  useEffect(() => {
    if (!allowAI) {
      setSuggestion('');
      setError(null);
      setIsLoading(false);
      return;
    }
    
    if (debouncedText.length > 100) {
      setIsLoading(true);
      setSuggestion(''); // Clear previous suggestion
      setError(null); // Clear previous errors
      
      fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: debouncedText }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorMsg = errorData.details || errorData.error || `Request failed: ${res.status}`;
            throw new Error(errorMsg);
          }
          return res.json();
        })
        .then((data) => {
          if (data.suggestion && typeof data.suggestion === 'string' && data.suggestion.trim().length > 0) {
            setSuggestion(data.suggestion.trim());
            setError(null);
          } else {
            console.warn('Unexpected suggestion format:', data);
            setError('No suggestion received');
            setSuggestion('');
          }
        })
        .catch((error) => {
          console.error('Failed to fetch suggestion:', error);
          setError(error instanceof Error ? error.message : 'Failed to get suggestion');
          setSuggestion('');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setSuggestion('');
      setError(null);
      setIsLoading(false);
    }
  }, [debouncedText, allowAI]);

  if (!allowAI || (!suggestion && !isLoading && !error)) {
    return null;
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Companion
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Thinking...</p>
        ) : error ? (
          <p className="text-sm text-destructive">Error: {error}</p>
        ) : suggestion ? (
          <p className="text-sm text-muted-foreground">&ldquo;{suggestion}&rdquo;</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
