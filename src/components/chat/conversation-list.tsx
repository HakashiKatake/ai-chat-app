"use client";

import { useEffect } from "react";
import { useConversationStore } from "@/stores/conversation-store";
import { useMessageStore } from "@/stores/message-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConversationList() {
  const {
    conversations,
    activeConversationId,
    isLoading,
    fetchConversations,
    createConversation,
    deleteConversation,
    setActiveConversation,
  } = useConversationStore();

  const { fetchMessages, clearMessages } = useMessageStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    await fetchMessages(id);
  };

  const handleNewConversation = async () => {
    const newId = await createConversation();
    if (newId) {
      clearMessages();
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteConversation(id);
    if (activeConversationId === id) {
      clearMessages();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <Button
          onClick={handleNewConversation}
          variant="secondary"
          className="w-full justify-start gap-2"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 pb-4">
          {conversations.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs py-8 px-4 font-medium">
              No conversations yet
            </p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={cn(
                  "group flex items-center gap-2 px-3 py-3 cursor-pointer transition-all text-sm border-2 border-foreground font-medium",
                  activeConversationId === conversation.id
                    ? "bg-accent text-accent-foreground shadow-[2px_2px_0px_0px] shadow-foreground"
                    : "bg-card text-card-foreground hover:bg-muted"
                )}
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">
                  {conversation.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
