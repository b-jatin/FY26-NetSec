declare module 'sentiment' {
  interface SentimentAnalysis {
    score: number;
    comparative: number;
    calculation: Array<{ [key: string]: number }>;
    tokens: string[];
    words: string[];
    positive: string[];
    negative: string[];
  }

  class Sentiment {
    analyze(phrase: string, options?: any): SentimentAnalysis;
  }

  export = Sentiment;
}
