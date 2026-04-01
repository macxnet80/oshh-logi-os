"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import QRCode from "qrcode";

export default function FreelancerQrPanel() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [checkinUrl, setCheckinUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/checkin`;
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: { dark: "#0A0A0A", light: "#FFFFFF" },
    })
      .then((u) => {
        if (cancelled) return;
        setDataUrl(u);
        setCheckinUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError("QR-Code konnte nicht erzeugt werden.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "logi-os-checkin-qr.png";
    a.click();
  };

  const printQr = () => {
    if (!dataUrl) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head><title>Check-in QR</title>
      <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 24px; }
        img { max-width: 280px; height: auto; }
        p { margin-top: 16px; color: #333; font-size: 14px; }
      </style></head><body>
      <h1>logi-OS Check-in</h1>
      <img src="${dataUrl}" alt="QR-Code Check-in" />
      <p>${checkinUrl.replace(/</g, "")}</p>
      <script>window.onload = function() { window.print(); }</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-orendt-black">
        QR-Code für den Eingang
      </h2>
      <p className="font-body text-sm text-gray-600">
        Ein zentraler Code für alle Freelancer. Nach dem Scannen PIN eingeben.
      </p>
      {error ? (
        <p className="font-body text-sm text-status-occupied">{error}</p>
      ) : null}
      {dataUrl ? (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- Data-URL aus qrcode */}
          <img
            src={dataUrl}
            alt="QR-Code zur Check-in-Seite"
            className="rounded-xl border border-gray-200 bg-white p-2 shadow-subtle"
            width={280}
            height={280}
          />
          <div className="space-y-3 text-left w-full max-w-sm">
            <p className="font-body text-xs text-gray-500 break-all">
              {checkinUrl}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={downloadPng}>
                PNG herunterladen
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={printQr}
              >
                Drucken
              </Button>
            </div>
          </div>
        </div>
      ) : !error ? (
        <p className="font-body text-sm text-gray-500">QR-Code wird geladen …</p>
      ) : null}
    </div>
  );
}
