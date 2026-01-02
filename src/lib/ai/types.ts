/**
 * AI Provider Types
 * 
 * This module defines the interface for AI providers, allowing easy swapping
 * between different AI services (OpenRouter, OpenAI, Anthropic, etc.)
 */

export interface AIMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface AIProviderConfig {
    apiKey: string;
    model?: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
}

export interface AIProvider {
    /**
     * Provider name for identification
     */
    name: string;

    /**
     * Send a chat request and get a complete response
     * @param messages - Array of messages in the conversation
     * @returns Complete response text
     */
    chat(messages: AIMessage[]): Promise<string>;

    /**
     * Send a chat request and stream the response
     * @param messages - Array of messages in the conversation
     * @returns AsyncIterable that yields text chunks as they arrive
     */
    chatStream(messages: AIMessage[]): AsyncIterable<string>;
}

export interface StreamChunk {
    id: string;
    choices: {
        delta: {
            content?: string;
            role?: string;
        };
        finish_reason: string | null;
        index: number;
    }[];
}
