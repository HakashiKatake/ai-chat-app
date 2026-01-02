import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table - stores GitHub OAuth user data
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    githubId: varchar("github_id", { length: 255 }).unique().notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Conversations table - chat sessions for each user
export const conversations = pgTable(
    "conversations",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        title: varchar("title", { length: 255 }).default("New Chat").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [index("idx_conversations_user_id").on(table.userId)]
);

// Messages table - individual messages in a conversation
export const messages = pgTable(
    "messages",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        conversationId: uuid("conversation_id")
            .references(() => conversations.id, { onDelete: "cascade" })
            .notNull(),
        role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant' | 'system'
        content: text("content").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("idx_messages_conversation_id").on(table.conversationId),
        index("idx_messages_created_at").on(table.createdAt),
    ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    conversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
    user: one(users, {
        fields: [conversations.userId],
        references: [users.id],
    }),
    messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
