import Image from "next/image";
import { Icon, type IconifyIcon } from "@iconify/react";
import { icons as qlementineIcons } from "@iconify-json/qlementine-icons";
import type { InstrumentId } from "@/data/instruments";

type OrganIconId = "organ-played" | "organ-waiting";

export type InstrumentIconId = InstrumentId | OrganIconId;

type InstrumentIconProps = {
  instrument: InstrumentIconId;
  className?: string;
};

const getQlementineIcon = (name: string): IconifyIcon => {
  const icon = qlementineIcons.icons[name];
  if (!icon) throw new Error(`Ícone Qlementine não encontrado: ${name}`);
  return icon as IconifyIcon;
};

const organIcon = getQlementineIcon("synthesizer-24");

const isOrganIcon = (instrument: InstrumentIconId): instrument is OrganIconId =>
  instrument === "organ-played" || instrument === "organ-waiting";

export function InstrumentIcon({ instrument, className }: InstrumentIconProps) {
  if (isOrganIcon(instrument)) {
    return (
      <Icon
        icon={organIcon}
        className={className}
        aria-hidden="true"
      />
    );
  }

  return (
    <Image
      src={`/icons/instruments/${instrument}.png`}
      alt=""
      width={84}
      height={84}
      className={className}
      unoptimized
    />
  );
}
