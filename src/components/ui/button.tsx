import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "quiet";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-[#033d60] bg-[#033d60] text-white shadow-[0_6px_16px_rgba(3,61,96,.22)] hover:bg-[#064d76] active:bg-[#022f4b]",
  secondary:
    "border-slate-300 bg-white text-[#033d60] shadow-sm hover:border-[#033d60]/35 hover:bg-slate-50 active:bg-slate-100",
  danger:
    "border-[#d91f26] bg-[#d91f26] text-white shadow-[0_6px_16px_rgba(217,31,38,.18)] hover:bg-[#bd171d] active:bg-[#a61218]",
  quiet: "border-transparent bg-transparent text-[#033d60] hover:bg-[#033d60]/5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition duration-150 outline-none select-none touch-manipulation focus-visible:ring-4 focus-visible:ring-[#d91f26]/25 disabled:pointer-events-none disabled:opacity-55 active:scale-[.98]",
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
