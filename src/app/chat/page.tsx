import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ChatLayout } from "@/components/chat/chat-layout";

export default async function ChatPage() {
  const session = await auth();

  // Redirect unauthenticated users to login
  if (!session?.user) {
    redirect("/login");
  }

  return <ChatLayout />;
}
