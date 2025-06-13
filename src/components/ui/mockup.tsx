"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MockupFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
}

export function MockupFrame({
  className,
  size = "medium",
  children,
  ...props
}: MockupFrameProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background shadow-md overflow-hidden",
        size === "small" ? "max-w-3xl" : size === "large" ? "max-w-6xl" : "max-w-4xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface MockupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "browser" | "responsive" | "phone";
  children: React.ReactNode;
}

export function Mockup({
  className,
  type = "browser",
  children,
  ...props
}: MockupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden",
        type === "browser" && "rounded-md",
        type === "phone" && "rounded-[2rem]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
