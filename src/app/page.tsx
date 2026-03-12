import { CalendarDays, Users, Clock, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Link from "next/link";

const stats = [
  {
    label: "Mitarbeiter",
    value: "5",
    icon: Users,
    color: "text-status-released",
    bgColor: "bg-status-released-bg",
  },
  {
    label: "Heute abwesend",
    value: "—",
    icon: CalendarDays,
    color: "text-status-occupied",
    bgColor: "bg-status-occupied-bg",
  },
  {
    label: "Diese Woche",
    value: "—",
    icon: Clock,
    color: "text-status-reserved",
    bgColor: "bg-status-reserved-bg",
  },
  {
    label: "Homeoffice heute",
    value: "—",
    icon: TrendingUp,
    color: "text-status-free",
    bgColor: "bg-status-free-bg",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-3xl font-bold text-orendt-black tracking-tight">
          Willkommen zurück!
        </h1>
        <p className="font-body text-gray-600 mt-1">
          Hier siehst du die aktuelle Übersicht deines Teams.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="font-body text-sm text-gray-500">
                    {stat.label}
                  </p>
                  <p className="font-display text-2xl font-bold text-orendt-black">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Action */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-orendt-black">
              Abwesenheitsplaner
            </h2>
            <p className="font-body text-sm text-gray-600 mt-0.5">
              Trage deine Abwesenheiten ein und sieh wer wann da ist.
            </p>
          </div>
          <Link
            href="/absences"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orendt-black text-white font-body font-semibold text-sm rounded-lg hover:bg-orendt-accent hover:text-orendt-black transition-all duration-200"
          >
            <CalendarDays className="w-4 h-4" />
            Zum Planer
          </Link>
        </div>
      </Card>
    </div>
  );
}
