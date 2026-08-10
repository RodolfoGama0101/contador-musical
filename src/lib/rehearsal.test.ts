import { describe, expect, it } from "vitest";
import { INSTRUMENT_FAMILIES } from "@/data/instruments";
import {
  calculateTotals,
  createNewRehearsal,
  normalizeStoredState,
  readStoredRehearsal,
  STORAGE_KEY,
} from "@/lib/rehearsal";

describe("catálogo do ensaio", () => {
  it("mantém todos os saxofones dentro da família Madeiras", () => {
    const woodwinds = INSTRUMENT_FAMILIES.find((family) => family.id === "woodwinds");
    const saxophones = woodwinds?.instruments.filter((instrument) =>
      instrument.label.startsWith("Saxofone"),
    );

    expect(saxophones?.map((instrument) => instrument.label)).toEqual([
      "Saxofone Soprano",
      "Saxofone Alto",
      "Saxofone Tenor",
      "Saxofone Barítono",
    ]);
    expect(INSTRUMENT_FAMILIES).toHaveLength(3);
  });
});

describe("estado e totais", () => {
  it("calcula Madeiras com saxofones e inclui todas as organistas no total geral", () => {
    const state = createNewRehearsal(new Date("2026-08-10T19:30:00-03:00"));
    state.counts.violin = 2;
    state.counts.clarinet = 3;
    state.counts["alto-sax"] = 4;
    state.counts.trumpet = 5;
    state.organists = { played: 2, didNotPlay: 1 };

    expect(calculateTotals(state)).toEqual({
      families: { strings: 2, woodwinds: 7, brass: 5 },
      orchestra: 14,
      organists: 3,
      grand: 17,
    });
  });

  it("normaliza dados válidos e rejeita contagens negativas", () => {
    const state = createNewRehearsal();
    expect(normalizeStoredState(state)).toEqual(state);

    const invalid = {
      ...state,
      counts: { ...state.counts, violin: -1 },
    };
    expect(normalizeStoredState(invalid)).toBeNull();
  });

  it("inicia um ensaio seguro quando o JSON salvo está corrompido", () => {
    const storage = {
      getItem: (key: string) => (key === STORAGE_KEY ? "{inválido" : null),
    };
    const restored = readStoredRehearsal(storage);

    expect(restored.warning).toContain("não puderam ser recuperados");
    expect(calculateTotals(restored.state).grand).toBe(0);
  });
});

