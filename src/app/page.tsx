import Link from "next/link";
import { CalendarDays, Users, Clock, TrendingUp, BarChart3 } from "lucide-react";
import Card from "@/components/ui/Card";
import FlexibleBooking from "@/components/parking/FlexibleBooking";
import PollVote from "@/components/polls/PollVote";
import { createClientIfConfigured } from "@/lib/supabase/server";
import { hasLogiAppAccess, isLogiPollCreator } from "@/lib/logi-app-access";
import { getActiveLogiPollsForDashboard } from "@/lib/polls/load-active-polls";

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

export default async function DashboardPage() {
  const supabase = await createClientIfConfigured();

  if (!supabase) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-orendt-black tracking-tight">
          logi-OS
        </h1>
        <p className="font-body text-gray-600 max-w-xl">
          Die Anwendung kann ohne vollständige Server-Konfiguration nicht
          geladen werden. Bitte die Umgebungsvariablen im Hosting prüfen (siehe
          Hinweis oben).
        </p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasAppAccess = false;
  let profileRole: string | null = null;
  let canCreatePolls = false;

  if (user) {
    const [{ data: access }, { data: profile }] = await Promise.all([
      supabase
        .from("logi_user_access")
        .select("team, is_admin")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    ]);

    profileRole = profile?.role ?? null;
    hasAppAccess = hasLogiAppAccess(access, profileRole);
    canCreatePolls = isLogiPollCreator(access ?? null, profileRole);
  }

  const flexibleUserId =
    user?.id && hasAppAccess && profileRole === "flexible" ? user.id : null;

  let dashboardPolls: Awaited<
    ReturnType<typeof getActiveLogiPollsForDashboard>
  > = [];
  if (user?.id && hasAppAccess) {
    try {
      dashboardPolls = await getActiveLogiPollsForDashboard(
        supabase,
        user.id
      );
    } catch {
      dashboardPolls = [];
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-3xl font-bold text-orendt-black tracking-tight">
          Willkommen zurück!
        </h1>
        <p className="font-body text-gray-600 mt-1">
          {flexibleUserId
            ? "Buche deinen Parkplatz für heute direkt im Dashboard."
            : "Hier siehst du die aktuelle Übersicht deines Teams."}
        </p>
      </div>

      {flexibleUserId ? (
        <Card>
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-orendt-black">
              Parkplatz buchen
            </h2>
            <p className="font-body text-sm text-gray-600 mt-0.5">
              Flexible Nutzer buchen nach dem Prinzip „first come, first served“.
            </p>
          </div>
          <FlexibleBooking userId={flexibleUserId} />
        </Card>
      ) : null}

      {dashboardPolls.length > 0 ? (
        <section className="space-y-4" aria-labelledby="dashboard-polls-heading">
          <h2
            id="dashboard-polls-heading"
            className="font-display text-xl font-semibold text-orendt-black"
          >
            Aktive Abstimmungen
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {dashboardPolls.map((p) => (
              <Card key={p.pollId}>
                <p className="font-display text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  {p.title}
                </p>
                <PollVote
                  variant="compact"
                  pollId={p.pollId}
                  questionText={p.questionText}
                  options={p.options}
                  counts={p.counts}
                  totalSelections={p.totalSelections}
                  participantCount={p.participantCount}
                  hasVoted={p.hasVoted}
                  myChoices={p.myChoices}
                />
              </Card>
            ))}
          </div>
        </section>
      ) : null}

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

      {/* Quick Actions */}
      <div
        className={`grid gap-4 ${canCreatePolls ? "md:grid-cols-2" : "md:max-w-xl"}`}
      >
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
        {canCreatePolls ? (
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-orendt-black">
                  Abstimmungen verwalten
                </h2>
                <p className="font-body text-sm text-gray-600 mt-0.5">
                  Aktive Umfragen bearbeiten oder neue fürs Dashboard anlegen.
                </p>
              </div>
              <Link
                href="/polls/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orendt-black text-white font-body font-semibold text-sm rounded-lg hover:bg-orendt-accent hover:text-orendt-black transition-all duration-200"
              >
                <BarChart3 className="w-4 h-4" />
                Öffnen
              </Link>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
