import styles from "./musical-counter.module.css";

export function AppMark() {
  return (
    <span className={styles.appMark} aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path d="M30 7v25.5a7.5 7.5 0 1 1-3-6V13l14-3v16.5a7.5 7.5 0 1 1-3-6V7.7L30 9.4V7Z" />
        <path className={styles.markAccent} d="M7 10h12v3H7zm0 7h12v3H7zm0 7h8v3H7z" />
      </svg>
    </span>
  );
}

