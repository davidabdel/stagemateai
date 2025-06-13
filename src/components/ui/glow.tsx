"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "top" | "bottom" | "full";
}

export function Glow({
  className,
  variant = "full",
  ...props
}: GlowProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 overflow-hidden rounded-lg",
        variant === "top" && "bottom-1/2",
        variant === "bottom" && "top-1/2",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-x-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur-3xl",
          variant === "top" || variant === "full" ? "top-[-20%] h-[60%]" : "",
          variant === "bottom" || variant === "full" ? "bottom-[-20%] h-[60%]" : ""
        )}
      />
    </div>
  );
}
