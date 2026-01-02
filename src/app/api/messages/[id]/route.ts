import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages, conversations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// DELETE /api/messages/[id] - Delete a message
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // First get the message to find its conversation
        const [message] = await db
            .select()
            .from(messages)
            .where(eq(messages.id, id))
            .limit(1);

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        // Verify user owns the conversation
        const [conversation] = await db
            .select()
            .from(conversations)
            .where(
                and(
                    eq(conversations.id, message.conversationId),
                    eq(conversations.userId, session.user.id)
                )
            )
            .limit(1);

        if (!conversation) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Delete the message
        await db.delete(messages).where(eq(messages.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json(
            { error: "Failed to delete message" },
            { status: 500 }
        );
    }
}
