import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface BonExport {
  id: number;
  reference: string | null;
  type: "ENTREE" | "SORTIE";
  date_heure: string;
  secteur_nom: string | null;
  beneficiaire: string | null;
  source: string | null;
  utilisateur_username: string;
  lignes: {
    article_nom: string;
    quantite: number;
    article_unite: string;
  }[];
  created_at: string;
}

type RGB = [number, number, number];

const PRIMARY: RGB = [15, 76, 129]; // #0F4C81
const TEAL: RGB = [14, 124, 134]; // #0E7C86
const AMBER: RGB = [180, 83, 9]; // #B45309
const SLATE_900: RGB = [15, 23, 42];
const SLATE_500: RGB = [100, 116, 139];
const SLATE_400: RGB = [148, 163, 184];

const setDraw = (pdf: jsPDF, c: RGB) => pdf.setDrawColor(c[0], c[1], c[2]);
const setFill = (pdf: jsPDF, c: RGB) => pdf.setFillColor(c[0], c[1], c[2]);
const setText = (pdf: jsPDF, c: RGB) => pdf.setTextColor(c[0], c[1], c[2]);

export async function exportBonToPDF(bon: BonExport): Promise<void> {
  const isEntree = bon.type === "ENTREE";
  const accent = isEntree ? TEAL : AMBER;

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;

  // --- En-tête ---
  setDraw(pdf, PRIMARY);
  pdf.setLineWidth(2);
  pdf.line(margin, 70, pageWidth - margin, 70);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  setText(pdf, PRIMARY);
  pdf.text("OverWatch", margin, 40);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  setText(pdf, SLATE_500);
  pdf.text("Centre Déo Gracias — Analyses Biomédicales", margin, 54);

  const badgeLabel = isEntree ? "BON D'ENTRÉE" : "BON DE SORTIE";
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  const badgeWidth = pdf.getTextWidth(badgeLabel) + 20;
  setFill(pdf, accent);
  pdf.roundedRect(
    pageWidth - margin - badgeWidth,
    24,
    badgeWidth,
    18,
    3,
    3,
    "F",
  );
  pdf.setTextColor(255, 255, 255);
  pdf.text(badgeLabel, pageWidth - margin - badgeWidth / 2, 36, {
    align: "center",
  });

  pdf.setFont("courier", "bold");
  pdf.setFontSize(13);
  setText(pdf, SLATE_900);
  pdf.text(bon.reference || `#${bon.id}`, pageWidth - margin, 58, {
    align: "right",
  });

  // --- Infos ---
  let y = 95;
  const colWidth = (pageWidth - margin * 2) / 2;

  const infoBlock = (label: string, value: string, col: 0 | 1, row: 0 | 1) => {
    const x = margin + col * colWidth;
    const rowY = y + row * 40;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    setText(pdf, SLATE_400);
    pdf.text(label.toUpperCase(), x, rowY);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    setText(pdf, SLATE_900);
    pdf.text(value, x, rowY + 14);
  };

  infoBlock(
    "Date et heure",
    format(new Date(bon.date_heure), "dd MMMM yyyy à HH:mm", { locale: fr }),
    0,
    0,
  );
  infoBlock("Enregistré par", bon.utilisateur_username, 1, 0);

  if (isEntree) {
    infoBlock("Source / Fournisseur", bon.source || "—", 0, 1);
  } else {
    infoBlock("Secteur", bon.secteur_nom || "—", 0, 1);
    infoBlock("Bénéficiaire", bon.beneficiaire || "—", 1, 1);
  }

  y += 40 * 2 + 15;

  // --- Tableau ---
  const total = bon.lignes.reduce((sum, l) => sum + l.quantite, 0);

  autoTable(pdf, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Article", "Quantité", "Unité"]],
    body: bon.lignes.map((l) => [
      l.article_nom,
      String(l.quantite),
      l.article_unite,
    ]),
    foot: [[`Total : ${total} articles`, "", ""]],
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      textColor: SLATE_900,
      cellPadding: { top: 6, bottom: 6, left: 10, right: 10 },
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: SLATE_500,
      fontStyle: "bold",
      fontSize: 8.5,
      lineWidth: { bottom: 1 },
      lineColor: [226, 232, 240],
    },
    footStyles: {
      fillColor: [248, 250, 252],
      textColor: SLATE_900,
      fontStyle: "bold",
      fontSize: 9.5,
      lineWidth: { top: 1 },
      lineColor: [226, 232, 240],
    },
    columnStyles: {
      1: { halign: "right", font: "courier" },
    },
    bodyStyles: {
      lineWidth: { bottom: 0.5 },
      lineColor: [241, 245, 249],
    },
  });

  // --- Pied de page ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (pdf as any).lastAutoTable.finalY + 30;
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.line(margin, finalY, pageWidth - margin, finalY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setText(pdf, SLATE_400);
  pdf.text(
    `Document généré le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`,
    margin,
    finalY + 14,
  );
  pdf.text("OverWatch — Gestion de stock", pageWidth - margin, finalY + 14, {
    align: "right",
  });

  pdf.save(`${bon.reference || `bon-${bon.id}`}.pdf`);
}
