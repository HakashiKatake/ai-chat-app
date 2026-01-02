import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "github" && profile) {
                try {
                    // Check if user exists
                    const existingUser = await db
                        .select()
                        .from(users)
                        .where(eq(users.githubId, String(profile.id)))
                        .limit(1);

                    if (existingUser.length === 0) {
                        // Create new user
                        await db.insert(users).values({
                            githubId: String(profile.id),
                            email: user.email || `${profile.id}@github.user`,
                            name: user.name || profile.login as string,
                            avatarUrl: user.image,
                        });
                    } else {
                        // Update existing user
                        await db
                            .update(users)
                            .set({
                                name: user.name || profile.login as string,
                                avatarUrl: user.image,
                                updatedAt: new Date(),
                            })
                            .where(eq(users.githubId, String(profile.id)));
                    }
                } catch (error) {
                    console.error("Error syncing user to database:", error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                // Fetch user from database to get the internal ID
                const dbUser = await db
                    .select()
                    .from(users)
                    .where(eq(users.githubId, token.sub))
                    .limit(1);

                if (dbUser.length > 0) {
                    session.user.id = dbUser[0].id;
                    session.user.githubId = dbUser[0].githubId;
                }
            }
            return session;
        },
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.sub = String(profile.id);
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
});
