"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Button from "@/components/ui/Button";

export type ZeitenExportRow = {
  name: string;
  checkIn: string;
  checkOut: string;
  /** z. B. "02:30" oder null wenn offen */
  durationHhMm: string | null;
};

export type ZeitenExportMeta = {
  /** z. B. „diese Woche“, „dieser Monat“ */
  periodLabel: string;
  /** Check-in-Zeitraum der Abfrage, lesbar formatiert */
  rangeText: string;
  /** „Alle Freelancer“ oder der gewählte Name */
  freelancerScope: string;
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

  const margin = 14;
  let y = 16;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Freelancer-Zeiten", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Zeitraum: ${meta.periodLabel}`, margin, y);
  y += 5;
  doc.text(meta.rangeText, margin, y);
  y += 5;
  doc.text(`Freelancer: ${meta.freelancerScope}`, margin, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Name", "Check-in", "Check-out", "Dauer (hh:MM)"]],
    body: rows.map((r) => [
      r.name,
      r.checkIn,
      r.checkOut,
      r.durationHhMm ?? "—",
    ]),
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: {
      fillColor: [33, 33, 33],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: margin, right: margin },
  });

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
    const header = ["Name", "Check-in", "Check-out", "Dauer (hh:MM)"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          escapeCsvCell(r.name),
          escapeCsvCell(r.checkIn),
          escapeCsvCell(r.checkOut),
          r.durationHhMm === null ? "" : r.durationHhMm,
        ].join(",")
      ),
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
