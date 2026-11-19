import * as React from "react";
import { cn } from "./button";

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-pressed"?: boolean;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, "aria-pressed": ariaPressed, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={ariaPressed}
      className={cn(
        "inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-muted p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white transition-transform",
          ariaPressed ? "translate-x-5 bg-primary" : "translate-x-0",
        )}
      />
    </button>
  ),
);
Toggle.displayName = "Toggle";
