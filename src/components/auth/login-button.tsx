"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function LoginButton() {
  return (
    <Button
      onClick={() => signIn("github", { callbackUrl: "/chat" })}
      variant="default"
      size="lg"
      className="gap-3"
    >
      <Github className="h-5 w-5" />
      Continue with GitHub
    </Button>
  );
}
