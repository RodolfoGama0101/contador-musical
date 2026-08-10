import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./ui.module.css";

type FieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export function Field({ id, label, children, icon: Icon, className }: FieldProps) {
  return (
    <label htmlFor={id} className={cn(styles.field, "grid gap-1.5 text-[11px] font-extrabold text-[#033d60]", className)}>
      <span className={cn(styles.fieldLabel, "flex items-center gap-1.5 px-0.5")}>
        {Icon && <Icon className={cn(styles.fieldIcon, "size-3.5 text-[#d91f26]")} aria-hidden="true" />}
        {label}
      </span>
      {children}
    </label>
  );
}
