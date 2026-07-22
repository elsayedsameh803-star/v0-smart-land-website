"use client";

import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = ({
  className,
  variant = "default",
  padding = "md",
  children,
  ...props
}: CardProps) => {
  const variants = {
    default: "bg-white shadow-sm border border-surface-200",
    elevated: "bg-white shadow-lg border border-surface-100",
    bordered: "bg-white border-2 border-surface-200",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-200",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4", className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-lg font-semibold text-surface-900", className)}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-surface-500 mt-1", className)} {...props}>
    {children}
  </p>
);

const CardContent = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-4 pt-4 border-t border-surface-200", className)}
    {...props}
  >
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export type { CardProps };