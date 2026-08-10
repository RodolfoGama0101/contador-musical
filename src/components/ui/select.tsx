import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <span className="relative block">
    <select
      ref={ref}
      className={cn(
        "h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-10 text-base font-normal text-slate-950 shadow-sm outline-none transition focus-visible:border-[#033d60] focus-visible:ring-4 focus-visible:ring-[#033d60]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500"
      aria-hidden="true"
    />
  </span>
));

Select.displayName = "Select";
