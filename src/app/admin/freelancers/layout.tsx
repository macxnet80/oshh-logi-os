import Link from "next/link";
import { requireLogiAdmin } from "@/lib/authz-server";

export default async function AdminFreelancersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireLogiAdmin();

  return (
    <div className="space-y-8">
      <nav
        className="flex flex-wrap gap-2 border-b border-gray-200 pb-3"
        aria-label="Freelancer-Bereich"
      >
        <Link
          href="/admin/freelancers"
          className="font-body text-sm font-semibold px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-orendt-black transition-colors"
        >
          Übersicht
        </Link>
        <Link
          href="/admin/freelancers/zeiten"
          className="font-body text-sm font-semibold px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-orendt-black transition-colors"
        >
          Zeiten
        </Link>
      </nav>
      {children}
    </div>
  );
}
