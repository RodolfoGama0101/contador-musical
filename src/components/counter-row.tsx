import styles from "./musical-counter.module.css";
import {
  InstrumentIcon,
  type InstrumentIconId,
} from "@/components/instrument-icon";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

type CounterRowProps = {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  instrument?: InstrumentIconId;
};

export function CounterRow({ label, value, onDecrease, onIncrease, instrument }: CounterRowProps) {
  const iconSource = instrument?.startsWith("organ-")
    ? "iconify"
    : "generated";

  return (
    <div className={styles.counterRow}>
      <span className={styles.counterIdentity}>
        {instrument && (
          <span className={styles.instrumentArtwork} data-icon-source={iconSource} aria-hidden="true">
            <InstrumentIcon instrument={instrument} />
          </span>
        )}
        <span className={styles.counterLabel}>{label}</span>
      </span>
      <div className={styles.counterControls}>
        <Button
          variant="secondary"
          className={styles.decreaseButton}
          onClick={onDecrease}
          disabled={value === 0}
          aria-label={`Diminuir ${label}`}
        >
          <Minus aria-hidden="true" />
        </Button>
        <output className={styles.counterValue} aria-label={`${label}: ${value}`}>
          {value}
        </output>
        <Button
          className={styles.increaseButton}
          onClick={onIncrease}
          aria-label={`Aumentar ${label}`}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
