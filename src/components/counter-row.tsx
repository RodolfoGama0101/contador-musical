import styles from "./musical-counter.module.css";

type CounterRowProps = {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function CounterRow({ label, value, onDecrease, onIncrease }: CounterRowProps) {
  return (
    <div className={styles.counterRow}>
      <span className={styles.counterLabel}>{label}</span>
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

