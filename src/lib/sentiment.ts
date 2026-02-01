import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export interface SentimentResult {
  score: number; // -5 to +5
  label: 'very happy' | 'happy' | 'neutral' | 'sad' | 'depressed';
  positiveWords: string[];
  negativeWords: string[];
  comparative: number; // Normalized score
}

export function analyzeSentiment(text: string): SentimentResult {
  const result = sentiment.analyze(text);
  
  const comparative = result.comparative || 0;
  
  let label: 'very happy' | 'happy' | 'neutral' | 'sad' | 'depressed';
  if (comparative > 0.4) {
    label = 'very happy';
  } else if (comparative > 0.1) {
    label = 'happy';
  } else if (comparative >= -0.1) {
    label = 'neutral';
  } else if (comparative >= -0.4) {
    label = 'sad';
  } else {
    label = 'depressed';
  }

  // Clamp the score to -5 to +5 range
  // The sentiment library's comparative can exceed ±1.0, so we need to clamp it
  const rawScore = comparative * 5;
  const clampedScore = Math.max(-5, Math.min(5, rawScore));

  return {
    score: clampedScore, // Ensure it's always between -5 and +5
    label,
    positiveWords: result.positive || [],
    negativeWords: result.negative || [],
    comparative,
  };
}
