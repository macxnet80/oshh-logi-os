import type { Metadata } from "next";
import CheckinTerminal from "@/components/checkin/CheckinTerminal";

export const metadata: Metadata = {
  title: "Check-in — logi-OS",
  description: "Einchecken oder auschecken mit PIN",
};

export default function CheckinPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-stretch -mx-6 lg:-mx-12 px-4 sm:px-8 -my-8 py-8 bg-gray-50/80 rounded-2xl border border-gray-100">
      <CheckinTerminal />
    </div>
  );
}
