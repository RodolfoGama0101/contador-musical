import { INSTRUMENT_FAMILIES } from "@/data/instruments";
import { calculateTotals, type RehearsalState } from "@/lib/rehearsal";

const INK: [number, number, number] = [35, 35, 35];
const DARK_GRAY: [number, number, number] = [66, 66, 66];
const MID_GRAY: [number, number, number] = [126, 126, 126];
const LINE_GRAY: [number, number, number] = [198, 198, 198];
const LIGHT_GRAY: [number, number, number] = [239, 239, 239];
const PALE_GRAY: [number, number, number] = [248, 248, 248];
const WHITE: [number, number, number] = [255, 255, 255];

type GeneratePdfOptions = {
  generatedAt?: Date;
  logoDataUrl?: string;
};

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

const fetchLogoDataUrl = async () => {
  if (typeof window === "undefined") return undefined;

  try {
    const response = await fetch("/icons/ccb-logo.jpg");
    if (!response.ok) return undefined;
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return `data:image/jpeg;base64,${window.btoa(binary)}`;
  } catch {
    return undefined;
  }
};

export const createPdfFilename = (state: RehearsalState) =>
  `ensaio-musical_${state.metadata.date}-${safeFilePart(state.metadata.locality)}.pdf`;

export const generateRehearsalPdf = async (
  state: RehearsalState,
  options: GeneratePdfOptions = {},
) => {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const totals = calculateTotals(state);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoDataUrl = options.logoDataUrl ?? (await fetchLogoDataUrl());
  const generatedAt = options.generatedAt ?? new Date();

  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setDrawColor(...LINE_GRAY);
  doc.setLineWidth(0.35);
  doc.rect(7, 7, pageWidth - 14, pageHeight - 14);

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "JPEG", 12, 11, 44, 22.8, undefined, "FAST");
  } else {
    doc.setDrawColor(...INK);
    doc.rect(12, 11, 44, 22.8);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("CCB", 34, 25.5, { align: "center" });
  }

  doc.setTextColor(...MID_GRAY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("CONGREGAÇÃO CRISTÃ NO BRASIL", 63, 14.5);
  doc.setTextColor(...INK);
  doc.setFontSize(18);
  doc.text("Relatório do Ensaio Musical", 63, 24);
  doc.setTextColor(...MID_GRAY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `${state.metadata.locality}  |  ${state.metadata.city} - ${state.metadata.uf}`,
    63,
    31,
  );

  doc.setFillColor(...INK);
  doc.roundedRect(171, 11, 27, 24, 1.5, 1.5, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.7);
  doc.text("TOTAL GERAL", 184.5, 17, { align: "center" });
  doc.setFontSize(15);
  doc.text(String(totals.grand), 184.5, 29, { align: "center" });

  doc.setFillColor(...DARK_GRAY);
  doc.rect(12, 41, pageWidth - 24, 1.2, "F");

  const metadata = [
    { label: "DATA", value: formatDate(state.metadata.date), x: 12, width: 34 },
    { label: "HORÁRIO", value: state.metadata.time, x: 49, width: 27 },
    { label: "LOCALIDADE", value: state.metadata.locality, x: 79, width: 67 },
    { label: "CIDADE / UF", value: `${state.metadata.city} / ${state.metadata.uf}`, x: 149, width: 49 },
  ];

  metadata.forEach((field) => {
    doc.setFillColor(...PALE_GRAY);
    doc.setDrawColor(...LINE_GRAY);
    doc.roundedRect(field.x, 48, field.width, 17, 1.2, 1.2, "FD");
    doc.setTextColor(...MID_GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.text(field.label, field.x + 3, 53.5);
    doc.setTextColor(...INK);
    doc.setFontSize(8.2);
    doc.text(field.value, field.x + 3, 60.5, {
      maxWidth: field.width - 6,
    });
  });

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FORMAÇÃO DA ORQUESTRA", 12, 75);
  doc.setDrawColor(...LINE_GRAY);
  doc.setLineWidth(0.25);
  doc.line(54, 73.3, 198, 73.3);

  type DocWithTable = typeof doc & { lastAutoTable?: { finalY: number } };
  const finalY = () => (doc as DocWithTable).lastAutoTable?.finalY ?? 82;
  const familyColumns = [
    { x: 12, width: 55 },
    { x: 71, width: 67 },
    { x: 142, width: 56 },
  ] as const;
  const familyBottoms: number[] = [];

  INSTRUMENT_FAMILIES.forEach((family, index) => {
    const column = familyColumns[index];
    autoTable(doc, {
      startY: 80,
      theme: "grid",
      head: [[family.label.toUpperCase(), "QTD."]],
      body: family.instruments.map((instrument) => [
        instrument.label,
        String(state.counts[instrument.id]),
      ]),
      foot: [["SUBTOTAL", String(totals.families[family.id])]],
      styles: {
        font: "helvetica",
        fontSize: 7.1,
        cellPadding: { top: 1.55, right: 1.8, bottom: 1.55, left: 1.8 },
        minCellHeight: 6.4,
        overflow: "ellipsize",
        lineColor: LINE_GRAY,
        lineWidth: 0.18,
        textColor: INK,
        valign: "middle",
      },
      headStyles: {
        fillColor: DARK_GRAY,
        textColor: WHITE,
        fontStyle: "bold",
        minCellHeight: 8,
      },
      footStyles: {
        fillColor: LIGHT_GRAY,
        textColor: INK,
        fontStyle: "bold",
        minCellHeight: 8,
      },
      alternateRowStyles: { fillColor: PALE_GRAY },
      columnStyles: {
        1: { halign: "center", cellWidth: 14, fontStyle: "bold" },
      },
      didParseCell: (data) => {
        if (data.section === "foot" && data.column.index === 1) {
          data.cell.styles.halign = "center";
        }
      },
      margin: {
        left: column.x,
        right: pageWidth - column.x - column.width,
        bottom: 13,
      },
      tableWidth: column.width,
      pageBreak: "avoid",
      rowPageBreak: "avoid",
    });
    familyBottoms.push(finalY());
  });

  const summaryY = Math.max(...familyBottoms) + 8;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ÓRGÃO ELETRÔNICO", 12, summaryY);
  doc.setDrawColor(...LINE_GRAY);
  doc.line(45, summaryY - 1.7, 126, summaryY - 1.7);

  autoTable(doc, {
    startY: summaryY + 4,
    theme: "grid",
    body: [
      ["Organistas que tocaram", String(state.organists.played)],
      ["Organistas que não tocaram", String(state.organists.didNotPlay)],
    ],
    foot: [["TOTAL DE ORGANISTAS PRESENTES", String(totals.organists)]],
    styles: {
      font: "helvetica",
      fontSize: 7.4,
      cellPadding: 1.8,
      minCellHeight: 7.2,
      lineColor: LINE_GRAY,
      lineWidth: 0.18,
      textColor: INK,
      valign: "middle",
    },
    alternateRowStyles: { fillColor: PALE_GRAY },
    footStyles: {
      fillColor: LIGHT_GRAY,
      textColor: INK,
      fontStyle: "bold",
      minCellHeight: 8.5,
    },
    columnStyles: {
      1: { halign: "center", cellWidth: 17, fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "foot" && data.column.index === 1) {
        data.cell.styles.halign = "center";
      }
    },
    margin: { left: 12, right: 84, bottom: 13 },
    tableWidth: 114,
    pageBreak: "avoid",
  });

  const cardX = 132;
  const cardWidth = 66;
  const totalCards = [
    { label: "TOTAL DA ORQUESTRA", value: totals.orchestra, y: summaryY - 4, dark: false },
    { label: "ORGANISTAS PRESENTES", value: totals.organists, y: summaryY + 14, dark: false },
    { label: "TOTAL GERAL", value: totals.grand, y: summaryY + 32, dark: true },
  ];

  totalCards.forEach((card) => {
    doc.setFillColor(...(card.dark ? INK : LIGHT_GRAY));
    doc.setDrawColor(...(card.dark ? INK : LINE_GRAY));
    doc.roundedRect(cardX, card.y, cardWidth, 14, 1.2, 1.2, "FD");
    doc.setTextColor(...(card.dark ? WHITE : DARK_GRAY));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.text(card.label, cardX + 4, card.y + 8.6);
    doc.setTextColor(...(card.dark ? WHITE : INK));
    doc.setFontSize(card.dark ? 15 : 13.5);
    doc.text(String(card.value), cardX + cardWidth - 5, card.y + 9.3, {
      align: "right",
    });
  });

  const pageCount = doc.getNumberOfPages();
  if (pageCount !== 1) {
    throw new Error(`O resumo excedeu uma página A4 (${pageCount} páginas).`);
  }

  doc.setDrawColor(...LINE_GRAY);
  doc.line(12, 278, 198, 278);
  doc.setTextColor(...MID_GRAY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(
    `Gerado em ${generatedAt.toLocaleString("pt-BR")}`,
    12,
    283,
  );
  doc.text(
    "Contador Musical | Dados registrados localmente neste aparelho",
    198,
    283,
    { align: "right" },
  );
  doc.setFontSize(5.8);
  doc.text(
    "Ferramenta independente para apoio à contagem do ensaio musical.",
    105,
    288,
    { align: "center" },
  );

  return {
    blob: doc.output("blob"),
    filename: createPdfFilename(state),
    pageCount,
  };
};
