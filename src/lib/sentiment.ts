import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export interface SentimentResult {
  score: number; // -5 to +5
  label: 'positive' | 'neutral' | 'negative';
  positiveWords: string[];
  negativeWords: string[];
  comparative: number; // Normalized score
}

export function analyzeSentiment(text: string): SentimentResult {
  const result = sentiment.analyze(text);
  
  const comparative = result.comparative || 0;
  
  let label: 'positive' | 'neutral' | 'negative';
  if (comparative > 0.5) {
    label = 'positive';
  } else if (comparative < -0.5) {
    label = 'negative';
  } else {
    label = 'neutral';
  }

  return {
    score: comparative * 5, // Scale to -5 to +5 range
    label,
    positiveWords: result.positive || [],
    negativeWords: result.negative || [],
    comparative,
  };
}
