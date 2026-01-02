"use client";

import { useState, useCallback } from "react";
import { Search, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConversationStore } from "@/stores/conversation-store";
import { useMessageStore } from "@/stores/message-store";

interface SearchResult {
  id: string;
  conversationId: string;
  conversationTitle: string;
  role: string;
  content: string;
  snippet: string;
  createdAt: string;
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { setActiveConversation } = useConversationStore();
  const { fetchMessages } = useMessageStore();

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/messages/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleResultClick = async (result: SearchResult) => {
    setActiveConversation(result.conversationId);
    await fetchMessages(result.conversationId);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        title="Search messages"
        className="h-8 w-8"
      >
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-card border-2 border-foreground shadow-[8px_8px_0px_0px] shadow-foreground">
        {/* Search Input */}
        <div className="flex items-center gap-2 p-4 border-b-2 border-foreground">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search messages..."
            autoFocus
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(false);
              setQuery("");
              setResults([]);
            }}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching && (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          )}

          {!isSearching && results.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          )}

          {!isSearching && query.length < 2 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Type at least 2 characters to search
            </div>
          )}

          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="p-4 border-b border-foreground/20 cursor-pointer hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-bold">{result.conversationTitle}</span>
                <span className="text-xs text-muted-foreground uppercase px-2 py-0.5 bg-muted">
                  {result.role}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {result.snippet}
              </p>
            </div>
          ))}
        </div>

        {/* Search Button */}
        <div className="p-3 border-t-2 border-foreground">
          <Button
            onClick={handleSearch}
            variant="default"
            className="w-full"
            disabled={query.length < 2 || isSearching}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
