import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./ui.module.css";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      styles.input,
      "h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-normal text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-[#033d60] focus-visible:ring-4 focus-visible:ring-[#033d60]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
