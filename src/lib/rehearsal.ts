import {
  ALL_INSTRUMENTS,
  INSTRUMENT_FAMILIES,
  type FamilyId,
  type InstrumentId,
} from "@/data/instruments";

export const STORAGE_KEY = "contador-musical:ensaio-atual:v1";
export const SCHEMA_VERSION = 1;

export type RehearsalMetadata = {
  date: string;
  time: string;
  locality: string;
  city: string;
  uf: string;
  regional: string;
  responsible: string;
};

export type RehearsalState = {
  schemaVersion: typeof SCHEMA_VERSION;
  metadata: RehearsalMetadata;
  counts: Record<InstrumentId, number>;
  organists: {
    played: number;
    didNotPlay: number;
  };
  updatedAt: string;
};

export type RehearsalTotals = {
  families: Record<FamilyId, number>;
  orchestra: number;
  organists: number;
  grand: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number =>
  Number.isInteger(value) && typeof value === "number" && value >= 0;

const localDateParts = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
};

export const createEmptyCounts = (): Record<InstrumentId, number> =>
  Object.fromEntries(
    ALL_INSTRUMENTS.map((instrument) => [instrument.id, 0]),
  ) as Record<InstrumentId, number>;

export const createNewRehearsal = (now = new Date()): RehearsalState => {
  const current = localDateParts(now);

  return {
    schemaVersion: SCHEMA_VERSION,
    metadata: {
      date: current.date,
      time: current.time,
      locality: "",
      city: "",
      uf: "",
      regional: "",
      responsible: "",
    },
    counts: createEmptyCounts(),
    organists: { played: 0, didNotPlay: 0 },
    updatedAt: now.toISOString(),
  };
};

export const calculateTotals = (state: RehearsalState): RehearsalTotals => {
  const families = Object.fromEntries(
    INSTRUMENT_FAMILIES.map((family) => [
      family.id,
      family.instruments.reduce(
        (sum, instrument) => sum + state.counts[instrument.id],
        0,
      ),
    ]),
  ) as Record<FamilyId, number>;

  const orchestra = Object.values(families).reduce(
    (sum, familyTotal) => sum + familyTotal,
    0,
  );
  const organists = state.organists.played + state.organists.didNotPlay;

  return {
    families,
    orchestra,
    organists,
    grand: orchestra + organists,
  };
};

export const hasMeaningfulData = (state: RehearsalState) => {
  const hasCounts =
    Object.values(state.counts).some((count) => count > 0) ||
    state.organists.played > 0 ||
    state.organists.didNotPlay > 0;
  const { locality, city, uf, regional, responsible } = state.metadata;
  return (
    hasCounts ||
    [locality, city, uf, regional, responsible].some(
      (value) => value.trim().length > 0,
    )
  );
};

export const missingMetadataFields = (metadata: RehearsalMetadata) => {
  const labels: Record<keyof RehearsalMetadata, string> = {
    date: "Data",
    time: "Horário",
    locality: "Localidade",
    city: "Cidade",
    uf: "UF",
    regional: "Regional",
    responsible: "Responsável",
  };

  return (Object.keys(labels) as (keyof RehearsalMetadata)[])
    .filter((key) => !metadata[key].trim())
    .map((key) => labels[key]);
};

export const normalizeStoredState = (value: unknown): RehearsalState | null => {
  if (!isRecord(value) || value.schemaVersion !== SCHEMA_VERSION) return null;
  if (!isRecord(value.metadata) || !isRecord(value.counts)) return null;
  if (!isRecord(value.organists)) return null;
  const metadata = value.metadata;
  const storedCounts = value.counts;
  const organists = value.organists;

  const metadataKeys: (keyof RehearsalMetadata)[] = [
    "date",
    "time",
    "locality",
    "city",
    "uf",
    "regional",
    "responsible",
  ];
  if (metadataKeys.some((key) => typeof metadata[key] !== "string")) {
    return null;
  }

  const counts = createEmptyCounts();
  for (const instrument of ALL_INSTRUMENTS) {
    const storedCount = storedCounts[instrument.id];
    if (storedCount !== undefined && !isCount(storedCount)) return null;
    counts[instrument.id] = storedCount ?? 0;
  }

  if (
    !isCount(organists.played) ||
    !isCount(organists.didNotPlay)
  ) {
    return null;
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    metadata: Object.fromEntries(
      metadataKeys.map((key) => [key, metadata[key]]),
    ) as RehearsalMetadata,
    counts,
    organists: {
      played: organists.played,
      didNotPlay: organists.didNotPlay,
    },
    updatedAt:
      typeof value.updatedAt === "string"
        ? value.updatedAt
        : new Date().toISOString(),
  };
};

export const readStoredRehearsal = (
  storage: Pick<Storage, "getItem">,
): { state: RehearsalState; warning?: string } => {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return {
      state: createNewRehearsal(),
      warning:
        "O armazenamento local está indisponível. A contagem continuará nesta sessão.",
    };
  }

  if (!raw) return { state: createNewRehearsal() };
  try {
    const state = normalizeStoredState(JSON.parse(raw));
    if (state) return { state };
  } catch {
    // O aviso abaixo também cobre JSON incompleto ou corrompido.
  }

  return {
    state: createNewRehearsal(),
    warning:
      "Os dados salvos não puderam ser recuperados. Um novo ensaio foi iniciado.",
  };
};

export const writeStoredRehearsal = (
  storage: Pick<Storage, "setItem">,
  state: RehearsalState,
) => storage.setItem(STORAGE_KEY, JSON.stringify(state));

export const touchState = <T extends RehearsalState>(state: T): T => ({
  ...state,
  updatedAt: new Date().toISOString(),
});
