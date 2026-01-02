"use client";

import { useSettingsStore, AVAILABLE_MODELS } from "@/stores/settings-store";
import { ChevronDown } from "lucide-react";

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useSettingsStore();

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel);

  return (
    <div className="relative">
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="appearance-none bg-card text-card-foreground border-2 border-foreground px-4 py-2 pr-10 text-sm font-bold cursor-pointer shadow-[4px_4px_0px_0px] shadow-foreground hover:shadow-[2px_2px_0px_0px] hover:shadow-foreground hover:translate-x-[2px] hover:translate-y-[2px] transition-all focus:outline-none w-full"
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id} className="bg-card">
            {model.name} ({model.provider})
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
    </div>
  );
}
