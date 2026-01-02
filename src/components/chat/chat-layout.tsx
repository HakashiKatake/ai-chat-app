"use client";

import { useState } from "react";
import { ConversationList } from "./conversation-list";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { Menu, X, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r-2 border-foreground flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-foreground bg-primary">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 border-2 border-foreground bg-background flex items-center justify-center shadow-[2px_2px_0px_0px] shadow-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <span className="font-bold text-primary-foreground text-lg">AI Chat</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ConversationList />
        </div>

        {/* User Menu */}
        <UserMenu />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="flex items-center gap-3 p-4 border-b-2 border-foreground bg-card lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 border-2 border-foreground bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">AI Chat</span>
          </div>
        </header>

        {/* Messages */}
        <MessageList />

        {/* Input with Model Selector */}
        <ChatInput />
      </main>
    </div>
  );
}
