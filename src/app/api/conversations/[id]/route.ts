import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { safeDecrypt } from "@/lib/encryption";
import { eq, and, asc } from "drizzle-orm";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/conversations/[id] - Get a conversation with its messages
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Fetch the conversation
        const [conversation] = await db
            .select()
            .from(conversations)
            .where(
                and(
                    eq(conversations.id, id),
                    eq(conversations.userId, session.user.id)
                )
            )
            .limit(1);

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        // Fetch messages for this conversation
        const conversationMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, id))
            .orderBy(asc(messages.createdAt));

        // Decrypt messages before sending to client
        const decryptedMessages = conversationMessages.map((msg) => ({
            ...msg,
            content: safeDecrypt(msg.content),
        }));

        return NextResponse.json({
            ...conversation,
            messages: decryptedMessages,
        });
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return NextResponse.json(
            { error: "Failed to fetch conversation" },
            { status: 500 }
        );
    }
}

// DELETE /api/conversations/[id] - Delete a conversation
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership before deleting
        const [conversation] = await db
            .select()
            .from(conversations)
            .where(
                and(
                    eq(conversations.id, id),
                    eq(conversations.userId, session.user.id)
                )
            )
            .limit(1);

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        // Delete the conversation (messages will cascade delete)
        await db.delete(conversations).where(eq(conversations.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return NextResponse.json(
            { error: "Failed to delete conversation" },
            { status: 500 }
        );
    }
}

// PATCH /api/conversations/[id] - Update conversation (e.g., title)
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Verify ownership
        const [existing] = await db
            .select()
            .from(conversations)
            .where(
                and(
                    eq(conversations.id, id),
                    eq(conversations.userId, session.user.id)
                )
            )
            .limit(1);

        if (!existing) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        const [updated] = await db
            .update(conversations)
            .set({
                title: body.title,
                updatedAt: new Date(),
            })
            .where(eq(conversations.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating conversation:", error);
        return NextResponse.json(
            { error: "Failed to update conversation" },
            { status: 500 }
        );
    }
}
