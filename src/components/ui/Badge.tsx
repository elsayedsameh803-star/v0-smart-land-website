"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const Badge = ({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) => {
  const variants = {
    default: "bg-dark-800 text-gold-300 border border-gold-500/20",
    success: "bg-gold-500/10 text-gold-400 border border-gold-500/20",
    warning: "bg-gold-500/10 text-gold-400 border border-gold-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    info: "bg-gold-500/5 text-gold-300 border border-gold-500/10",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
export type { BadgeProps };