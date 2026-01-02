import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginButton } from "@/components/auth/login-button";
import { Bot, Zap, Shield, Code } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // Redirect authenticated users to chat
  if (session?.user) {
    redirect("/chat");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 mb-8 border-4 border-foreground bg-primary shadow-[8px_8px_0px_0px] shadow-foreground">
            <Bot className="h-12 w-12 text-primary-foreground" />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-foreground uppercase tracking-tight">
            AI Chat
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto font-medium">
            A modern chat application powered by AI with real-time streaming responses.
          </p>

          {/* CTA */}
          <LoginButton />

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
            <div className="p-6 border-4 border-foreground bg-card shadow-[6px_6px_0px_0px] shadow-foreground">
              <div className="h-12 w-12 border-2 border-foreground bg-primary flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px] shadow-foreground">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold mb-2 text-foreground uppercase text-sm">Real-time Streaming</h3>
              <p className="text-sm text-muted-foreground">
                Watch AI responses appear instantly.
              </p>
            </div>

            <div className="p-6 border-4 border-foreground bg-card shadow-[6px_6px_0px_0px] shadow-foreground">
              <div className="h-12 w-12 border-2 border-foreground bg-secondary flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px] shadow-foreground">
                <Shield className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-bold mb-2 text-foreground uppercase text-sm">Secure Auth</h3>
              <p className="text-sm text-muted-foreground">
                Sign in with GitHub securely.
              </p>
            </div>

            <div className="p-6 border-4 border-foreground bg-card shadow-[6px_6px_0px_0px] shadow-foreground">
              <div className="h-12 w-12 border-2 border-foreground bg-accent flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px] shadow-foreground">
                <Code className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-bold mb-2 text-foreground uppercase text-sm">Modular Design</h3>
              <p className="text-sm text-muted-foreground">
                Switch AI models easily.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
