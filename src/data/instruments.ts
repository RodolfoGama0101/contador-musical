export const INSTRUMENT_FAMILIES = [
  {
    id: "strings",
    label: "Cordas",
    shortLabel: "Cordas",
    instruments: [
      { id: "violin", label: "Violino" },
      { id: "viola", label: "Viola" },
      { id: "cello", label: "Violoncelo" },
    ],
  },
  {
    id: "woodwinds",
    label: "Madeiras",
    shortLabel: "Madeiras",
    instruments: [
      { id: "flute", label: "Flauta Transversal" },
      { id: "oboe", label: "Oboé" },
      { id: "oboe-damore", label: "Oboé d'amore" },
      { id: "english-horn", label: "Corne Inglês" },
      { id: "clarinet", label: "Clarinete" },
      { id: "alto-clarinet", label: "Clarinete Alto" },
      { id: "bass-clarinet", label: "Clarinete Baixo" },
      { id: "bassoon", label: "Fagote" },
      { id: "soprano-sax", label: "Saxofone Soprano" },
      { id: "alto-sax", label: "Saxofone Alto" },
      { id: "tenor-sax", label: "Saxofone Tenor" },
      { id: "baritone-sax", label: "Saxofone Barítono" },
    ],
  },
  {
    id: "brass",
    label: "Metais",
    shortLabel: "Metais",
    instruments: [
      { id: "trumpet", label: "Trompete" },
      { id: "cornet", label: "Cornet" },
      { id: "flugelhorn", label: "Flugelhorn" },
      { id: "french-horn", label: "Trompa" },
      { id: "trombone", label: "Trombone" },
      { id: "trombonito", label: "Trombonito" },
      { id: "baritone", label: "Barítono" },
      { id: "euphonium", label: "Eufônio" },
      { id: "tuba", label: "Tuba" },
    ],
  },
] as const;

export type FamilyId = (typeof INSTRUMENT_FAMILIES)[number]["id"];
export type InstrumentId =
  (typeof INSTRUMENT_FAMILIES)[number]["instruments"][number]["id"];

export const ALL_INSTRUMENTS = INSTRUMENT_FAMILIES.flatMap((family) =>
  family.instruments.map((instrument) => ({
    ...instrument,
    familyId: family.id,
    familyLabel: family.label,
  })),
);

