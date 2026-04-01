"use client";

import { useTransition } from "react";
import Button from "@/components/ui/Button";
import { deferAfterClick } from "@/lib/defer-inp";
import { deleteFreelancer, toggleFreelancerActive } from "./actions";

export default function FreelancerRowActions({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2 justify-end">
      <form action={toggleFreelancerActive.bind(null, id, !isActive)}>
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {isActive ? "Deaktivieren" : "Aktivieren"}
        </Button>
      </form>
      <Button
        type="button"
        size="sm"
        variant="danger"
        disabled={pending}
        onClick={() => {
          deferAfterClick(() => {
            if (
              !confirm(
                "Diesen Freelancer und alle zugehörigen Zeiten wirklich löschen?"
              )
            ) {
              return;
            }
            startTransition(() => {
              void deleteFreelancer(id);
            });
          });
        }}
      >
        Löschen
      </Button>
    </div>
  );
}
