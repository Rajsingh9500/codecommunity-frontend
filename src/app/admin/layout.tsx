"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Users", path: "/admin/users", icon: "👤" },
    { name: "Projects", path: "/admin/projects", icon: "📂" },
    { name: "Notifications", path: "/admin/notifications", icon: "🔔" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white mt-20">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-200 dark:bg-gray-800 p-4">
        <h2 className="text-xl font-bold mb-6 text-emerald-500">⚡ Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition ${
                pathname === item.path
                  ? "bg-emerald-500 text-white font-semibold"
                  : "hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <span>{item.icon}</span> {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
