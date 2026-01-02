import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ModelOption {
    id: string;
    name: string;
    provider: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
    { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B", provider: "Mistral AI" },
    { id: "google/gemma-3-1b-it:free", name: "Gemma 3 1B", provider: "Google" },
    { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2 3B", provider: "Meta" },
    { id: "openchat/openchat-7b:free", name: "OpenChat 7B", provider: "OpenChat" },
];

interface SettingsStore {
    selectedModel: string;
    theme: "dark" | "light";
    setSelectedModel: (model: string) => void;
    setTheme: (theme: "dark" | "light") => void;
    toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            selectedModel: AVAILABLE_MODELS[0].id, // Mistral as default
            theme: "dark",
            setSelectedModel: (model) => set({ selectedModel: model }),
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
        }),
        {
            name: "ai-chat-settings",
        }
    )
);
