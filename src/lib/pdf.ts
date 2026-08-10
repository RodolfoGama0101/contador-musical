import { INSTRUMENT_FAMILIES } from "@/data/instruments";
import { calculateTotals, type RehearsalState } from "@/lib/rehearsal";

const NAVY: [number, number, number] = [3, 61, 96];
const LIGHT_GRAY: [number, number, number] = [212, 217, 226];
const TEXT: [number, number, number] = [32, 30, 30];

const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return day && month && year ? `${day}/${month}/${year}` : date;
};

const safeFilePart = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "localidade";

export const createPdfFilename = (state: RehearsalState) =>
  `ensaio-musical_${state.metadata.date}-${safeFilePart(state.metadata.locality)}.pdf`;

export const generateRehearsalPdf = async (state: RehearsalState) => {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const totals = calculateTotals(state);
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("Resumo do Ensaio Musical", 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Contador Musical", 14, 21);

  autoTable(doc, {
    startY: 36,
    theme: "plain",
    body: [
      ["Data", formatDate(state.metadata.date), "Horário", state.metadata.time],
      ["Localidade", state.metadata.locality, "Regional", state.metadata.regional],
      ["Cidade / UF", `${state.metadata.city} / ${state.metadata.uf}`, "Responsável", state.metadata.responsible],
    ],
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2.2, textColor: TEXT },
    columnStyles: {
      0: { fontStyle: "bold", textColor: NAVY, cellWidth: 24 },
      1: { cellWidth: 60 },
      2: { fontStyle: "bold", textColor: NAVY, cellWidth: 24 },
      3: { cellWidth: 60 },
    },
  });

  type DocWithTable = typeof doc & { lastAutoTable?: { finalY: number } };
  const finalY = () => (doc as DocWithTable).lastAutoTable?.finalY ?? 36;
  let nextY = finalY() + 7;

  for (const family of INSTRUMENT_FAMILIES) {
    autoTable(doc, {
      startY: nextY,
      theme: "grid",
      head: [[family.label, "Quantidade"]],
      body: family.instruments.map((instrument) => [
        instrument.label,
        String(state.counts[instrument.id]),
      ]),
      foot: [[`Subtotal de ${family.label}`, String(totals.families[family.id])]],
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2 },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: LIGHT_GRAY, textColor: NAVY, fontStyle: "bold" },
      columnStyles: { 1: { halign: "center", cellWidth: 34 } },
      margin: { left: 14, right: 14, bottom: 17 },
      showFoot: "lastPage",
    });
    nextY = finalY() + 7;
  }

  autoTable(doc, {
    startY: nextY,
    theme: "grid",
    head: [["Órgão Eletrônico", "Quantidade"]],
    body: [
      ["Organistas que tocaram", String(state.organists.played)],
      ["Organistas que não tocaram", String(state.organists.didNotPlay)],
    ],
    foot: [["Total de organistas presentes", String(totals.organists)]],
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2 },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: LIGHT_GRAY, textColor: NAVY, fontStyle: "bold" },
    columnStyles: { 1: { halign: "center", cellWidth: 34 } },
    margin: { left: 14, right: 14, bottom: 17 },
  });

  nextY = finalY() + 7;
  autoTable(doc, {
    startY: nextY,
    theme: "grid",
    body: [
      ["Total da orquestra", String(totals.orchestra)],
      ["TOTAL GERAL", String(totals.grand)],
    ],
    styles: { font: "helvetica", fontSize: 10, cellPadding: 3, fontStyle: "bold" },
    bodyStyles: { textColor: NAVY },
    columnStyles: { 1: { halign: "center", cellWidth: 34 } },
    didParseCell: (data) => {
      if (data.row.index === 1) {
        data.cell.styles.fillColor = NAVY;
        data.cell.styles.textColor = 255;
        data.cell.styles.fontSize = 12;
      }
    },
    margin: { left: 14, right: 14, bottom: 17 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...LIGHT_GRAY);
    doc.line(14, 285, pageWidth - 14, 285);
    doc.setTextColor(100, 95, 119);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(
      `Gerado em ${new Date().toLocaleString("pt-BR")} • Página ${page} de ${pageCount}`,
      14,
      290,
    );
  }

  return {
    blob: doc.output("blob"),
    filename: createPdfFilename(state),
  };
};
