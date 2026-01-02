import { LoginButton } from "@/components/auth/login-button";
import { Bot } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-4 border-foreground bg-card p-8 shadow-[8px_8px_0px_0px] shadow-foreground">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 border-4 border-foreground bg-primary flex items-center justify-center shadow-[4px_4px_0px_0px] shadow-foreground">
              <Bot className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-center mb-2 text-foreground uppercase">Welcome</h1>
          <p className="text-muted-foreground text-center mb-8 font-medium">
            Sign in to start chatting with AI
          </p>

          {/* Login Button */}
          <div className="flex justify-center">
            <LoginButton />
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center mt-8 font-medium">
            Your conversations are securely stored.
          </p>
        </div>
      </div>
    </div>
  );
}
