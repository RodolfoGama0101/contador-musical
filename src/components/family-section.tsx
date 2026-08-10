"use client";

import { useState } from "react";
import { CounterRow } from "@/components/counter-row";
import type { InstrumentId } from "@/data/instruments";
import styles from "./musical-counter.module.css";

type FamilySectionProps = {
  id: string;
  label: string;
  badge: string;
  instruments: readonly { id: InstrumentId; label: string }[];
  counts: Record<InstrumentId, number>;
  subtotal: number;
  onAdjust: (id: InstrumentId, delta: number) => void;
  defaultOpen?: boolean;
};

export function FamilySection({
  id,
  label,
  badge,
  instruments,
  counts,
  subtotal,
  onAdjust,
  defaultOpen = false,
}: FamilySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      className={styles.familyCard}
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      id={id}
    >
      <summary className={styles.familySummary}>
        <span className={styles.familyIdentity}>
          <span className={styles.familyBadge} aria-hidden="true">{badge}</span>
          <span>
            <strong>{label}</strong>
            <small>{instruments.length} instrumentos</small>
          </span>
        </span>
        <span className={styles.familyTotal}>
          <small>Subtotal</small>
          <strong>{subtotal}</strong>
        </span>
      </summary>
      <div className={styles.familyBody}>
        {instruments.map((instrument) => (
          <CounterRow
            key={instrument.id}
            label={instrument.label}
            value={counts[instrument.id]}
            onDecrease={() => onAdjust(instrument.id, -1)}
            onIncrease={() => onAdjust(instrument.id, 1)}
          />
        ))}
      </div>
    </details>
  );
}
