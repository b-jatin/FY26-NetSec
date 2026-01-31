import Anthropic from '@anthropic-ai/sdk';
import { maskPII } from './pii-masking';

if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
}

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ClaudeOptions {
    maxTokens?: number;
    temperature?: number;
    system?: string;
}

/**
 * Call Claude API with automatic PII masking
 */
export async function callClaude(
    messages: ClaudeMessage[],
    options: ClaudeOptions = {}
): Promise<string> {
    const { maxTokens = 1024, temperature = 0.7, system } = options;

    try {
        // Mask PII in user messages
        const maskedMessages = messages.map((msg) => ({
            ...msg,
            content: msg.role === 'user' ? maskPII(msg.content) : msg.content,
        }));

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            temperature,
            system: system || 'You are a helpful, empathetic, and privacy-conscious AI assistant.',
            messages: maskedMessages.map((msg) => ({
                role: msg.role,
                content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
            })),
        });

        const textContent = response.content.find((item) => item.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            throw new Error('No text content in Claude response');
        }

        return textContent.text;
    } catch (error) {
        console.error('Claude API error:', error);
        throw new Error(
            error instanceof Error ? error.message : 'Failed to call Claude API'
        );
    }
}

/**
 * Generate a prompt with retry logic
 */
export async function generateWithRetry(
    messages: ClaudeMessage[],
    options: ClaudeOptions = {},
    maxRetries = 3
): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await callClaude(messages, options);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');
            if (attempt < maxRetries) {
                // Exponential backoff
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    throw lastError || new Error('Failed after retries');
}
