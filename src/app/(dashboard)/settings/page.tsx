"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { logout } from "@/lib/firebase/auth";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">Manage your account</p>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300">Account</h2>
        <div className="flex items-center gap-4">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              className="h-10 w-10 rounded-full"
            />
          )}
          <div>
            <p className="text-sm font-medium text-gray-200">
              {user?.displayName ?? "User"}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-xl border border-red-900 bg-red-950 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900 transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-300">
          Keyboard shortcuts
        </h2>
        <div className="space-y-2">
          {[
            ["Open search", "⌘ K"],
            ["New job", "⌘ N"],
          ].map(([label, keys]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{label}</span>
              <kbd className="rounded border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-400 font-mono">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
