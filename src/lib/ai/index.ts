/**
 * AI Provider Factory
 * 
 * This module provides a single entry point for accessing AI functionality.
 * To switch AI providers, modify the getAIProvider function below.
 * 
 * The modular design allows easy switching between:
 * - OpenRouter (current)
 * - OpenAI (future)
 * - Anthropic (future)
 * - Any other provider implementing the AIProvider interface
 */

import type { AIProvider, AIProviderConfig } from "./types";
import { createOpenRouterProvider } from "./providers/openrouter";

// Re-export types for convenience
export type { AIProvider, AIMessage, AIProviderConfig } from "./types";

// Default model (Mistral)
const DEFAULT_MODEL = "mistralai/mistral-7b-instruct:free";

/**
 * Get the configured AI provider
 * 
 * @param modelOverride - Optional model to use instead of default
 */
export function getAIProvider(modelOverride?: string): AIProvider {
    const config: AIProviderConfig = {
        apiKey: process.env.OPENROUTER_API_KEY || "",
        model: modelOverride || DEFAULT_MODEL,
    };

    return createOpenRouterProvider(config);
}

/**
 * Create a provider with custom configuration
 * Useful for testing or when different components need different settings
 */
export function createProvider(
    type: "openrouter", // Add more types as providers are implemented
    config: AIProviderConfig
): AIProvider {
    switch (type) {
        case "openrouter":
            return createOpenRouterProvider(config);
        default:
            throw new Error(`Unknown provider type: ${type}`);
    }
}
