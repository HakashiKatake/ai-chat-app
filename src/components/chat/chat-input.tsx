"use client";

import { useState, useRef, useEffect } from "react";
import { useMessageStore } from "@/stores/message-store";
import { useConversationStore } from "@/stores/conversation-store";
import { useSettingsStore, AVAILABLE_MODELS } from "@/stores/settings-store";
import { Button } from "@/components/ui/button";
import { Send, ChevronDown } from "lucide-react";

export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming } = useMessageStore();
  const { activeConversationId, createConversation } = useConversationStore();
  const { selectedModel, setSelectedModel } = useSettingsStore();

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isStreaming) return;

    let conversationId = activeConversationId;

    // Create a new conversation if none is active
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) return;
    }

    const message = input.trim();
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendMessage(conversationId, message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t-2 border-foreground bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Input Row */}
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isStreaming}
              rows={1}
              className="w-full resize-none border-2 border-foreground bg-input text-foreground px-4 py-3 text-sm shadow-[4px_4px_0px_0px] shadow-foreground transition-shadow placeholder:text-muted-foreground focus:outline-none focus:shadow-[2px_2px_0px_0px] focus:shadow-foreground disabled:cursor-not-allowed disabled:opacity-50 max-h-[200px]"
            />
          </div>

          {/* Model Selector */}
          <div className="relative shrink-0">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none h-12 bg-card text-card-foreground border-2 border-foreground px-3 pr-8 text-xs font-bold cursor-pointer shadow-[4px_4px_0px_0px] shadow-foreground hover:shadow-[2px_2px_0px_0px] hover:shadow-foreground hover:translate-x-[2px] hover:translate-y-[2px] transition-all focus:outline-none w-28 sm:w-36"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id} className="bg-card text-xs">
                  {model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="h-12 w-12 shrink-0"
            disabled={!input.trim() || isStreaming}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center font-medium">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
