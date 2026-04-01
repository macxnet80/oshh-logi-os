import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createFreelancer } from "./actions";
import FreelancerNameEditor from "./FreelancerNameEditor";
import FreelancerQrPanel from "./FreelancerQrPanel";
import FreelancerRowActions from "./FreelancerRowActions";

type PageProps = {
  searchParams: Promise<{ ok?: string; err?: string }>;
};

const errMessages: Record<string, string> = {
  name_empty: "Bitte einen Namen eingeben.",
  name_too_long: "Der Name ist zu lang (max. 120 Zeichen).",
  create_failed: "Freelancer konnte nicht angelegt werden.",
  update_failed: "Änderung konnte nicht gespeichert werden.",
  pin_failed: "PIN konnte nicht neu gesetzt werden.",
  delete_failed: "Löschen fehlgeschlagen.",
  invalid: "Ungültige Anfrage.",
};

const okMessages: Record<string, string> = {
  created: "Freelancer wurde angelegt.",
  updated: "Gespeichert.",
  edited: "Name wurde gespeichert.",
  pin: "Neuer PIN wurde gesetzt.",
  deleted: "Freelancer wurde gelöscht.",
};

export default async function AdminFreelancersPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: freelancers, error } = await supabase
    .from("freelancers")
    .select("id, name, pin, is_active, created_at")
    .order("name", { ascending: true });

  const errKey = params.err;
  const okKey = params.ok;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-orendt-black">
          Freelancer
        </h1>
        <p className="font-body text-sm text-gray-600 mt-1">
          PINs verwalten und{" "}
          <Link
            href="/admin/freelancers/zeiten"
            className="text-orendt-black underline underline-offset-2 hover:text-gray-600"
          >
            Zeiten einsehen
          </Link>
          .
        </p>
      </div>

      {okKey && okMessages[okKey] ? (
        <div
          className="rounded-xl border border-status-free bg-status-free-bg px-4 py-3 font-body text-sm text-orendt-black"
          role="status"
        >
          {okMessages[okKey]}
        </div>
      ) : null}

      {errKey && errMessages[errKey] ? (
        <div
          className="rounded-xl border border-status-occupied bg-status-occupied-bg px-4 py-3 font-body text-sm text-status-occupied"
          role="alert"
        >
          {errMessages[errKey]}
        </div>
      ) : null}

      {error ? (
        <p className="font-body text-sm text-status-occupied">
          Daten konnten nicht geladen werden: {error.message}
        </p>
      ) : null}

      <Card>
        <h2 className="font-display text-lg font-semibold text-orendt-black mb-4">
          Neuer Freelancer
        </h2>
        <form action={createFreelancer} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 min-w-0">
            <label htmlFor="fl-name" className="sr-only">
              Name
            </label>
            <Input
              id="fl-name"
              name="name"
              type="text"
              placeholder="Name"
              required
              maxLength={120}
              autoComplete="off"
              className="w-full"
            />
          </div>
          <Button type="submit" size="md">
            Anlegen
          </Button>
        </form>
        <p className="font-body text-xs text-gray-500 mt-2">
          Es wird automatisch eine vierstellige PIN vergeben.
        </p>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold text-orendt-black mb-4">
          Alle Freelancer
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] font-body text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold">PIN</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 pr-4 font-semibold text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {(freelancers ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-gray-500">
                    Noch keine Freelancer angelegt.
                  </td>
                </tr>
              ) : (
                (freelancers ?? []).map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 align-top">
                      <FreelancerNameEditor id={row.id} initialName={row.name} />
                    </td>
                    <td className="py-3 pr-4 font-mono tracking-widest">
                      {row.pin}
                    </td>
                    <td className="py-3 pr-4">
                      {row.is_active ? (
                        <span className="text-status-free font-medium">Aktiv</span>
                      ) : (
                        <span className="text-gray-500">Inaktiv</span>
                      )}
                    </td>
                    <td className="py-3 pl-2">
                      <FreelancerRowActions id={row.id} isActive={row.is_active} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <FreelancerQrPanel />
      </Card>
    </div>
  );
}
