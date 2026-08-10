import type { InstrumentId } from "@/data/instruments";

export type InstrumentArtworkId = InstrumentId | "organ-played" | "organ-waiting";

type InstrumentIllustrationProps = {
  instrument: InstrumentArtworkId;
  className?: string;
};

const StringInstrument = ({ size }: { size: "small" | "medium" | "large" }) => {
  const bodyScale = size === "large" ? 1.12 : size === "medium" ? 1 : 0.9;
  return (
    <g transform={`translate(24 25) scale(${bodyScale}) translate(-24 -25)`}>
      <path d="M27 5 23 19m-3 2c-7 2-8 10-3 13-5 4-3 12 4 12 5 0 7-4 6-8 4 2 9-1 8-6-1-5-6-7-10-5 3-4 1-9-3-11Z" />
      <path d="m26 6 4 1-6 18m-6 8 11-4m-9 8 11-4M29 7l3-3" />
    </g>
  );
};

const StraightWoodwind = ({
  kind,
}: {
  kind: "flute" | "oboe" | "english" | "clarinet" | "alto" | "bass" | "bassoon";
}) => {
  if (kind === "flute") {
    return (
      <g>
        <path d="M5 27h38M8 23v8m29-8v8M12 27h2m5 0h2m5 0h2m5 0h2" />
        <path d="M5 24c-3 0-3 6 0 6m38-5v4" />
      </g>
    );
  }

  if (kind === "bassoon") {
    return (
      <g>
        <path d="M17 6c7 0 8 4 8 8v28m-7-28v28m0 0c0 5 10 5 10 0V13m0 0c0-4 3-6 7-6" />
        <path d="M15 42h15M21 18h5m-6 6h6m-6 6h6m-6 6h6" />
      </g>
    );
  }

  const isBass = kind === "bass";
  const isAlto = kind === "alto";
  const isOboe = kind === "oboe" || kind === "english";
  return (
    <g>
      <path d={isBass ? "M23 5v31c0 7 4 9 10 7 4-1 5-5 3-8" : "M24 6v33"} />
      <path d={isOboe ? "m21 8 3-5 3 5M20 39h8l-2 5h-4Z" : "M20 8h8m-7 31h6l3 6H18Z"} />
      <path d={kind === "english" ? "M20 39c0 7 8 7 8 0" : ""} />
      <path d="M18 15h12m-11 6h10m-10 6h10m-9 6h8" />
      <circle cx="17" cy="18" r="1.5" /><circle cx="31" cy="24" r="1.5" /><circle cx="18" cy="30" r="1.5" />
      {isAlto && <path d="M24 6c-5 0-6 4-4 7" />}
    </g>
  );
};

const Saxophone = ({ size }: { size: "soprano" | "alto" | "tenor" | "baritone" }) => {
  if (size === "soprano") {
    return <StraightWoodwind kind="clarinet" />;
  }
  const scale = size === "baritone" ? 1.08 : size === "tenor" ? 1 : 0.92;
  return (
    <g transform={`translate(24 25) scale(${scale}) translate(-24 -25)`}>
      <path d="M18 5c8 0 11 4 10 10l-4 20c-1 6 7 9 11 4 2-3 1-7-2-9" />
      <path d="M18 5h9m6 25 7-3 3 8-8 4M24 17l9 2m-10 4 8 2m-9 4 7 2" />
      <circle cx="34" cy="15" r="1.5" /><circle cx="35" cy="21" r="1.5" /><circle cx="34" cy="27" r="1.5" />
    </g>
  );
};

const ValveBrass = ({ kind }: { kind: "trumpet" | "cornet" | "flugel" }) => (
  <g>
    <path d={kind === "trumpet" ? "M5 26h28l10-7v14l-10-7" : "M6 28h25l12-8v16l-12-8"} />
    <path d={kind === "cornet" ? "M11 28c0-12 17-12 17 0" : kind === "flugel" ? "M10 28c0-16 21-16 21 0" : "M10 22v8m17-8v8"} />
    <path d="M16 18v12m6-12v12m6-12v12M14 18h4m2 0h4m2 0h4" />
    <path d="M5 23v6" />
  </g>
);

const LowBrass = ({ size }: { size: "baritone" | "euphonium" | "tuba" }) => {
  const bell = size === "tuba" ? "M29 7h14l-4 11H29Z" : "M31 8h11l-3 9h-8Z";
  return (
    <g>
      <path d={bell} />
      <path d="M34 17v21c0 7-10 8-15 5-7-4-8-15-1-20 6-4 14 0 12 8-2 7-12 7-14 1" />
      <path d="M21 17v15m5-15v15m-7-15h4m1 0h4" />
      {size !== "baritone" && <path d="M13 42h24" />}
    </g>
  );
};

function Artwork({ instrument }: { instrument: InstrumentArtworkId }) {
  switch (instrument) {
    case "violin": return <StringInstrument size="small" />;
    case "viola": return <StringInstrument size="medium" />;
    case "cello": return <StringInstrument size="large" />;
    case "flute": return <StraightWoodwind kind="flute" />;
    case "oboe":
    case "oboe-damore": return <StraightWoodwind kind="oboe" />;
    case "english-horn": return <StraightWoodwind kind="english" />;
    case "clarinet": return <StraightWoodwind kind="clarinet" />;
    case "alto-clarinet": return <StraightWoodwind kind="alto" />;
    case "bass-clarinet": return <StraightWoodwind kind="bass" />;
    case "bassoon": return <StraightWoodwind kind="bassoon" />;
    case "soprano-sax": return <Saxophone size="soprano" />;
    case "alto-sax": return <Saxophone size="alto" />;
    case "tenor-sax": return <Saxophone size="tenor" />;
    case "baritone-sax": return <Saxophone size="baritone" />;
    case "trumpet": return <ValveBrass kind="trumpet" />;
    case "cornet": return <ValveBrass kind="cornet" />;
    case "flugelhorn": return <ValveBrass kind="flugel" />;
    case "french-horn": return <g><circle cx="25" cy="27" r="14" /><circle cx="25" cy="27" r="8" /><path d="M5 14h16v13m18-10 5-5v25l-6-6" /></g>;
    case "trombone": return <g><path d="M5 18h29l10-7v14l-10-7M10 18v20h24V25M15 18v15h14" /></g>;
    case "trombonito": return <g transform="translate(4 5) scale(.84)"><path d="M5 18h29l10-7v14l-10-7M10 18v20h24V25M15 18v15h14" /></g>;
    case "baritone": return <LowBrass size="baritone" />;
    case "euphonium": return <LowBrass size="euphonium" />;
    case "tuba": return <LowBrass size="tuba" />;
    case "organ-played":
    case "organ-waiting": return <g><path d="M6 14h36v26H6ZM9 19h30v8H9ZM10 31v9m6-9v9m6-9v9m6-9v9m6-9v9" /><circle cx="12" cy="23" r="1" /><circle cx="17" cy="23" r="1" /><circle cx="22" cy="23" r="1" /></g>;
  }
}

export function InstrumentIllustration({ instrument, className }: InstrumentIllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Ilustração do instrumento"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Artwork instrument={instrument} />
    </svg>
  );
}
