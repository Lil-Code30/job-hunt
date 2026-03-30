"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/firebase/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/jobs", label: "Jobs" },
  { href: "/stats", label: "Stats" },
  { href: "/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-900/50">
        <div className="flex h-14 items-center border-b border-zinc-800 px-4">
          <Link href="/jobs" className="font-semibold text-brand">
            Job Hunt
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? "bg-brand/10 text-brand"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand/20 flex items-center justify-center text-sm font-medium text-brand">
            {user.email?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={() => logout()}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
