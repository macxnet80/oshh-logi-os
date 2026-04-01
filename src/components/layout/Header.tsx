"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  LogIn,
  LogOut,
  Menu,
  UserCheck,
  Users,
  X,
} from "lucide-react";

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/absences", label: "Abwesenheiten", icon: CalendarDays },
];

const pollsNewNavItem = {
  href: "/polls/new",
  label: "Abstimmungen",
  icon: BarChart3,
};

const adminNavItems = [
  {
    href: "/admin/users",
    label: "Benutzer & Teams",
    icon: Users,
  },
  {
    href: "/admin/freelancers",
    label: "Freelancer",
    icon: UserCheck,
  },
];

export default function Header({
  userEmail,
  hasAppAccess,
  isAdmin,
  canCreatePolls,
}: {
  userEmail: string | null;
  hasAppAccess: boolean;
  /** /admin/users — Profil-Admin oder logi_user_access.is_admin */
  isAdmin: boolean;
  /** /polls/new — Profil-Admin oder logi_user_access.is_admin */
  canCreatePolls: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const navItems = [
    ...(hasAppAccess ? mainNavItems : []),
    ...(canCreatePolls ? [pollsNewNavItem] : []),
    ...(isAdmin ? adminNavItems : []),
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (pathname.startsWith("/checkin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-gray-50/85 backdrop-blur-[20px] border-b border-black/6">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center shrink-0">
            <div className="h-10 px-4 py-2 bg-orendt-black rounded-xl flex items-center justify-center">
              <Image
                src="/orendtstudios_logo.png"
                alt="Orendt Studios Logo"
                width={140}
                height={40}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-11 h-11 rounded-xl text-orendt-black hover:bg-gray-100 transition-colors cursor-pointer"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label="Menü öffnen"
          >
            <Menu className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`
          fixed inset-0 z-[55] bg-orendt-black/40 backdrop-blur-sm
          transition-opacity duration-200 ease-out
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      {/* Side panel */}
      <div
        id={panelId}
        role="dialog"
        aria-modal={open}
        aria-label="Navigation"
        aria-hidden={!open}
        inert={!open || undefined}
        className={`
          fixed top-0 right-0 z-[60] h-full w-full max-w-sm
          bg-white shadow-xl border-l border-gray-200
          flex flex-col
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full pointer-events-none"}
        `}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 shrink-0">
          <span className="font-display text-sm font-semibold text-orendt-black">
            Menü
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-orendt-black transition-colors cursor-pointer"
            aria-label="Menü schließen"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Hauptnavigation">
          {!hasAppAccess && userEmail ? (
            <p className="px-4 py-2 font-body text-sm text-gray-500">
              Für logi-OS ist keine Freigabe hinterlegt (Logistik-Team oder
              Admin).
            </p>
          ) : null}
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin/freelancers"
                  ? pathname.startsWith("/admin/freelancers")
                  : item.href === "/admin/users"
                    ? pathname.startsWith("/admin/users")
                    : pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      font-display text-sm font-medium
                      transition-colors duration-200
                      ${
                        isActive
                          ? "bg-orendt-black text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-orendt-black"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-gray-100 p-4 space-y-3">
          {userEmail ? (
            <>
              <p className="font-body text-xs text-gray-500 px-1 truncate" title={userEmail}>
                {userEmail}
              </p>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-semibold bg-orendt-black text-white hover:bg-orendt-accent hover:text-orendt-black transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Anmelden
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
