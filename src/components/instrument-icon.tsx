import { Icon, type IconifyIcon } from "@iconify/react";
import { icons as qlementineIcons } from "@iconify-json/qlementine-icons";
import bassoonIcon from "@iconify-icons/game-icons/bassoon";
import clarinetIcon from "@iconify-icons/game-icons/clarinet";
import fluteIcon from "@iconify-icons/game-icons/flute";
import frenchHornIcon from "@iconify-icons/game-icons/french-horn";
import type { InstrumentId } from "@/data/instruments";

export type InstrumentIconId = InstrumentId | "organ-played" | "organ-waiting";

type InstrumentIconProps = {
  instrument: InstrumentIconId;
  className?: string;
};

const fromQlementine = (name: string): IconifyIcon => {
  const icon = qlementineIcons.icons[name];
  if (!icon) throw new Error(`Ícone Qlementine não encontrado: ${name}`);
  return icon as IconifyIcon;
};

const violinIcon = fromQlementine("violin-24");
const celloIcon = fromQlementine("cello-24");
const woodwindIcon = fromQlementine("woodwind-24");
const saxophoneIcon = fromQlementine("saxophone-24");
const trumpetIcon = fromQlementine("trumpet-24");
const tromboneIcon = fromQlementine("trombone-16");
const tubaIcon = fromQlementine("tuba-16");
const organIcon = fromQlementine("synthesizer-24");

const INSTRUMENT_ICONS: Record<InstrumentIconId, IconifyIcon> = {
  violin: violinIcon,
  viola: violinIcon,
  cello: celloIcon,
  flute: fluteIcon,
  oboe: woodwindIcon,
  "oboe-damore": woodwindIcon,
  "english-horn": woodwindIcon,
  clarinet: clarinetIcon,
  "alto-clarinet": clarinetIcon,
  "bass-clarinet": clarinetIcon,
  bassoon: bassoonIcon,
  "soprano-sax": saxophoneIcon,
  "alto-sax": saxophoneIcon,
  "tenor-sax": saxophoneIcon,
  "baritone-sax": saxophoneIcon,
  trumpet: trumpetIcon,
  cornet: trumpetIcon,
  flugelhorn: trumpetIcon,
  "french-horn": frenchHornIcon,
  trombone: tromboneIcon,
  trombonito: tromboneIcon,
  baritone: tubaIcon,
  euphonium: tubaIcon,
  tuba: tubaIcon,
  "organ-played": organIcon,
  "organ-waiting": organIcon,
};

export function InstrumentIcon({ instrument, className }: InstrumentIconProps) {
  return (
    <Icon
      icon={INSTRUMENT_ICONS[instrument]}
      className={className}
      aria-hidden="true"
    />
  );
}
