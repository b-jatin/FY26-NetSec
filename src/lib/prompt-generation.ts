import { prisma } from './prisma';
import { callClaude } from './anthropic';
import { maskPII } from './pii-masking';
import type { Entry } from '@prisma/client';

interface PromptContext {
    entryCount: number;
    lastEntry?: Entry | null;
    recentEntries?: Entry[];
    userId: string;
    historicalPatterns?: HistoricalPatterns;
}

interface HistoricalPatterns {
    commonThemes: string[];
    avgSentiment: number;
    writingFrequency: number; // entries per week
    lastEntryDate: Date | null;
    gapDays: number; // days since last entry
    totalEntries: number;
    sentimentTrend: 'improving' | 'declining' | 'stable' | 'unknown';
}

interface GeneratedPrompt {
    promptText: string;
    entryCount: number;
    relatedEntryId?: string;
    context: Record<string, unknown>;
}

/**
 * Generate a context-aware prompt based on entry count and previous entries
 */
export async function generateContextAwarePrompt(
    context: PromptContext
): Promise<GeneratedPrompt> {
    const { entryCount, lastEntry, recentEntries = [], userId, historicalPatterns } = context;

    // Build context string for Claude
    let contextString = '';

    // Determine user type and situation
    const totalEntries = historicalPatterns?.totalEntries ?? 0;
    const isNewUser = totalEntries < 5;
    const hasGap = historicalPatterns && historicalPatterns.gapDays > 2;
    const hasPatterns = historicalPatterns && historicalPatterns.commonThemes.length > 0;

    if (entryCount === 1) {
        // First entry of the day
        if (isNewUser || totalEntries === 0) {
            // New user (0 entries) - very motivational and inspiring
            if (totalEntries === 0) {
                contextString = 'This is a brand new user with zero journal entries. They are just starting their journaling journey. Create an inspiring, warm, and welcoming prompt that excites them about journaling. Make it feel safe, non-judgmental, and motivational. Focus on helping them overcome blank page anxiety. The prompt should be engaging and make them eager to write. Examples of good prompts: "What small moment from today made you smile?" or "What are you grateful for right now?" or "What challenge are you proud of overcoming?"';
            } else {
                // New user (1-4 entries) - motivational and encouraging
                contextString = 'This is a new user (less than 5 total entries). Create a warm, welcoming prompt that encourages them to continue their journaling journey. Make it feel safe, non-judgmental, and motivational. Focus on helping them understand the value of journaling for mental wellness.';
            }
        } else if (hasGap) {
            // Gap detected - gentle re-engagement
            const gapText = historicalPatterns.gapDays === 1 
                ? 'yesterday' 
                : `${historicalPatterns.gapDays} days ago`;
            contextString = `The user hasn't written since ${gapText}. Create a gentle, non-judgmental prompt that welcomes them back and encourages them to share what's been on their mind. Make it feel supportive and understanding, not demanding.`;
        } else if (hasPatterns) {
            // Has patterns - reference them
            const topThemes = historicalPatterns.commonThemes.slice(0, 3).join(', ');
            const sentimentContext = historicalPatterns.sentimentTrend !== 'unknown' 
                ? ` Their overall sentiment has been ${historicalPatterns.sentimentTrend} recently.`
                : '';
            contextString = `This is the user's first entry today. They often write about: ${topThemes}.${sentimentContext} Create a prompt that acknowledges their interests while encouraging them to explore something new or reflect on their patterns. Make it feel personalized and relevant to their journaling style.`;
        } else {
            // Regular first entry - use historical context if available
            if (historicalPatterns && historicalPatterns.lastEntryDate) {
                contextString = 'This is the user\'s first entry of the day. Create a warm, encouraging prompt that helps them process their day. Make it feel natural and inviting.';
            } else {
                contextString = 'This is the user\'s first entry of the day (or possibly ever). They may be experiencing blank page anxiety. Create a warm, reassuring prompt that explicitly gives permission to start small. Make it feel safe, non-judgmental, and low-barrier.';
            }
        }
    } else if (entryCount === 2 && lastEntry) {
        // Second entry - build on first entry's themes
        const themes = lastEntry.themes.slice(0, 3).join(', ');
        const sentiment = lastEntry.sentimentLabel || 'neutral';
        
        let patternContext = '';
        if (hasPatterns && historicalPatterns) {
            const matchingThemes = historicalPatterns.commonThemes.filter(t => 
                lastEntry.themes.includes(t)
            );
            if (matchingThemes.length > 0) {
                patternContext = ` This aligns with their usual topics (${matchingThemes.join(', ')}).`;
            }
        }

        // For second entry, focus on building on the first entry, not on being a "new journaler"
        if (totalEntries === 1) {
            // This is their second entry ever - encourage continuation
            contextString = `The user just wrote their second entry today (this is only their second entry ever). Their first entry was about: ${themes || 'various topics'}, with a ${sentiment} sentiment.${patternContext} Create a prompt that encourages them to continue journaling and explore deeper thoughts or related topics. Do NOT mention that they are a "new journaler" - they've already started their journey.`;
        } else {
            // Second entry of the day (but not new user)
            contextString = `The user just wrote their second entry today. Their first entry was about: ${themes || 'various topics'}, with a ${sentiment} sentiment.${patternContext} Create a prompt that builds on this and encourages them to explore deeper or related thoughts.`;
        }
    } else if (entryCount >= 3 && lastEntry) {
        // Multiple entries - encourage reflection and pattern recognition
        const themes = lastEntry.themes.slice(0, 3).join(', ');
        const allThemes = recentEntries
            .flatMap((e) => e.themes)
            .slice(0, 5)
            .join(', ');

        let patternContext = '';
        if (hasPatterns && historicalPatterns) {
            patternContext = ` Their recurring themes include: ${historicalPatterns.commonThemes.slice(0, 3).join(', ')}.`;
        }

        contextString = `The user has written ${entryCount} entries today. Their most recent entry was about: ${themes || 'various topics'}. Overall themes today include: ${allThemes || 'various topics'}.${patternContext} Create a prompt that encourages deeper reflection, pattern recognition, or exploring connections between their thoughts.`;
    } else {
        // Fallback for edge cases
        if (hasGap && historicalPatterns) {
            contextString = `The user hasn't written in ${historicalPatterns.gapDays} days. Create a gentle, welcoming prompt that helps them get back into journaling.`;
        } else {
            contextString = 'Create a short, powerful journaling prompt that excites the user and sparks their desire to write.';
        }
    }

    // Prepare content for Claude (mask PII if using entry content)
    let userContent = contextString;
    
    if (lastEntry && entryCount > 1) {
        // For context-aware prompts, we can reference themes and sentiment
        // but we'll be careful about privacy - only use aggregated data
        const maskedContent = maskPII(lastEntry.content);
        // Only use a small snippet for context
        const contentSnippet = maskedContent.substring(0, 200);
        userContent = `${contextString}\n\nLast entry snippet (for context only, do not repeat): "${contentSnippet}..."`;
    }

    // Generate prompt using Claude
    let promptText = await callClaude(
        [
            {
                role: 'user',
                content: `Generate a motivational and inspiring journaling prompt for today. ${userContent} 

CRITICAL INSTRUCTIONS:
- Return ONLY the prompt question itself (8-12 words maximum)
- Do NOT include any explanation, description, or additional text
- Do NOT include bullet points, dashes, or lists
- Do NOT explain why the prompt is good
- Just return the question, nothing else

Example of CORRECT output:
"What's one small moment today that deserves to be remembered?"

Example of INCORRECT output (DO NOT DO THIS):
"What's one small moment today that deserves to be remembered? - Feels completely safe and non-judgmental - Requires no deep soul-searching"`,
            },
        ],
        {
            maxTokens: 30, // Reduced to prevent descriptions
            temperature: 0.8,
            system: `You are an inspiring and motivational journaling coach. Your goal is to generate concise, exciting, and encouraging prompts (8-12 words) that make the user eager to write.

CRITICAL RULES - READ CAREFULLY:
1. Return ONLY the prompt question itself (8-12 words)
2. Do NOT include explanations, descriptions, or any text beyond the prompt question
3. Do NOT include bullet points, dashes, or lists
4. Do NOT explain why the prompt is good or what it helps with
5. Do NOT include phrases like "Feels completely safe", "Requires no deep soul-searching", etc.
6. Just return the question, nothing else

Examples of CORRECT output (ONLY the prompt):
- "What small victory are you celebrating today?"
- "What made you smile today?"
- "Reflect on a moment of growth."
- "What's one small moment today that deserves to be remembered?"

Examples of INCORRECT output (DO NOT DO THIS):
- "What small victory are you celebrating today? This prompt is perfect for new journalers..."
- "What made you smile today? This prompt helps you..."
- "What's one small moment today that deserves to be remembered? - Feels completely safe and non-judgmental - Requires no deep soul-searching"

If you include ANY description, explanation, or additional text beyond the question, your response will be rejected.

Examples of concise, inspiring prompts:
- "What small victory are you celebrating today?"
- "Unleash your inner strength: what challenge will you conquer?"
- "Ignite your passion: what brings you immense joy?"
- "Reflect on growth: how far have you truly come?"
- "Dream big: what incredible future are you building?"
- "What positive energy will you cultivate today?"

You create valuable, personalized prompts for three key audiences:

1. **Mental Wellness Individuals**: Help users understand their emotional patterns through reflection. Create prompts that encourage self-awareness and emotional processing.

2. **New Journalers**: Provide gentle guidance and encouragement. Make prompts feel safe, non-judgmental, and motivational to build their journaling habit.

3. **Busy Professionals**: Create quick, effective prompts that help process the day efficiently. Focus on practical reflection that fits into a busy schedule.

Your prompts should be:
- Reassuring and non-intimidating (e.g., "Just write one sentence about your day")
- Low-barrier and accessible (e.g., "What's one thing you noticed today?")
- Explicitly permission-giving (e.g., "There's no wrong way to start—just begin")
- Specific enough to spark ideas but open enough for any response
- Personalized when patterns are detected (e.g., "You've been writing about work stress. What's one thing that went well today?")

When patterns are provided in the context:
- Reference recurring themes naturally (e.g., "You often write about family. What's a small moment with them that made you smile?")
- Acknowledge gaps gently (e.g., "It's been 3 days since your last entry. What's one moment worth remembering?")
- Build on sentiment trends (e.g., "Your mood has been improving. What's contributing to that?")

Examples of effective prompts:
- "Start with just one sentence. What's on your mind?"
- "You've been feeling stressed about work. What's one thing that went well today?"
- "It's been 3 days since your last entry. What's one moment worth remembering?"
- "You often write about family. What's a small moment with them that made you smile?"
- "What made you smile today?"
- "Reflect on a moment of growth."
- "What are you grateful for right now?"
- "What patterns do you notice in your thoughts today?"

Keep prompts concise (8-12 words), warm, and valuable. Make users feel understood and motivated to write.`,
        }
    );

    // Extract only the prompt question (remove any descriptions or explanations)
    promptText = promptText.trim();
    
    // Remove descriptions that start with common phrases or bullet points
    const descriptionPatterns = [
        /This prompt is perfect for you/i,
        /This prompt helps you/i,
        /This prompt/i,
        /because it/i,
        /as a new journaler/i,
        /new journaler/i,
        /feels completely/i,
        /feels.*safe/i,
        /requires no/i,
        /requires.*deep/i,
        /non-judgmental/i,
        /deep soul-searching/i,
        /^\s*[-–—]\s*/, // Lines starting with dashes (bullets)
    ];
    
    // Split by newlines first to handle multi-line responses
    const lines = promptText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Find the first line that ends with ? or . and looks like a question
    let questionLine = '';
    for (const line of lines) {
        const trimmed = line.trim();
        // Check if this line looks like a question (ends with ? or contains question words)
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
        // Take first line and remove anything after question mark/period
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
    
    // Ensure we end with a question mark if it's a question
    if (promptText && !promptText.match(/[?.!]$/)) {
        if (promptText.toLowerCase().includes('what') || 
            promptText.toLowerCase().includes('how') || 
            promptText.toLowerCase().includes('why') ||
            promptText.toLowerCase().includes('when') ||
            promptText.toLowerCase().includes('where')) {
            promptText += '?';
        }
    }
    
    // Final trim
    promptText = promptText.trim();

    // Build context object for storage
    const contextData: Record<string, unknown> = {
        entryCount,
        recentEntriesCount: recentEntries.length,
    };

    if (lastEntry) {
        contextData.lastEntryThemes = lastEntry.themes;
        contextData.lastEntrySentiment = lastEntry.sentimentLabel;
    }

    if (historicalPatterns) {
        contextData.historicalPatterns = {
            commonThemes: historicalPatterns.commonThemes,
            avgSentiment: historicalPatterns.avgSentiment,
            writingFrequency: historicalPatterns.writingFrequency,
            gapDays: historicalPatterns.gapDays,
            totalEntries: historicalPatterns.totalEntries,
            sentimentTrend: historicalPatterns.sentimentTrend,
        };
    }

    return {
        promptText: promptText.trim(),
        entryCount,
        relatedEntryId: lastEntry?.id,
        context: contextData,
    };
}

/**
 * Get today's entry count for a user
 * Only counts entries where allowAI was true (for prompt generation context)
 */
export async function getTodayEntryCount(userId: string, onlyWithAI: boolean = true): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = {
        userId,
        createdAt: {
            gte: today,
            lt: tomorrow,
        },
    };

    // If onlyWithAI is true, only count entries where AI features were enabled
    if (onlyWithAI) {
        where.allowAI = true;
    }

    const count = await prisma.entry.count({ where });

    return count;
}

