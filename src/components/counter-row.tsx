import styles from "./musical-counter.module.css";
import {
  InstrumentIllustration,
  type InstrumentArtworkId,
} from "@/components/instrument-illustration";

type CounterRowProps = {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  instrument?: InstrumentArtworkId;
};

export function CounterRow({ label, value, onDecrease, onIncrease, instrument }: CounterRowProps) {
  return (
    <div className={styles.counterRow}>
      <span className={styles.counterIdentity}>
        {instrument && (
          <span className={styles.instrumentArtwork} aria-hidden="true">
            <InstrumentIllustration instrument={instrument} />
          </span>
        )}
        <span className={styles.counterLabel}>{label}</span>
      </span>
      <div className={styles.counterControls}>
        <button
          type="button"
          className={styles.decreaseButton}
          onClick={onDecrease}
          disabled={value === 0}
          aria-label={`Diminuir ${label}`}
        >
          <span aria-hidden="true">−</span>
        </button>
        <output className={styles.counterValue} aria-label={`${label}: ${value}`}>
          {value}
        </output>
        <button
          type="button"
          className={styles.increaseButton}
          onClick={onIncrease}
          aria-label={`Aumentar ${label}`}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
}
