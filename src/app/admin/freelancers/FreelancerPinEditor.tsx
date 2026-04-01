"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { updateFreelancerPin } from "./actions";

export default function FreelancerPinEditor({
  id,
  initialPin,
}: {
  id: string;
  initialPin: string;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono tracking-widest">{initialPin}</span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-body text-xs font-semibold text-gray-600 hover:text-orendt-black underline underline-offset-2"
        >
          PIN ändern
        </button>
      </div>
    );
  }

  return (
    <form
      action={updateFreelancerPin}
      className="flex flex-col gap-2 min-w-0 max-w-[14rem]"
    >
      <input type="hidden" name="id" value={id} />
      <Input
        name="pin"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        placeholder="4 Ziffern"
        defaultValue={initialPin}
        required
        autoComplete="off"
        autoFocus
        aria-label="Neue PIN"
        className="w-full font-mono tracking-widest"
      />
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
