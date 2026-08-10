import Image from "next/image";
import styles from "./musical-counter.module.css";

type CcbLogoProps = {
  compact?: boolean;
};

export function CcbLogo({ compact = false }: CcbLogoProps) {
  return (
    <span className={`${styles.ccbLogo} ${compact ? styles.ccbLogoCompact : ""}`}>
      <Image
        src="/icons/ccb-logo.jpg"
        alt="Congregação Cristã no Brasil"
        width={390}
        height={202}
        priority
      />
    </span>
  );
}
