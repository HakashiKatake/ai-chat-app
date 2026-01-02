"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Trash2 } from "lucide-react";
import type { Message } from "@/lib/db/schema";
import { useMessageStore } from "@/stores/message-store";

interface MessageItemProps {
  message: Message;
  onDelete?: (id: string) => void;
}

export function MessageItem({ message, onDelete }: MessageItemProps) {
  const { data: session } = useSession();
  const isUser = message.role === "user";

  const handleDelete = async () => {
    if (!confirm("Delete this message?")) return;
    
    try {
      const response = await fetch(`/api/messages/${message.id}`, {
        method: "DELETE",
      });
      
      if (response.ok && onDelete) {
        onDelete(message.id);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  return (
    <div
      className={cn(
        "group flex gap-3 py-4 px-4 md:px-8",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <Avatar className="h-10 w-10 border-2 border-foreground shrink-0">
          <AvatarImage 
            src={session?.user?.image || undefined} 
            alt={session?.user?.name || "User"} 
          />
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-10 w-10 border-2 border-foreground bg-secondary flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px] shadow-foreground">
          <Bot className="h-5 w-5" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "relative max-w-[70%] p-4 border-2 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground",
          isUser
            ? "bg-accent text-accent-foreground"
            : "bg-card text-card-foreground"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold mb-2 uppercase tracking-wide opacity-70">
            {isUser ? (session?.user?.name || "You") : "AI Assistant"}
          </p>
          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1"
            onClick={handleDelete}
            title="Delete message"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex gap-3 py-4 px-4 md:px-8">
      {/* Avatar */}
      <div className="h-10 w-10 border-2 border-foreground bg-secondary flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px] shadow-foreground">
        <Bot className="h-5 w-5" />
      </div>

      {/* Message Bubble */}
      <div className="max-w-[70%] p-4 border-2 border-foreground bg-card text-card-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
        <p className="text-xs font-bold mb-2 uppercase tracking-wide opacity-70">
          AI Assistant
        </p>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
          <span className="inline-block w-3 h-4 ml-1 bg-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
}

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="flex gap-3 py-4 px-4 md:px-8">
      <div className="h-10 w-10 border-2 border-foreground bg-destructive flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px] shadow-foreground">
        <Bot className="h-5 w-5 text-destructive-foreground" />
      </div>
      <div className="max-w-[70%] p-4 border-2 border-foreground bg-destructive/20 shadow-[4px_4px_0px_0px] shadow-foreground">
        <p className="text-xs font-bold mb-2 uppercase tracking-wide text-destructive">
          Error
        </p>
        <p className="text-sm text-foreground">
          {error}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Try using a different model from the dropdown.
        </p>
      </div>
    </div>
  );
}
