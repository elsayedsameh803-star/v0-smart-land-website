"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, helperText, id, checked, ...props }, ref) => {
    return (
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <span className="flex flex-col text-sm">
          {label && <span className="font-medium text-gold-200">{label}</span>}
          {helperText && <span className="text-xs text-dark-400">{helperText}</span>}
        </span>
        <span className={cn("relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-all duration-200", checked ? "bg-gold-500" : "bg-dark-700")}> 
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="sr-only"
            checked={checked}
            {...props}
          />
          <span
            className={cn(
              "inline-block h-5 w-10 rounded-full bg-dark-950 transition-all duration-200",
              checked ? "translate-x-5 bg-gold-200" : "translate-x-0 bg-dark-500"
            )}
          />
        </span>
      </label>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
export type { SwitchProps };