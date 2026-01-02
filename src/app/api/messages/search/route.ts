import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages, conversations } from "@/lib/db/schema";
import { safeDecrypt } from "@/lib/encryption";
import { eq, and, or, ilike, desc } from "drizzle-orm";

// GET /api/messages/search?q=query - Search messages
export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.trim().length < 2) {
            return NextResponse.json(
                { error: "Search query must be at least 2 characters" },
                { status: 400 }
            );
        }

        // Get all user's conversations
        const userConversations = await db
            .select({ id: conversations.id })
            .from(conversations)
            .where(eq(conversations.userId, session.user.id));

        if (userConversations.length === 0) {
            return NextResponse.json({ results: [] });
        }

        const conversationIds = userConversations.map((c) => c.id);

        // Search messages in user's conversations
        // Note: For encrypted messages, we need to decrypt and search in-memory
        // This is a trade-off for security - for better performance, use a search index
        const allMessages = await db
            .select({
                id: messages.id,
                conversationId: messages.conversationId,
                role: messages.role,
                content: messages.content,
                createdAt: messages.createdAt,
            })
            .from(messages)
            .where(
                or(...conversationIds.map((id) => eq(messages.conversationId, id)))
            )
            .orderBy(desc(messages.createdAt))
            .limit(500); // Limit for performance

        // Decrypt and filter messages
        const searchLower = query.toLowerCase();
        const results = allMessages
            .map((msg) => ({
                ...msg,
                content: safeDecrypt(msg.content),
            }))
            .filter((msg) => msg.content.toLowerCase().includes(searchLower))
            .slice(0, 50); // Return max 50 results

        // Get conversation titles for context
        const conversationsWithTitles = await db
            .select({ id: conversations.id, title: conversations.title })
            .from(conversations)
            .where(eq(conversations.userId, session.user.id));

        const titleMap = new Map(conversationsWithTitles.map((c) => [c.id, c.title]));

        const resultsWithTitles = results.map((msg) => ({
            ...msg,
            conversationTitle: titleMap.get(msg.conversationId) || "Untitled",
            // Highlight snippet
            snippet: getSnippet(msg.content, query),
        }));

        return NextResponse.json({ results: resultsWithTitles });
    } catch (error) {
        console.error("Error searching messages:", error);
        return NextResponse.json(
            { error: "Failed to search messages" },
            { status: 500 }
        );
    }
}

function getSnippet(content: string, query: string): string {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);

    if (index === -1) {
        return content.slice(0, 100) + (content.length > 100 ? "..." : "");
    }

    const start = Math.max(0, index - 40);
    const end = Math.min(content.length, index + query.length + 40);

    let snippet = content.slice(start, end);
    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet = snippet + "...";

    return snippet;
}
