import { describe, expect, it } from "vitest";
import { createNewRehearsal } from "@/lib/rehearsal";
import { createPdfFilename, generateRehearsalPdf } from "@/lib/pdf";

describe("PDF do ensaio", () => {
  it("gera um PDF A4 com nome seguro e conteúdo", async () => {
    const state = createNewRehearsal(new Date("2026-08-10T19:30:00-03:00"));
    state.metadata = {
      date: "2026-08-10",
      time: "19:30",
      locality: "Jardim São José",
      city: "São Paulo",
      uf: "SP",
      regional: "Brás",
      responsible: "Responsável",
    };
    state.counts.violin = 10;
    state.counts["baritone-sax"] = 2;
    state.organists = { played: 3, didNotPlay: 1 };

    expect(createPdfFilename(state)).toBe(
      "ensaio-musical_2026-08-10-jardim-sao-jose.pdf",
    );

    const result = await generateRehearsalPdf(state);
    expect(result.blob.type).toBe("application/pdf");
    expect(result.blob.size).toBeGreaterThan(2_000);
  });
});

