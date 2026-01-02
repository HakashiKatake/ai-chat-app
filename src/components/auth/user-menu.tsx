"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun } from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";

export function UserMenu() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useSettingsStore();

  if (!session?.user) return null;

  return (
    <div className="p-3 border-t-2 border-foreground bg-sidebar">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-foreground">
          <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {session.user.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-foreground">{session.user.name}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="h-10 w-10"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out"
          className="h-10 w-10"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
