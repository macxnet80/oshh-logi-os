import Card from "@/components/ui/Card";

export default function KeinZugangPage() {
  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <Card className="p-8">
        <h1 className="font-display text-2xl font-bold text-orendt-black mb-2">
          Kein Zugang zu logi-OS
        </h1>
        <p className="font-body text-gray-600 mb-4">
          Zugang haben das Team{" "}
          <strong className="text-orendt-black">Logistik</strong>,{" "}
          <strong className="text-orendt-black">logi-OS-Admins</strong> sowie
          Konten mit <strong className="text-orendt-black">Admin-Rolle</strong>{" "}
          in der Haupt-App (<code className="text-xs">profiles.role = admin</code>
          ). Dein Konto erfüllt derzeit keine dieser Bedingungen.
        </p>
        <p className="font-body text-sm text-gray-500 mb-6">
          Bitte wende dich an eine Administratorin oder einen Administrator — in
          der Benutzerverwaltung kann dir das Team Logistik oder die Admin-Rolle
          zugewiesen werden.
        </p>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="font-body text-sm font-semibold text-orendt-black hover:underline"
          >
            Mit anderem Konto anmelden
          </button>
        </form>
        <p className="mt-4 font-body text-xs text-gray-400">
          Nutzerkonten werden zentral verwaltet; hier werden nur Team-Zuordnungen
          für logi-OS gespeichert.
        </p>
      </Card>
    </div>
  );
}
