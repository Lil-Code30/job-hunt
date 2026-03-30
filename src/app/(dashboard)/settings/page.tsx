"use client";

import { logout } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="font-semibold mb-4">Account</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Manage your account settings and preferences.
        </p>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="font-semibold mb-4">About</h2>
        <p className="text-sm text-zinc-400">
          Job Hunt v0.1.0 — Built with Next.js and Firebase.
        </p>
      </div>
    </div>
  );
}
