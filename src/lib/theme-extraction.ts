import nlp from 'compromise';
import { normalizeTheme, getCanonicalTheme } from './theme-mapping';

export interface ThemeResult {
    themes: string[];
    themeFrequency: Record<string, number>;
    keyPhrases: string[];
}

/**
 * Check if a theme is of good quality (no punctuation, reasonable length, not a fragment)
 */
function isQualityTheme(theme: string): boolean {
    // No punctuation
    if (/[.,!?;:]/.test(theme)) return false;
    
    // Not too long (max 3 words)
    const words = theme.split(/\s+/);
    if (words.length > 3) return false;
    
    // Not too short (min 2 chars)
    if (theme.length < 2) return false;
    
    // Not a fragment (starts with lowercase article or pronoun)
    if (/^(a|an|the|it|its|this|that|these|those)\s/i.test(theme)) return false;
    
    // Not just punctuation or special characters
    if (/^[^a-zA-Z0-9]+$/.test(theme)) return false;
    
    return true;
}

/**
 * Score a theme based on quality and importance
 */
function scoreTheme(theme: string, frequency: number): number {
    let score = frequency; // Base score from frequency
    
    // Bonus for canonical themes (themes that map to our dictionary)
    if (getCanonicalTheme(theme)) {
        score += 10;
    }
    
    // Prefer shorter themes (1-2 words)
    const wordCount = theme.split(/\s+/).length;
    if (wordCount === 1) score += 5;
    else if (wordCount === 2) score += 2;
    
    return score;
}

/**
 * Create compound theme by combining sentiment with theme
 */
function createCompoundTheme(theme: string, sentimentLabel?: string): string {
    if (!sentimentLabel || sentimentLabel === 'neutral') {
        return theme;
    }
    
    const sentimentMap: Record<string, string> = {
        'very happy': 'joy',
        'happy': 'happiness',
        'neutral': '',
        'sad': 'stress',
        'depressed': 'struggle',
    };
    
    const emotion = sentimentMap[sentimentLabel] || '';
    if (!emotion) {
        return theme;
    }
    
    // Only create compound if theme is a canonical theme (single word)
    const words = theme.split(/\s+/);
    if (words.length === 1) {
        return `${theme} ${emotion}`;
    }
    
    // For multi-word themes, just return the theme
    return theme;
}

export function extractThemes(text: string, sentimentLabel?: string): ThemeResult {
    try {
        const doc = nlp(text);

        // Extract nouns and noun phrases (including multi-word phrases)
        const nouns = doc.nouns().out('array');
        
        // Also extract noun phrases (e.g., "web app", "my project")
        const nounPhrases = doc.match('#Noun+').out('array');
        
        // Combine and deduplicate
        const allNouns = [...new Set([...nouns, ...nounPhrases])];

        // Extract key phrases for display
        const phrases = allNouns.slice(0, 10);

        // Count frequency of normalized themes
        const themeFrequency: Record<string, number> = {};
        const seenThemes = new Set<string>();

        allNouns.forEach((noun: string) => {
            const normalized = noun.toLowerCase().trim();
            
            // Skip if too short or stop word
            if (normalized.length <= 2 || isStopWord(normalized)) {
                return;
            }
            
            // Normalize to canonical theme
            const canonicalTheme = normalizeTheme(normalized);
            
            // Skip if not a quality theme
            if (!isQualityTheme(canonicalTheme)) {
                return;
            }
            
            // Track seen themes for deduplication
            if (!seenThemes.has(canonicalTheme)) {
                seenThemes.add(canonicalTheme);
            }
            
            // Increment frequency (multiple mentions of same theme increase count)
            themeFrequency[canonicalTheme] = (themeFrequency[canonicalTheme] || 0) + 1;
        });

        // Score and sort themes by quality and frequency
        const scoredThemes = Object.entries(themeFrequency)
            .map(([theme, frequency]) => ({
                theme,
                frequency,
                score: scoreTheme(theme, frequency),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 2) // Limit to top 2 themes
            .map(({ theme }) => {
                // Create compound themes with sentiment
                return createCompoundTheme(theme, sentimentLabel);
            })
            .filter((theme) => theme.length > 0); // Filter out empty themes

        return {
            themes: scoredThemes,
            themeFrequency,
            keyPhrases: phrases.slice(0, 5),
        };
    } catch (error) {
        // Fallback if compromise fails entirely
        console.error('Theme extraction error:', error);
        const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const simpleThemes = [...new Set(words.map(w => normalizeTheme(w)))]
            .filter(theme => isQualityTheme(theme))
            .slice(0, 2)
            .map(theme => createCompoundTheme(theme, sentimentLabel));
        
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
