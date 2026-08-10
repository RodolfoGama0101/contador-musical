import { INSTRUMENT_FAMILIES } from "@/data/instruments";
import { calculateTotals, type RehearsalState } from "@/lib/rehearsal";

const NAVY: [number, number, number] = [3, 61, 96];
const LIGHT_GRAY: [number, number, number] = [212, 217, 226];
const TEXT: [number, number, number] = [32, 30, 30];
const RED: [number, number, number] = [217, 31, 38];

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
  doc.rect(0, 0, pageWidth, 25, "F");
  doc.setFillColor(...RED);
  doc.rect(0, 25, pageWidth, 1.2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Resumo do Ensaio Musical", 10, 11.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Contador Musical - Congregação Cristã no Brasil", 10, 19);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`TOTAL  ${totals.grand}`, pageWidth - 10, 15, { align: "right" });

  autoTable(doc, {
    startY: 30,
    theme: "grid",
    body: [
      ["Data", formatDate(state.metadata.date), "Horário", state.metadata.time, "Localidade", state.metadata.locality],
      ["Cidade / UF", `${state.metadata.city} / ${state.metadata.uf}`, "Regional", state.metadata.regional, "Responsável", state.metadata.responsible],
    ],
    styles: {
      font: "helvetica",
      fontSize: 7.2,
      cellPadding: 1.4,
      minCellHeight: 7,
      overflow: "ellipsize",
      textColor: TEXT,
      lineColor: LIGHT_GRAY,
      lineWidth: 0.2,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: NAVY, fillColor: [244, 245, 248], cellWidth: 22 },
      1: { cellWidth: 31 },
      2: { fontStyle: "bold", textColor: NAVY, fillColor: [244, 245, 248], cellWidth: 18 },
      3: { cellWidth: 23 },
      4: { fontStyle: "bold", textColor: NAVY, fillColor: [244, 245, 248], cellWidth: 21 },
      5: { cellWidth: 75 },
    },
    margin: { left: 10, right: 10 },
    tableWidth: 190,
  });

  type DocWithTable = typeof doc & { lastAutoTable?: { finalY: number } };
  const finalY = () => (doc as DocWithTable).lastAutoTable?.finalY ?? 30;
  const familyStartY = finalY() + 5;
  const familyColumns = [
    { x: 10, width: 50 },
    { x: 64, width: 66 },
    { x: 134, width: 66 },
  ] as const;
  const familyBottoms: number[] = [];

  INSTRUMENT_FAMILIES.forEach((family, index) => {
    const column = familyColumns[index];
    autoTable(doc, {
      startY: familyStartY,
      theme: "grid",
      head: [[family.label, "Qtd."]],
      body: family.instruments.map((instrument) => [
        instrument.label,
        String(state.counts[instrument.id]),
      ]),
      foot: [[`Subtotal de ${family.label}`, String(totals.families[family.id])]],
      styles: {
        font: "helvetica",
        fontSize: 7.1,
        cellPadding: 1.25,
        minCellHeight: 5,
        overflow: "ellipsize",
        lineColor: LIGHT_GRAY,
        lineWidth: 0.18,
        valign: "middle",
      },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: LIGHT_GRAY, textColor: NAVY, fontStyle: "bold" },
      columnStyles: { 1: { halign: "center", cellWidth: 15, fontStyle: "bold" } },
      margin: {
        left: column.x,
        right: pageWidth - column.x - column.width,
        bottom: 14,
      },
      tableWidth: column.width,
      pageBreak: "avoid",
      rowPageBreak: "avoid",
    });
    familyBottoms.push(finalY());
  });

  const summaryY = Math.max(...familyBottoms) + 5;

  autoTable(doc, {
    startY: summaryY,
    theme: "grid",
    head: [["Órgão Eletrônico", "Qtd."]],
    body: [
      ["Organistas que tocaram", String(state.organists.played)],
      ["Organistas que não tocaram", String(state.organists.didNotPlay)],
    ],
    foot: [["Total de organistas presentes", String(totals.organists)]],
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 1.5,
      minCellHeight: 6,
      lineColor: LIGHT_GRAY,
      lineWidth: 0.2,
    },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: LIGHT_GRAY, textColor: NAVY, fontStyle: "bold" },
    columnStyles: { 1: { halign: "center", cellWidth: 18, fontStyle: "bold" } },
    margin: { left: 10, right: 82, bottom: 14 },
    tableWidth: 118,
    pageBreak: "avoid",
  });

  autoTable(doc, {
    startY: summaryY,
    theme: "grid",
    body: [
      ["Total da orquestra", String(totals.orchestra)],
      ["TOTAL GERAL", String(totals.grand)],
    ],
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.2,
      minCellHeight: 9,
      fontStyle: "bold",
      lineColor: LIGHT_GRAY,
      lineWidth: 0.2,
      valign: "middle",
    },
    bodyStyles: { textColor: NAVY },
    columnStyles: { 0: { cellWidth: 48 }, 1: { halign: "center", cellWidth: 20 } },
    didParseCell: (data) => {
      if (data.row.index === 1) {
        data.cell.styles.fillColor = NAVY;
        data.cell.styles.textColor = 255;
        data.cell.styles.fontSize = data.column.index === 1 ? 12 : 8.5;
      } else {
        data.cell.styles.fillColor = [244, 245, 248];
      }
    },
    margin: { left: 132, right: 10, bottom: 14 },
    tableWidth: 68,
    pageBreak: "avoid",
  });

  const pageCount = doc.getNumberOfPages();
  if (pageCount !== 1) {
    throw new Error(`O resumo excedeu uma página A4 (${pageCount} páginas).`);
  }

  doc.setDrawColor(...LIGHT_GRAY);
  doc.line(10, 285, pageWidth - 10, 285);
  doc.setTextColor(100, 95, 119);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 10, 290);
  doc.text("Dados registrados localmente neste aparelho", pageWidth - 10, 290, { align: "right" });

  return {
    blob: doc.output("blob"),
    filename: createPdfFilename(state),
    pageCount,
  };
};
