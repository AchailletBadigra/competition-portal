"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, PlusCircle, Users, Star } from "lucide-react";
import { clsx } from "clsx";

const links = [
  { href: "/", label: "Competitions", icon: Trophy },
  { href: "/competitions/new", label: "New Competition", icon: PlusCircle },
  { href: "/entries", label: "Entries", icon: Users },
  { href: "/winners", label: "Winners", icon: Star },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Competition Portal</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              pathname === href
                ? "bg-slate-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
