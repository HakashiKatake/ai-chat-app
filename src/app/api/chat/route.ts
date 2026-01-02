import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { getAIProvider, type AIMessage } from "@/lib/ai";
import { safeEncrypt, safeDecrypt } from "@/lib/encryption";
import { eq, and, asc } from "drizzle-orm";

export const runtime = "nodejs";

// POST /api/chat - Send a message and get streaming AI response
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { conversationId, content, model } = await request.json();

        if (!conversationId || !content) {
            return new Response("Missing conversationId or content", { status: 400 });
        }

        // Verify conversation ownership
        const [conversation] = await db
            .select()
            .from(conversations)
            .where(
                and(
                    eq(conversations.id, conversationId),
                    eq(conversations.userId, session.user.id)
                )
            )
            .limit(1);

        if (!conversation) {
            return new Response("Conversation not found", { status: 404 });
        }

        // Save the user message (encrypted)
        await db.insert(messages).values({
            conversationId,
            role: "user",
            content: safeEncrypt(content),
        });

        // Fetch conversation history for context
        const history = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(asc(messages.createdAt));

        // Prepare messages for AI (decrypt for AI processing)
        const aiMessages: AIMessage[] = [
            {
                role: "system",
                content:
                    "You are a helpful AI assistant. Be concise and helpful in your responses.",
            },
            ...history.map((msg) => ({
                role: msg.role as "user" | "assistant" | "system",
                content: safeDecrypt(msg.content),
            })),
        ];

        // Get AI provider with optional model override
        const aiProvider = getAIProvider(model);

        // Create a TransformStream for streaming the response
        const encoder = new TextEncoder();
        let fullResponse = "";

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of aiProvider.chatStream(aiMessages)) {
                        fullResponse += chunk;
                        controller.enqueue(encoder.encode(chunk));
                    }

                    // Save the complete AI response to the database (encrypted)
                    await db.insert(messages).values({
                        conversationId,
                        role: "assistant",
                        content: safeEncrypt(fullResponse),
                    });

                    // Update conversation title if it's the first message
                    if (history.length <= 1) {
                        // Generate a title from the first user message
                        const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
                        await db
                            .update(conversations)
                            .set({ title, updatedAt: new Date() })
                            .where(eq(conversations.id, conversationId));
                    } else {
                        // Just update the timestamp
                        await db
                            .update(conversations)
                            .set({ updatedAt: new Date() })
                            .where(eq(conversations.id, conversationId));
                    }

                    controller.close();
                } catch (error) {
                    console.error("Streaming error:", error);

                    // Check if it's a rate limit error
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    if (errorMessage.includes("429") || errorMessage.includes("rate-limited")) {
                        controller.error(new Error("Model is rate-limited. Please try a different model."));
                    } else {
                        controller.error(error);
                    }
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("Chat API error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return new Response(errorMessage, { status: 500 });
    }
}
