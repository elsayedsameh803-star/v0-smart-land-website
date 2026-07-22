"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const Progress = ({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  label,
  className,
}: ProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const variants = {
    default: "bg-primary-500",
    success: "bg-accent-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          {label && (
            <span className="text-sm font-medium text-surface-700">{label}</span>
          )}
          <span className="text-sm text-surface-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-surface-200 rounded-full overflow-hidden",
          sizes[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${Math.round(percentage)}%`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export { Progress };
export type { ProgressProps };