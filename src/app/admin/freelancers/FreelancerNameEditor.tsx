"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { updateFreelancerName } from "./actions";

const MAX_LENGTH = 120;

export default function FreelancerNameEditor({
  id,
  initialName,
}: {
  id: string;
  initialName: string;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium text-orendt-black">{initialName}</span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-body text-xs font-semibold text-gray-600 hover:text-orendt-black underline underline-offset-2"
        >
          Bearbeiten
        </button>
      </div>
    );
  }

  return (
    <form
      action={updateFreelancerName}
      className="flex flex-col gap-2 min-w-0 max-w-md"
    >
      <input type="hidden" name="id" value={id} />
      <Input
        name="name"
        defaultValue={initialName}
        required
        maxLength={MAX_LENGTH}
        autoComplete="off"
        autoFocus
        aria-label="Name bearbeiten"
        className="w-full"
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
