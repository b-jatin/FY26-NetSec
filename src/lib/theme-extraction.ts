import nlp from 'compromise';

export interface ThemeResult {
    themes: string[];
    themeFrequency: Record<string, number>;
    keyPhrases: string[];
}

export function extractThemes(text: string): ThemeResult {
    try {
        const doc = nlp(text);

        // Extract nouns (likely themes)
        const nouns = doc.nouns().out('array');

        // Extract key phrases - use nouns as phrases (simpler and more reliable)
        const phrases = nouns.slice(0, 10);

        // Count frequency of themes
        const themeFrequency: Record<string, number> = {};
        const seenThemes = new Set<string>();

        nouns.forEach((noun: string) => {
            const normalized = noun.toLowerCase().trim();
            if (normalized.length > 2 && !isStopWord(normalized)) {
                seenThemes.add(normalized);
                themeFrequency[normalized] = (themeFrequency[normalized] || 0) + 1;
            }
        });

        // Get top themes by frequency
        const sortedThemes = Object.entries(themeFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([theme]) => theme);

        return {
            themes: sortedThemes,
            themeFrequency,
            keyPhrases: phrases.slice(0, 5),
        };
    } catch (error) {
        // Fallback if compromise fails entirely
        console.error('Theme extraction error:', error);
        const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const simpleThemes = [...new Set(words)].slice(0, 10);
        
        return {
            themes: simpleThemes,
            themeFrequency: {},
            keyPhrases: [],
        };
    }
}

function isStopWord(word: string): boolean {
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    ]);
    return stopWords.has(word);
}
