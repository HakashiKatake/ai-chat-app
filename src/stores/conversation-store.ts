import { create } from "zustand";
import type { Conversation } from "@/lib/db/schema";

interface ConversationStore {
    conversations: Conversation[];
    activeConversationId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    removeConversation: (id: string) => void;
    updateConversation: (id: string, updates: Partial<Conversation>) => void;
    setActiveConversation: (id: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Async actions
    fetchConversations: () => Promise<void>;
    createConversation: () => Promise<string | null>;
    deleteConversation: (id: string) => Promise<void>;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
    conversations: [],
    activeConversationId: null,
    isLoading: false,
    error: null,

    setConversations: (conversations) => set({ conversations }),

    addConversation: (conversation) =>
        set((state) => ({
            conversations: [conversation, ...state.conversations],
        })),

    removeConversation: (id) =>
        set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== id),
            activeConversationId:
                state.activeConversationId === id ? null : state.activeConversationId,
        })),

    updateConversation: (id, updates) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === id ? { ...c, ...updates } : c
            ),
        })),

    setActiveConversation: (id) => set({ activeConversationId: id }),

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch("/api/conversations");
            if (!response.ok) {
                throw new Error("Failed to fetch conversations");
            }
            const data = await response.json();
            set({ conversations: data, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Unknown error",
                isLoading: false,
            });
        }
    },

    createConversation: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch("/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error("Failed to create conversation");
            }
            const conversation = await response.json();
            get().addConversation(conversation);
            set({ isLoading: false, activeConversationId: conversation.id });
            return conversation.id;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Unknown error",
                isLoading: false,
            });
            return null;
        }
    },

    deleteConversation: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/conversations/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete conversation");
            }
            get().removeConversation(id);
            set({ isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Unknown error",
                isLoading: false,
            });
        }
    },
}));
