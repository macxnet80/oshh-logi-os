"use client";

import Button from "@/components/ui/Button";

export type ZeitenExportRow = {
  name: string;
  checkIn: string;
  checkOut: string;
  durationMin: number | null;
};

function escapeCsvCell(s: string) {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export default function ZeitenExportButton({ rows }: { rows: ZeitenExportRow[] }) {
  const download = () => {
    const header = ["Name", "Check-in", "Check-out", "Dauer (Min)"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          escapeCsvCell(r.name),
          escapeCsvCell(r.checkIn),
          escapeCsvCell(r.checkOut),
          r.durationMin === null ? "" : String(r.durationMin),
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

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={download}
      disabled={rows.length === 0}
    >
      CSV exportieren
    </Button>
  );
}
