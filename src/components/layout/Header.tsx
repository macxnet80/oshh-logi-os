"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/absences", label: "Abwesenheiten", icon: CalendarDays },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-gray-50/85 backdrop-blur-[20px] border-b border-black/6">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
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

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  font-display text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-orendt-black text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-orendt-black"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Area */}
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-orendt-black transition-all duration-200 cursor-pointer"
          aria-label="Abmelden"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline font-body text-sm">Abmelden</span>
        </button>
      </div>
    </header>
  );
}
