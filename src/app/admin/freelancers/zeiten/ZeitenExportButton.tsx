"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Table } from "jspdf-autotable";
import Button from "@/components/ui/Button";

type JspdfWithAutotable = jsPDF & { lastAutoTable?: Table };

export type ZeitenExportRow = {
  name: string;
  checkIn: string;
  checkOut: string;
  /** z. B. "02:30" oder null wenn offen */
  durationHhMm: string | null;
  /** z. B. "80,00 €/h" */
  hourlyRateLabel: string;
  totalLabel: string;
  vatDeductibleLabel: string;
};

export type ZeitenExportMeta = {
  /** z. B. „diese Woche“, „dieser Monat“ */
  periodLabel: string;
  /** Check-in-Zeitraum der Abfrage, lesbar formatiert */
  rangeText: string;
  /** „Alle Freelancer“ oder der gewählte Name */
  freelancerScope: string;
  /** Summe netto, formatiert */
  sumNetEurLabel: string;
};

function escapeCsvCell(s: string) {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildPdf(rows: ZeitenExportRow[], meta: ZeitenExportMeta) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const margin = 12;
  let y = 14;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Freelancer-Zeiten", margin, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Zeitraum: ${meta.periodLabel}`, margin, y);
  y += 4.5;
  doc.text(meta.rangeText, margin, y);
  y += 4.5;
  doc.text(`Freelancer: ${meta.freelancerScope}`, margin, y);
  y += 4.5;
  doc.text(`Summe (netto): ${meta.sumNetEurLabel}`, margin, y);
  y += 8;

  const bodyData = rows.map((r) => [
    r.name,
    r.checkIn,
    r.checkOut,
    r.durationHhMm ?? "—",
    r.hourlyRateLabel,
    r.totalLabel,
    r.vatDeductibleLabel,
  ]);

  const cellPad = 1.8;
  const HEAD = [
    "Name",
    "Check-in",
    "Check-out",
    "Dauer (hh:MM)",
    "€/h (netto)",
    "Gesamt",
    "Vorsteuer",
  ] as const;
  const GESAMT_COL = HEAD.indexOf("Gesamt");

  /** Tatsächliche x/Breite der Gesamt-Zelle, wie autotable sie zeichnet (unabhängig von Spalten-Array-Sortierung) */
  let gesamtCellFromTable: { x: number; w: number } | null = null;

  autoTable(doc, {
    startY: y,
    head: [Array.from(HEAD)],
    body: bodyData,
    styles: {
      fontSize: 8,
      cellPadding: cellPad,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [33, 33, 33],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: margin, right: margin },
    /* Nach dem Zeichnen: letzte bekannte Position der Spalte „Gesamt“ (Kopf- oder letzte Datenzeile) */
    didDrawCell: (data) => {
      if (
        data.column.index === GESAMT_COL &&
        (data.section === "head" || data.section === "body")
      ) {
        gesamtCellFromTable = { x: data.cell.x, w: data.cell.width };
      }
    },
  });

  const lastTable = (doc as JspdfWithAutotable).lastAutoTable;
  if (lastTable) {
    /* columns[] ist nicht garantiert nach column.index sortiert; für Breiten/sum immer sortieren */
    const cols = [...lastTable.columns].sort((a, b) => a.index - b.index);
    const m = lastTable.settings.margin;
    const yTop = lastTable.finalY ?? y;
    const lastBodyRow = lastTable.body[lastTable.body.length - 1];
    doc.setFontSize(8);
    const lineH = doc.getLineHeight();
    const tableW = cols.reduce((acc, c) => acc + c.width, 0);
    const labelText = "Summe (netto, abgeschlossene Zeiten):";
    const widthBeforeGesamt = cols
      .filter((c) => c.index < GESAMT_COL)
      .reduce((acc, c) => acc + c.width, 0);
    const labelMaxW = Math.max(6, widthBeforeGesamt - 2 * cellPad);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const labelLines = doc.splitTextToSize(labelText, labelMaxW);
    const minRowH = lastBodyRow && lastBodyRow.height > 0 ? lastBodyRow.height : 7;
    const sumRowH = Math.max(minRowH, 2 * cellPad + labelLines.length * lineH);
    const xLeft = m.left;
    /* Grauer Streifen in Tabellenbreite */
    doc.setFillColor(240, 240, 240);
    doc.rect(xLeft, yTop, tableW, sumRowH, "F");
    const yText0 = yTop + cellPad + 2.2;
    doc.setTextColor(20, 20, 20);
    doc.text(labelLines, xLeft + cellPad, yText0, { lineHeightFactor: 1.15 });
    doc.setFont("helvetica", "bold");
    const yNum =
      labelLines.length > 1 ? yTop + sumRowH / 2 + 1 : yText0;
    const gc =
      gesamtCellFromTable ?? {
        x: xLeft + widthBeforeGesamt,
        w: cols.find((c) => c.index === GESAMT_COL)?.width ?? 0,
      };
    /* Rechtsbündig in Zelle, ohne { align: "right" }: jsPDF 4+ interpretiert x bei right-align so,
       dass der Text in die nächste Spalte (Vorsteuer) rutscht. Stattdessen: linke Kante = rechte Zellkante − Textbreite. */
    const sumText = meta.sumNetEurLabel;
    const textW = doc.getTextWidth(sumText);
    const xTextRightAligned = gc.x + gc.w - cellPad - textW;
    doc.text(sumText, xTextRightAligned, yNum);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`freelancer-zeiten-${dateStr}.pdf`);
}

export default function ZeitenExportButton({
  rows,
  meta,
}: {
  rows: ZeitenExportRow[];
  meta: ZeitenExportMeta;
}) {
  const downloadCsv = () => {
    const header = [
      "Name",
      "Check-in",
      "Check-out",
      "Dauer (hh:MM)",
      "Stundensatz (netto)",
      "Gesamt (netto)",
      "Vorsteuer abzugsfähig",
    ];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          escapeCsvCell(r.name),
          escapeCsvCell(r.checkIn),
          escapeCsvCell(r.checkOut),
          r.durationHhMm === null ? "" : r.durationHhMm,
          escapeCsvCell(r.hourlyRateLabel),
          escapeCsvCell(r.totalLabel),
          escapeCsvCell(r.vatDeductibleLabel),
        ].join(",")
      ),
      [
        "Summe (netto)",
        "",
        "",
        "",
        "",
        meta.sumNetEurLabel,
        "",
      ].join(","),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `freelancer-zeiten-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    buildPdf(rows, meta);
  };

  const disabled = rows.length === 0;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={downloadCsv}
        disabled={disabled}
      >
        CSV exportieren
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={downloadPdf}
        disabled={disabled}
      >
        PDF exportieren
      </Button>
    </div>
  );
}
