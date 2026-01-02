"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full border-2 border-foreground bg-input px-4 py-2 text-sm text-foreground shadow-[4px_4px_0px_0px] shadow-foreground transition-shadow placeholder:text-muted-foreground focus:outline-none focus:shadow-[2px_2px_0px_0px] focus:shadow-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
