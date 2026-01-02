import { create } from "zustand";
import type { Message } from "@/lib/db/schema";
import { useSettingsStore } from "./settings-store";

interface MessageStore {
    messages: Message[];
    isLoading: boolean;
    isStreaming: boolean;
    streamingContent: string;
    error: string | null;

    // Actions
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
    setLoading: (loading: boolean) => void;
    setStreaming: (streaming: boolean) => void;
    setStreamingContent: (content: string) => void;
    appendStreamChunk: (chunk: string) => void;
    setError: (error: string | null) => void;

    // Async actions
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, content: string) => Promise<void>;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
    messages: [],
    isLoading: false,
    isStreaming: false,
    streamingContent: "",
    error: null,

    setMessages: (messages) => set({ messages }),

    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    clearMessages: () => set({ messages: [], streamingContent: "", error: null }),

    setLoading: (loading) => set({ isLoading: loading }),

    setStreaming: (streaming) => set({ isStreaming: streaming }),

    setStreamingContent: (content) => set({ streamingContent: content }),

    appendStreamChunk: (chunk) =>
        set((state) => ({
            streamingContent: state.streamingContent + chunk,
        })),

    setError: (error) => set({ error }),

    fetchMessages: async (conversationId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/conversations/${conversationId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }
            const data = await response.json();
            set({ messages: data.messages || [], isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Unknown error",
                isLoading: false,
            });
        }
    },

    sendMessage: async (conversationId: string, content: string) => {
        const store = get();

        // Add user message optimistically
        const userMessage: Message = {
            id: crypto.randomUUID(),
            conversationId,
            role: "user",
            content,
            createdAt: new Date(),
        };
        store.addMessage(userMessage);

        // Get selected model from settings store
        const selectedModel = useSettingsStore.getState().selectedModel;

        // Start streaming
        set({ isStreaming: true, streamingContent: "", error: null });

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId,
                    content,
                    model: selectedModel,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                let errorMessage = "Failed to get AI response";

                // Parse error for better message
                if (response.status === 429) {
                    errorMessage = "The selected model is currently rate-limited. Please try a different model.";
                } else if (response.status === 503 || response.status === 502) {
                    errorMessage = "The selected model is temporarily unavailable. Please try a different model.";
                } else if (errorData.includes("rate-limited") || errorData.includes("429")) {
                    errorMessage = "The selected model is currently rate-limited. Please try a different model.";
                } else if (errorData) {
                    try {
                        const parsed = JSON.parse(errorData);
                        errorMessage = parsed.error || parsed.message || errorMessage;
                    } catch {
                        errorMessage = errorData.slice(0, 200);
                    }
                }

                throw new Error(errorMessage);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Response body is not readable");
            }

            const decoder = new TextDecoder();
            let fullContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullContent += chunk;
                set({ streamingContent: fullContent });
            }

            // Add assistant message after streaming completes
            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                conversationId,
                role: "assistant",
                content: fullContent,
                createdAt: new Date(),
            };
            store.addMessage(assistantMessage);
            set({ isStreaming: false, streamingContent: "" });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "An unexpected error occurred. Please try a different model.",
                isStreaming: false,
                streamingContent: "",
            });
        }
    },
}));
