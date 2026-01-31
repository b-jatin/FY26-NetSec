'use client';

import { SentimentResult } from '@/lib/sentiment';
import { Smile, Meh, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentimentIndicatorProps {
  sentiment: SentimentResult | null;
  className?: string;
}

export function SentimentIndicator({ sentiment, className }: SentimentIndicatorProps): JSX.Element {
  if (!sentiment) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Meh className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No sentiment</span>
      </div>
    );
  }

  const getIcon = () => {
    switch (sentiment.label) {
      case 'positive':
        return <Smile className="h-5 w-5 text-sentiment-positive" />;
      case 'negative':
        return <Frown className="h-5 w-5 text-sentiment-negative" />;
      default:
        return <Meh className="h-5 w-5 text-sentiment-neutral" />;
    }
  };

  const getLabel = () => {
    switch (sentiment.label) {
      case 'positive':
        return 'Positive';
      case 'negative':
        return 'Negative';
      default:
        return 'Neutral';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {getIcon()}
      <span className="text-sm font-medium">{getLabel()}</span>
      <span className="text-xs text-muted-foreground">
        ({sentiment.score.toFixed(1)})
      </span>
    </div>
  );
}
