/**
 * OpenRouter AI Provider
 * 
 * Implementation of the AIProvider interface for OpenRouter.
 * OpenRouter provides access to multiple models through a unified API
 * that is compatible with OpenAI's format.
 * 
 * @see https://openrouter.ai/docs
 */

import type { AIProvider, AIMessage, AIProviderConfig, StreamChunk } from "../types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Free model for testing - can be changed to any OpenRouter model
// Options: google/gemma-3-1b-it:free, mistralai/mistral-7b-instruct:free, nousresearch/hermes-3-llama-3.1-405b:free
const DEFAULT_MODEL = "mistralai/mistral-7b-instruct:free";

export function createOpenRouterProvider(config: AIProviderConfig): AIProvider {
    const {
        apiKey,
        model = DEFAULT_MODEL,
        baseUrl = OPENROUTER_BASE_URL,
        maxTokens = 4096,
        temperature = 0.7,
    } = config;

    if (!apiKey) {
        throw new Error("OpenRouter API key is required");
    }

    const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "AI Chat App",
    };

    return {
        name: "openrouter",

        async chat(messages: AIMessage[]): Promise<string> {
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    model,
                    messages,
                    max_tokens: maxTokens,
                    temperature,
                    stream: false,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || "";
        },

        async *chatStream(messages: AIMessage[]): AsyncIterable<string> {
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    model,
                    messages,
                    max_tokens: maxTokens,
                    temperature,
                    stream: true,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Response body is not readable");
            }

            const decoder = new TextDecoder();
            let buffer = "";

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || !trimmed.startsWith("data: ")) continue;

                        const data = trimmed.slice(6);
                        if (data === "[DONE]") return;

                        try {
                            const chunk: StreamChunk = JSON.parse(data);
                            const content = chunk.choices[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        } catch {
                            // Skip invalid JSON lines
                            continue;
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        },
    };
}
