"use client";

import { useEffect, useRef } from "react";
import { useMessageStore } from "@/stores/message-store";
import { useConversationStore } from "@/stores/conversation-store";
import { MessageItem, StreamingMessage, ErrorMessage } from "./message-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageSquare } from "lucide-react";

export function MessageList() {
  const { messages, isStreaming, streamingContent, isLoading, error } = useMessageStore();
  const { activeConversationId } = useConversationStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, error]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
        <div className="border-2 border-foreground bg-card p-8 shadow-[8px_8px_0px_0px] shadow-foreground max-w-md text-center">
          <div className="h-16 w-16 border-2 border-foreground bg-primary flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px] shadow-foreground">
            <Bot className="h-8 w-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Welcome to AI Chat!
          </h3>
          <p className="text-sm">
            Start a new conversation or select one from the sidebar.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="border-2 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px] shadow-foreground">
          <p className="text-sm font-bold">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="min-h-full pb-4">
        {messages.length === 0 && !isStreaming && !error ? (
          <div className="flex items-center justify-center h-full min-h-[400px] p-8">
            <div className="border-2 border-foreground bg-secondary p-6 shadow-[4px_4px_0px_0px] shadow-foreground">
              <div className="h-12 w-12 border-2 border-foreground bg-card flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-center">
                Send a message to start!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            {isStreaming && streamingContent && (
              <StreamingMessage content={streamingContent} />
            )}
            {error && <ErrorMessage error={error} />}
          </>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>
    </ScrollArea>
  );
}
