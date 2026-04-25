"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { updateFreelancerBilling } from "./actions";
import { formatEur, hourlyRateFromDb } from "@/app/admin/freelancers/zeiten/money-format";

function rateInputValueFromDb(v: unknown): string {
  const n = hourlyRateFromDb(v);
  if (n === 0) return "";
  return String(n).replace(".", ",");
}

export default function FreelancerBillingEditor({
  id,
  initialHourlyRateEur,
  initialInputVatDeductible,
}: {
  id: string;
  initialHourlyRateEur: unknown;
  initialInputVatDeductible: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    const rate = hourlyRateFromDb(initialHourlyRateEur);
    return (
      <div className="flex flex-col gap-1 min-w-[8rem]">
        <span className="text-orendt-black">
          {formatEur(rate)}
          <span className="text-gray-500 font-normal"> /h</span>
        </span>
        <span className="text-xs text-gray-600">
          {initialInputVatDeductible ? "Vorsteuer: ja" : "Vorsteuer: nein"}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-body text-xs font-semibold text-gray-600 hover:text-orendt-black underline underline-offset-2 self-start"
        >
          Bearbeiten
        </button>
      </div>
    );
  }

  return (
    <form action={updateFreelancerBilling} className="flex flex-col gap-2 min-w-[10rem] max-w-xs">
      <input type="hidden" name="id" value={id} />
      <div>
        <label
          htmlFor={`rate-${id}`}
          className="font-body text-xs font-medium text-gray-600 block mb-1"
        >
          Stundensatz (€/h, netto)
        </label>
        <Input
          id={`rate-${id}`}
          name="hourly_rate_eur"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          defaultValue={rateInputValueFromDb(initialHourlyRateEur)}
          autoComplete="off"
          className="w-full"
        />
      </div>
      <label className="flex items-center gap-2 font-body text-sm text-orendt-black cursor-pointer">
        <input
          type="checkbox"
          name="input_vat_deductible"
          value="on"
          defaultChecked={initialInputVatDeductible}
          className="rounded border-gray-300"
        />
        Vorsteuer abzugsfähig
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          Speichern
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setEditing(false)}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