/**
 * Get the most recent entry for a user (today's entries first, then recent)
 * Only returns entries where allowAI was true (for prompt generation context)
 */
export async function getLastEntry(userId: string, onlyWithAI: boolean = true): Promise<Entry | null> {
    // First try to get today's most recent entry with AI enabled
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayWhere: any = {
        userId,
        createdAt: {
            gte: today,
            lt: tomorrow,
        },
    };

    if (onlyWithAI) {
        todayWhere.allowAI = true;
    }

    const todayEntry = await prisma.entry.findFirst({
        where: todayWhere,
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (todayEntry) {
        return todayEntry;
    }

    // If no today's entry, get the most recent entry overall with AI enabled
    const recentWhere: any = {
        userId,
    };

    if (onlyWithAI) {
        recentWhere.allowAI = true;
    }

    const recentEntry = await prisma.entry.findFirst({
        where: recentWhere,
        orderBy: {
            createdAt: 'desc',
        },
    });

    return recentEntry;
}

/**
 * Get recent entries for context (today's entries)
 * Only returns entries where allowAI was true (for prompt generation context)
 */
export async function getRecentEntries(
    userId: string,
    limit = 5,
    onlyWithAI: boolean = true
): Promise<Entry[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = {
        userId,
        createdAt: {
            gte: today,
            lt: tomorrow,
        },
    };

    if (onlyWithAI) {
        where.allowAI = true;
    }

    const entries = await prisma.entry.findMany({
        where,
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    });

    return entries;
}

/**
 * Get historical entries from last N days with pattern analysis
 * Only returns entries where allowAI was true (for prompt generation context)
 */
export async function getHistoricalEntries(
    userId: string,
    days: number = 14,
    onlyWithAI: boolean = true
): Promise<{
    entries: Entry[];
    patterns: HistoricalPatterns;
}> {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const where: any = {
        userId,
        createdAt: {
            gte: startDate,
            lte: endDate,
        },
    };

    if (onlyWithAI) {
        where.allowAI = true;
    }

    const entries = await prisma.entry.findMany({
        where,
        orderBy: {
            createdAt: 'desc',
        },
    });

    // Calculate patterns
    const patterns: HistoricalPatterns = {
        commonThemes: [],
        avgSentiment: 0,
        writingFrequency: 0,
        lastEntryDate: null,
        gapDays: 0,
        totalEntries: entries.length,
        sentimentTrend: 'unknown',
    };

    if (entries.length === 0) {
        // Check for most recent entry to calculate gap
        const mostRecentEntry = await prisma.entry.findFirst({
            where: onlyWithAI ? { userId, allowAI: true } : { userId },
            orderBy: { createdAt: 'desc' },
        });

        if (mostRecentEntry) {
            patterns.lastEntryDate = mostRecentEntry.createdAt;
            const daysSince = Math.floor(
                (endDate.getTime() - mostRecentEntry.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            );
            patterns.gapDays = daysSince;
        }
        return { entries, patterns };
    }

    // Get most recent entry date
    patterns.lastEntryDate = entries[0].createdAt;
    const daysSince = Math.floor(
        (endDate.getTime() - entries[0].createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    patterns.gapDays = daysSince;

    // Calculate average sentiment
    const entriesWithSentiment = entries.filter((e) => e.sentimentScore !== null);
    if (entriesWithSentiment.length > 0) {
        const sum = entriesWithSentiment.reduce((acc, e) => acc + (e.sentimentScore || 0), 0);
        patterns.avgSentiment = sum / entriesWithSentiment.length;
    }

    // Calculate writing frequency (entries per week)
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    patterns.writingFrequency = (entries.length / daysDiff) * 7;

    // Find common themes
    const themeFrequency: Record<string, number> = {};
    entries.forEach((entry) => {
        entry.themes.forEach((theme) => {
            themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
        });
    });

    // Sort themes by frequency and take top 5
    patterns.commonThemes = Object.entries(themeFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([theme]) => theme);

    // Calculate sentiment trend (comparing first half vs second half of period)
    if (entriesWithSentiment.length >= 4) {
        const midpoint = Math.floor(entriesWithSentiment.length / 2);
        const firstHalf = entriesWithSentiment.slice(midpoint);
        const secondHalf = entriesWithSentiment.slice(0, midpoint);

        const firstHalfAvg =
            firstHalf.reduce((acc, e) => acc + (e.sentimentScore || 0), 0) / firstHalf.length;
        const secondHalfAvg =
            secondHalf.reduce((acc, e) => acc + (e.sentimentScore || 0), 0) / secondHalf.length;

        const diff = secondHalfAvg - firstHalfAvg;
        if (diff > 0.3) {
            patterns.sentimentTrend = 'improving';
        } else if (diff < -0.3) {
            patterns.sentimentTrend = 'declining';
        } else {
            patterns.sentimentTrend = 'stable';
        }
    }

    return { entries, patterns };
}
