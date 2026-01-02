import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/conversations - List all conversations for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userConversations = await db
            .select()
            .from(conversations)
            .where(eq(conversations.userId, session.user.id))
            .orderBy(desc(conversations.updatedAt));

        return NextResponse.json(userConversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { error: "Failed to fetch conversations" },
            { status: 500 }
        );
    }
}

// POST /api/conversations - Create a new conversation
export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [newConversation] = await db
            .insert(conversations)
            .values({
                userId: session.user.id,
                title: "New Chat",
            })
            .returning();

        return NextResponse.json(newConversation, { status: 201 });
    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json(
            { error: "Failed to create conversation" },
            { status: 500 }
        );
    }
}
